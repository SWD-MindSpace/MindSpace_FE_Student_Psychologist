"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  Spinner,
  Select,
  SelectItem,
  Pagination,
  Input,
} from "@heroui/react";
import { BiTime, BiVideo } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import MotionHeading from "@/components/MotionHeading";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Appointment } from "@/types/appointment";
import { AppointmentFilter } from "@/types/filters";
import { PaginatedResponse } from "@/types/paginatedResponse";
import FilterButton from "@/components/FilterButton";

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AppointmentFilter>({
    sort: "dateDesc",
    pageIndex: 1,
    pageSize: 5,
  });
  const [activeFilters, setActiveFilters] = useState<AppointmentFilter>({
    sort: "dateDesc",
    pageIndex: 1,
    pageSize: 5,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [psychologists, setPsychologists] = useState<string[]>([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [activeFilters]);

  useEffect(() => {
    fetchPsychologists();
  }, []);

  const fetchPsychologists = async () => {
    setLoadingPsychologists(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/identities/accounts/psychologists/names`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch psychologists");
      }

      const data = await response.json();
      setPsychologists(data);
      setLoadingPsychologists(false);
    } catch (err) {
      console.error("Error fetching psychologists:", err);
      setError("Failed to load psychologists. Please try again later.");
      toast.error("Failed to load psychologists");
      setPsychologists([]);
    } finally {
      setLoadingPsychologists(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Get user role from token and determine API endpoint
      const accessToken = localStorage.getItem("accessToken");
      const endpoint = "/appointments/user";

      // Construct query params
      const queryParams = new URLSearchParams();

      if (activeFilters.pageIndex) {
        queryParams.append("pageIndex", activeFilters.pageIndex.toString());
      }

      if (activeFilters.pageSize) {
        queryParams.append("pageSize", activeFilters.pageSize.toString());
      }

      if (activeFilters.startDate) {
        queryParams.append("startDate", activeFilters.startDate);
      }

      if (activeFilters.endDate) {
        queryParams.append("endDate", activeFilters.endDate);
      }

      if (activeFilters.sort) {
        queryParams.append("sort", activeFilters.sort);
      }

      if (activeFilters.psychologistName) {
        queryParams.append("psychologistName", activeFilters.psychologistName);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }${endpoint}?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken || ""}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data: PaginatedResponse<Appointment> = await response.json();
      console.log(data);
      setAppointments(data.data);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to load appointments. Please try again later.");
      toast.error("Failed to load appointments");
      setAppointments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof AppointmentFilter,
    value: string | number | undefined
  ) => {
    // Validate dates when either start date or end date changes
    if (key === "startDate" && filters.endDate && value) {
      // If start date is after end date, don't update
      if (new Date(value.toString()) > new Date(filters.endDate)) {
        toast.error("Start date cannot be after end date");
        return;
      }
    }

    if (key === "endDate" && filters.startDate && value) {
      // If end date is before start date, don't update
      if (new Date(value.toString()) < new Date(filters.startDate)) {
        toast.error("End date cannot be before start date");
        return;
      }
    }

    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    // Reset to first page when applying filters
    const filtersWithPage = { ...filters, pageIndex: 1 };
    setFilters(filtersWithPage);
    setActiveFilters(filtersWithPage);
  };

  const resetFilters = () => {
    const defaultFilters: AppointmentFilter = {
      sort: "dateDesc",
      pageIndex: 1,
      pageSize: 5,
      psychologistName: undefined,
    };
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...activeFilters, pageIndex: page };
    setActiveFilters(newFilters);
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time to a more readable format
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalCount / (activeFilters.pageSize || 5));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <MotionHeading className="mb-2">Appointment History</MotionHeading>
          <p className="text-gray-600">
            View your past and upcoming appointments
          </p>
        </div>

        <FilterButton
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {showFilters && (
          <Card className="mb-8 shadow-md">
            <CardBody>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-5">
                    Tìm lịch hẹn bắt đầu từ
                  </label>
                  <div className="flex flex-row gap-2">
                    <Input
                      type="date"
                      value={filters.startDate || ""}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                      className="w-full"
                      max={filters.endDate || undefined}
                    />
                    Đến
                    <Input
                      type="date"
                      value={filters.endDate || ""}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                      className="w-full"
                      min={filters.startDate || undefined}
                    />
                  </div>
                </div>

                <div></div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sắp xếp theo
                  </label>
                  <Select
                    name="sort"
                    value={filters.sort || "dateDesc"}
                    onChange={(e) => {
                      const value = e.target.value as "dateAsc" | "dateDesc";
                      handleFilterChange("sort", value);
                    }}
                    className="w-full"
                  >
                    <SelectItem key="dateAsc" value="dateAsc">
                      Ngày (Mới nhất)
                    </SelectItem>
                    <SelectItem key="dateDesc" value="dateDesc">
                      Ngày (Cũ nhất)
                    </SelectItem>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên chuyên gia tâm lí
                  </label>
                  <Select
                    name="psychologistName"
                    value={filters.psychologistName || ""}
                    onChange={(e) => {
                      handleFilterChange("psychologistName", e.target.value);
                    }}
                    aria-label="Profile Actions"
                    className="w-full"
                    disabled={loadingPsychologists}
                  >
                    {psychologists.map((name) => (
                      <SelectItem key={name}>{name}</SelectItem>
                    ))}
                  </Select>
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" color="primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {appointments.map((appointment, index) => (
                <Card
                  key={index}
                  className={`overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 ${
                    appointment.isUpcoming
                      ? "border-l-4 border-green-500"
                      : "border-l-4 border-gray-300"
                  }`}
                >
                  <CardHeader className="bg-secondary-blue text-white py-4 px-6">
                    <h3 className="text-xl font-semibold font-bevnpro">
                      {formatDate(appointment.date)}
                    </h3>
                  </CardHeader>
                  <CardBody className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-center text-gray-700">
                          <BiTime className="mr-2 text-xl" />
                          <span className="font-medium">Time:</span>
                          <span className="ml-2">
                            {formatTime(appointment.startTime)} -{" "}
                            {formatTime(appointment.endTime)}
                          </span>
                        </div>

                        <div className="flex items-center text-gray-700">
                          <FaUser className="mr-2" />
                          <span className="font-medium">
                            {appointment.psychologistName
                              ? "Psychologist:"
                              : "Student:"}
                          </span>
                          <span className="ml-2">
                            {appointment.psychologistName ||
                              appointment.studentName}
                          </span>
                        </div>
                      </div>

                      <Divider />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium">Status:</span>
                          {appointment.isUpcoming ? (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Upcoming
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              Past
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/appointment-history/${appointment.id}/appointment-notes`}
                          >
                            <Button
                              className="flex items-center"
                              color="default"
                            >
                              Appointment Notes
                            </Button>
                          </Link>
                          {appointment.meetUrl ? (
                            <Link
                              href={appointment.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                className="flex items-center"
                                color="primary"
                                disabled={!appointment.isUpcoming}
                              >
                                <BiVideo className="mr-2" />
                                Join Meeting
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              className="flex items-center"
                              color="default"
                              disabled
                            >
                              <BiVideo className="mr-2" />
                              No Meeting Link
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Pagination
                total={totalPages}
                page={activeFilters.pageIndex || 1}
                onChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
