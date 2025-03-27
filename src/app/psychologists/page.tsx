"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Avatar,
  Button,
  Input,
  Card,
  CardBody,
  Select,
  SelectItem,
  Slider,
} from "@heroui/react";
import { FaStar, FaUserDoctor, FaLock } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import MotionHeading from "@/components/MotionHeading";
import { BiFilterAlt } from "react-icons/bi";
import FilterButton from "@/components/FilterButton";

type Psychologist = {
  id: number;
  fullName: string;
  bio: string;
  averageRating: number;
  sessionPrice: number;
  specialization: {
    id: number;
    name: string;
  };
  imageUrl?: string;
};

type Specialization = {
  id: number;
  name: string;
};

type PsychologistFilter = {
  specialization?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
};

const PsychologistPage = () => {
  const router = useRouter();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [filters, setFilters] = useState<PsychologistFilter>({});
  const [activeFilters, setActiveFilters] = useState<PsychologistFilter>({});
  const [priceValue, setPriceValue] = useState([100000, 500000]);
  const [ratingValue, setRatingValue] = useState(0);

  const fetchPsychologists = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      // Construct query params
      const queryParams = new URLSearchParams();
      queryParams.append("Status", "Enabled");

      if (activeFilters.searchTerm) {
        queryParams.append("SearchName", activeFilters.searchTerm);
      }

      if (activeFilters.specialization) {
        queryParams.append(
          "SpecializationId",
          activeFilters.specialization.toString()
        );
      }

      const API_URL = `${
        process.env.NEXT_PUBLIC_API_URL
      }/identities/accounts/psychologists?${queryParams.toString()}`;

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        console.log("Unauthorized");
        setUnauthorized(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Client-side filtering for properties not supported by the API
      let filteredData = data.data;

      if (activeFilters.minRating !== undefined) {
        filteredData = filteredData.filter(
          (p: Psychologist) => p.averageRating >= activeFilters.minRating!
        );
      }

      if (
        activeFilters.minPrice !== undefined &&
        activeFilters.maxPrice !== undefined
      ) {
        filteredData = filteredData.filter(
          (p: Psychologist) =>
            p.sessionPrice >= activeFilters.minPrice! &&
            p.sessionPrice <= activeFilters.maxPrice!
        );
      }

      setPsychologists(filteredData);
    } catch (err) {
      console.log(err);
      setUnauthorized(true);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  const fetchSpecializations = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/specializations`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    console.log(data);
    setSpecializations(data.data);
  }, []);

  useEffect(() => {
    fetchPsychologists();
    fetchSpecializations();
  }, [fetchPsychologists, fetchSpecializations]);

  const handleFilterChange = (
    key: keyof PsychologistFilter,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
  };

  const resetFilters = () => {
    const defaultFilters: PsychologistFilter = {};
    setPriceValue([100000, 500000]);
    setRatingValue(0);
    setSearchTerm("");
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
  };

  const handlePriceChange = (values: number[]) => {
    setPriceValue(values);
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  };

  const handleRatingChange = (value: number) => {
    setRatingValue(value);
    setFilters((prev) => ({ ...prev, minRating: value }));
  };

  return (
    <>
      <div
        className="relative bg-cover bg-center text-white py-16 px-6"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/ddewgbug1/image/upload/v1742826548/smt6861krglkqtfisr98.jpg')`,
        }}
      >
        <MotionHeading className="text-white font-noto-sans mt-5 text-center">
          Các chuyên gia tâm lí
        </MotionHeading>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <FilterButton
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {showFilters && (
          <Card className="mb-8 shadow-md">
            <CardBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Input
                    label="Tìm theo tên chuyên gia"
                    type="text"
                    value={filters.searchTerm || ""}
                    onChange={(e) =>
                      handleFilterChange("searchTerm", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <Select
                    label="Lĩnh vực chuyên môn"
                    name="specialization"
                    value={filters.specialization?.toString() || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value)
                        : undefined;
                      handleFilterChange("specialization", value);
                    }}
                    className="w-full"
                    startContent={<BiFilterAlt />}
                  >
                    {specializations.map((spec) => (
                      <SelectItem key={spec.id} value={spec.id.toString()}>
                        {spec.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div>
                  <Slider
                    className="max-w-md"
                    value={priceValue}
                    formatOptions={{ style: "currency", currency: "VND" }}
                    label="Giá cuộc hẹn"
                    maxValue={500000}
                    minValue={100000}
                    step={10000}
                    onChange={(value) => handlePriceChange(value as number[])}
                  />
                </div>

                <div>
                  <Slider
                    className="max-w-md"
                    value={ratingValue}
                    label="Đánh giá từ ⭐ trở lên"
                    step={0.5}
                    minValue={0}
                    maxValue={5}
                    onChange={(value) => handleRatingChange(value as number)}
                    marks={[
                      {
                        value: 1,
                        label: "1⭐",
                      },
                      {
                        value: 2,
                        label: "2⭐",
                      },
                      {
                        value: 3,
                        label: "3⭐",
                      },
                      {
                        value: 4,
                        label: "4⭐",
                      },
                      {
                        value: 5,
                        label: "5⭐",
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button color="default" onPress={resetFilters}>
                  Đặt lại
                </Button>
                <Button color="primary" onPress={applyFilters}>
                  Áp dụng
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
        {/* <div className="flex w-full flex-wrap">
          <Input
            label="🔍Tên chuyên gia‍"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> */}

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        {unauthorized ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded-md flex flex-col items-center">
            <FaLock className="text-red-500 text-2xl mb-2" />
            <p className="text-lg font-semibold">
              You need to log in to view psychologists.
            </p>
            <Button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
              onPress={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {psychologists.map((psychologist) => (
              <div
                key={psychologist.id}
                className="bg-fifth-color shadow-2xl p-4 my-6 border-2 border-black rounded-xl"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      src={psychologist.imageUrl || "/default-avatar.png"}
                      alt={psychologist.fullName}
                      className="w-32 h-32 rounded-md object-cover border-2 border-blue-500"
                    />
                    <div>
                      <h2 className="text-lg font-semibold flex items-center gap-1">
                        <FaUserDoctor className="text-primary-blue" />{" "}
                        {psychologist.fullName}
                      </h2>
                      <p className="text-medium">
                        {psychologist.specialization.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="mb-2 text-right">
                      <p className="flex font-semibold items-center gap-1">
                        Rating: {psychologist.averageRating}{" "}
                        <FaStar className="text-yellow-300" />
                      </p>
                      <p className="mt-1 font-semibold text-second-color">
                        Price: {psychologist.sessionPrice.toLocaleString()} VND
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="bordered"
                        className="w-32 text-sm bg-white"
                        onPress={() =>
                          router.push(
                            `/psychologists/details/${psychologist.id}`
                          )
                        }
                      >
                        View Detail
                      </Button>
                      <Button
                        className="w-32 text-sm bg-purple-600"
                        onPress={() =>
                          router.push(`/psychologists/${psychologist.id}`)
                        }
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PsychologistPage;
