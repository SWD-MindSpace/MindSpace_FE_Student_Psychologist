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
import { FaStar, FaUserDoctor } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { BiFilterAlt } from "react-icons/bi";
import FilterButton from "@/components/FilterButton";
import { Psychologist } from "@/types/psychologist";
import { FaCalendarAlt } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MotionHeading from "@/components/MotionHeading";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [filters, setFilters] = useState<PsychologistFilter>({});
  const [activeFilters, setActiveFilters] = useState<PsychologistFilter>({});
  const [maxSessionPrice, setMaxSessionPrice] = useState(500000);
  const [priceValue, setPriceValue] = useState([100000, 500000]);
  const [ratingValue, setRatingValue] = useState(0);

  const images = [
    "https://res.cloudinary.com/ddewgbug1/image/upload/v1743185617/hjgjff6ajjys9hwbmryq.jpg",
    "https://res.cloudinary.com/ddewgbug1/image/upload/v1743185766/y9invcdd1q6q8jopuuzr.jpg",
  ];

  const fetchPsychologists = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
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

      // Find the largest session price
      if (filteredData.length > 0) {
        const largestPrice = Math.max(
          ...filteredData.map((p: Psychologist) => p.sessionPrice)
        );
        // Add 100000 for some buffer and round to nearest 100000
        const roundedMaxPrice = Math.ceil(largestPrice / 100000) * 100000;
        setMaxSessionPrice(roundedMaxPrice);
        // Update priceValue if the current max is less than the largest price
        setPriceValue((prev) => [prev[0], roundedMaxPrice]);
      }

      setPsychologists(filteredData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters]);

  const fetchSpecializations = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
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
    setPriceValue([100000, maxSessionPrice]);
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
      <div className="relative w-full h-[350px]">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Navigation]}
          className="w-full h-full"
        >
          {images.map((src, index) => (
            <SwiperSlide key={index}>
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-opacity-100"
                style={{ backgroundImage: `url('${src}')` }}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-50 font-bevnpro">
          <MotionHeading className="text-4xl font-semibold tracking-wide">
            Tìm kiếm <span className="text-blue-300">Chuyên gia Tâm lý</span>
          </MotionHeading>
          <MotionHeading className="text-xl mt-2">
            Hãy kết nối với các chuyên gia hàng đầu để chăm sóc sức khỏe tinh
            thần của bạn.
          </MotionHeading>
        </div>
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
                    maxValue={maxSessionPrice}
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

        {loading && <p className="text-center text-gray-500">Loading...</p>}

        <div className="flex flex-col gap-4">
          {psychologists.map((psychologist) => (
            <div
              key={psychologist.id}
              className="bg-seventh-color shadow-md p-4 my-6 rounded-xl hover:scale-105 transition-all"
            >
              <div className="grid grid-cols-2">
                <div className="flex items-center gap-5">
                  <Avatar
                    src={
                      psychologist.imageUrl ||
                      "https://randomuser.me/api/portraits/men/1.jpg"
                    }
                    alt={psychologist.fullName}
                    className="w-32 h-32 rounded-md object-cover"
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
                      Đánh giá: {psychologist.averageRating}{" "}
                      <FaStar className="text-yellow-300" />
                    </p>
                    <p className="mt-1 font-bold">
                      Giá: {psychologist.sessionPrice.toLocaleString()} VND
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="bordered"
                      className="w-32 text-sm bg-white"
                      onPress={() =>
                        router.push(`/psychologists/details/${psychologist.id}`)
                      }
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      className="w-32 text-sm text-white bg-secondary-blue"
                      onPress={() =>
                        router.push(`/psychologists/${psychologist.id}`)
                      }
                    >
                      <FaCalendarAlt />
                      Đặt lịch
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PsychologistPage;
