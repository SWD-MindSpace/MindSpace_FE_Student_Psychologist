"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Button,
  Spinner,
  Input,
  Select,
  SelectItem,
  Pagination,
} from "@heroui/react";
import { BiTime, BiVideo, BiFilterAlt } from "react-icons/bi";
import { FaUser } from "react-icons/fa";
import MotionHeading from "@/components/MotionHeading";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Appointment } from "@/types/appointment";
import { AppointmentFilter } from "@/types/filters";
import { PaginatedResponse } from "@/types/paginatedResponse";

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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [activeFilters]);

  useEffect(() => {
    if (userRole === "Student") {
      fetchPsychologists();
    }
  }, [userRole]);

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
      const idToken = localStorage.getItem("idToken");
      const accessToken = localStorage.getItem("accessToken");
      let endpoint = "/appointments/user";

      // Add WebRTC connectivity test
      console.log("Starting WebRTC connectivity test...");
      checkWebRTCConnectivity();

      if (idToken) {
        try {
          const payload = JSON.parse(atob(idToken.split(".")[1]));
          const roleId = payload["role"];

          setUserRole(roleId);
          if (roleId === "Psychologist") {
            endpoint = "/appointments/psychologist";
          }
          // Student and Parent roles use the default endpoint
        } catch (error) {
          console.error("Error decoding ID token:", error);
        }
      }

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

  // Function to check WebRTC connectivity and detect NAT/firewall issues
  const checkWebRTCConnectivity = () => {
    try {
      // Create RTCPeerConnection with STUN servers
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10,
      };

      const pc = new RTCPeerConnection(configuration);

      // Log ice gathering state changes
      pc.addEventListener("icegatheringstatechange", () => {
        console.log(`ICE gathering state: ${pc.iceGatheringState}`);
      });

      // Log connection state changes
      pc.addEventListener("connectionstatechange", () => {
        console.log(`Connection state: ${pc.connectionState}`);
      });

      // Create data channel (needed to start ICE gathering)
      pc.createDataChannel("connectivity-test");

      // Log ICE candidates
      pc.addEventListener("icecandidate", (event) => {
        if (event.candidate) {
          console.log("STUN server returned ICE candidate:", {
            address: event.candidate.address,
            port: event.candidate.port,
            protocol: event.candidate.protocol,
            type: event.candidate.type,
            candidateType: event.candidate.candidateType,
            relatedAddress: event.candidate.relatedAddress,
            relatedPort: event.candidate.relatedPort,
            raw: event.candidate.candidate,
          });

          // Check for symmetric NAT (if we only get reflexive candidates with relatedAddress)
          if (
            event.candidate.type === "srflx" &&
            !event.candidate.relatedAddress
          ) {
            console.log(
              "WARNING: Possible symmetric NAT detected - may cause connection issues"
            );
          }
        }
      });

      // Create offer to start ICE gathering
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          console.log("Local description set, ICE gathering started");

          // Set a timeout to check if we got any server reflexive candidates
          setTimeout(() => {
            if (!pc.localDescription) {
              console.log(
                "ERROR: No local description set - firewall may be blocking STUN"
              );
              return;
            }

            const sdp = pc.localDescription.sdp;
            if (!sdp.includes("typ srflx")) {
              console.log(
                "WARNING: No server reflexive candidates found - firewall may be blocking STUN"
              );
            } else {
              console.log(
                "Server reflexive candidates found - STUN is working"
              );
            }

            // Clean up
            pc.close();
          }, 5000);
        })
        .catch((err) => {
          console.error("Error during WebRTC connectivity test:", err);
        });
    } catch (err) {
      console.error("Error setting up WebRTC connectivity test:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <MotionHeading className="mb-2">Appointment History</MotionHeading>
          <p className="text-gray-600">
            View your past and upcoming appointments
          </p>
        </div>

        <div className="mb-6">
          <Button
            color="default"
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <BiFilterAlt />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>

        {showFilters && (
          <Card className="mb-8 shadow-md">
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="w-full"
                    max={filters.endDate || undefined}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
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
                      Date (Newest First)
                    </SelectItem>
                    <SelectItem key="dateDesc" value="dateDesc">
                      Date (Oldest First)
                    </SelectItem>
                  </Select>
                </div>

                {userRole === "Student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên chuyên gia tâm lí
                    </label>
                    <select
                      name="psychologistName"
                      value={filters.psychologistName || ""}
                      onChange={(e) => {
                        handleFilterChange("psychologistName", e.target.value);
                      }}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-3"
                      disabled={loadingPsychologists}
                    >
                      <option value="">Tất cả chuyên gia tâm lí</option>
                      {psychologists.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button color="default" onClick={resetFilters}>
                  Reset
                </Button>
                <Button color="primary" onClick={applyFilters}>
                  Apply Filters
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

                        <div className="flex items-center justify-end">
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
