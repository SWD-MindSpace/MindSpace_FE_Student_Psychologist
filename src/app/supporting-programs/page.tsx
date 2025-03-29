"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Image,
  Pagination,
  Divider,
} from "@heroui/react";
import { Toaster } from "react-hot-toast";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { registerForProgram } from "@/lib/utils";
import MotionHeading from "@/components/MotionHeading";

interface SupportingProgram {
  id: number;
  title: string;
  thumbnailUrl: string;
  pdffileUrl: string;
  maxQuantity: number;
  city: string;
  street: string;
  ward: string;
  province: string;
  isActive: boolean;
  startDateAt: string;
}

export default function SupportingPrograms() {
  const [allPrograms, setAllPrograms] = useState<SupportingProgram[]>([]);
  const [registeredProgramIds, setRegisteredProgramIds] = useState<number[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      try {
        const programsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/supporting-programs?pageIndex=1&pageSize=1000&MinQuantity=10&MaxQuantity=100&IsActive=true`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken || ""}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!programsResponse.ok) {
          throw new Error("Failed to fetch programs");
        }
        const programsData = await programsResponse.json();

        // Filter only active programs
        let availablePrograms = programsData.data.filter((p: SupportingProgram) => p.isActive);

        // If user is logged in, fetch registered programs and filter
        if (accessToken && userId) {
          const registeredResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/supporting-programs/history?StudentId=${userId}&pageIndex=1&pageSize=1000`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!registeredResponse.ok) {
            throw new Error("Failed to fetch registered programs");
          }
          const registeredData = await registeredResponse.json();
          const registeredIds = registeredData.data.map(
            (p: SupportingProgram) => p.id
          );
          setRegisteredProgramIds(registeredIds);

          availablePrograms = availablePrograms.filter(
            (program: SupportingProgram) => !registeredIds.includes(program.id)
          );
        }

        setAllPrograms(availablePrograms);
        setTotalPages(Math.ceil(availablePrograms.length / pageSize));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle registration and update state
  const handleRegister = async (programId: number) => {
    await registerForProgram(programId);
    // After successful registration, update registeredProgramIds and refilter
    setRegisteredProgramIds((prev) => [...prev, programId]);
    const updatedPrograms = allPrograms.filter(
      (p) => ![...registeredProgramIds, programId].includes(p.id)
    );
    setAllPrograms(updatedPrograms);
    setTotalPages(Math.ceil(updatedPrograms.length / pageSize));

    const currentPagePrograms = updatedPrograms.slice(
      (pageIndex - 1) * pageSize,
      pageIndex * pageSize
    );
    if (currentPagePrograms.length === 0 && pageIndex > 1) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const currentPrograms = allPrograms.slice(
    (pageIndex - 1) * pageSize,
    pageIndex * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="py-16 px-10 mb-10 rounded-xl max-w-7xl mx-auto flex gap-12 items-center">
        <div className="w-1/2">
          <MotionHeading className="text-5xl font-bold leading-tight">
            Chương trình hỗ trợ
          </MotionHeading>
          <MotionHeading className="mt-4 text-lg font-noto-sans font-normal">
            Tìm hiểu các chương trình hỗ trợ tâm lý được thiết kế để giúp bạn
            cải thiện sức khỏe tinh thần và vượt qua thử thách trong cuộc sống.
            Chúng tôi mang đến các giải pháp phù hợp để bạn có thể tiếp cận sự
            hỗ trợ chuyên nghiệp một cách dễ dàng.
          </MotionHeading>
        </div>

        <div className="w-1/2 flex justify-end">
          <MotionHeading>
            <Image
              src="https://res.cloudinary.com/ddewgbug1/image/upload/v1741982520/trnwnxefanvohfwdhapz.avif"
              alt="Chương trình hỗ trợ"
              className="w-full max-w-[600px] h-auto"
            />
          </MotionHeading>
        </div>
      </div>

      <Divider className="h-2 bg-black w-1/2 mx-auto my-10" />

      {loading ? (
        <div className="flex justify-center">
          <Spinner size="lg" color="primary" />
        </div>
      ) : (
        <>
          {localStorage.getItem("accessToken") &&
            allPrograms.length === 0 &&
            registeredProgramIds.length > 0 ? (
            <p className="text-center text-xl text-gray-600">
              You have already registered for all available programs.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {currentPrograms.map((program) => (
                  <Card
                    key={program.id}
                    className="p-4 bg-white shadow-md hover:shadow-lg transition duration-300 rounded-lg"
                  >
                    <Image
                      src={program.thumbnailUrl}
                      fallbackSrc="https://res.cloudinary.com/ddewgbug1/image/upload/v1743173783/azjjre8xhnqdp77q2pdk.jpg"
                      alt={program.city}
                      width={800}
                      height={400}
                    />
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <CardHeader className="text-xl font-bold font-bevnpro">
                          {program.city}
                        </CardHeader>
                        <CardBody className="font-noto-sans">
                          <p className="text-xl font-bevnpro">
                            {program.title}
                          </p>
                          <p className="text-gray-600 text-lg flex items-center">
                            <FaMapMarkerAlt className="mr-2" /> {program.street}
                          </p>
                          <p className="text-gray-600 text-lg flex items-center">
                            <FaCalendarAlt className="mr-2" /> {new Date(program.startDateAt.split("/").reverse().join("-")).toLocaleDateString()}
                          </p>
                          <p className="font-semibold flex items-center">
                            {program.isActive ? (
                              <FaCheckCircle className="text-green-500 mr-2" />
                            ) : (
                              <FaTimesCircle className="text-red-500 mr-2" />
                            )}
                            {program.isActive ? "Active" : "Inactive"}
                          </p>
                        </CardBody>
                      </div>

                      <div className="flex flex-col gap-4 font-noto-sans">
                        <Button
                          color="primary"
                          variant="solid"
                          className="px-4 py-2 text-sm rounded-full shadow-md hover:shadow-lg transition"
                          onPress={() =>
                            router.push(`/supporting-programs/${program.id}`)
                          }
                        >
                          Xem chi tiết
                        </Button>
                        {localStorage.getItem("accessToken") && (
                          <Button
                            color="success"
                            variant="solid"
                            className="px-4 py-2 text-sm rounded-full shadow-md hover:shadow-lg transition"
                            onPress={() => handleRegister(program.id)}
                          >
                            Đăng kí
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-6 py-4">
                  <Pagination
                    page={pageIndex}
                    total={totalPages}
                    onChange={(newPage: number) => setPageIndex(newPage)}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
