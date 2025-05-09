import { Appointment } from "@/types/appointment";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AppointmentFilter {
  isUpcoming?: boolean;
  psychologistName?: string;
  startDate?: string;
  endDate?: string;
  sort?: "dateAsc" | "dateDesc";
  pageIndex?: number;
  pageSize?: number;
}

export interface AppointmentsResult {
  appointments: Appointment[];
  count: number;
}

export const getPsychologistsNames = async (): Promise<string[]> => {
  try {
    console.log("Fetching psychologists...");
    const response = await fetch(
      `${API_BASE_URL}/identities/accounts/psychologists/names`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Psychologists API status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch psychologists (${response.status})`);
    }

    const data = await response.json();
    console.log("Psychologists API Response:", data);

    return data;
  } catch (err) {
    console.error("Error fetching psychologists:", err);
    toast.error("Failed to load psychologists");
    return [];
  }
};

export const getUserAppointments = async (
  filters?: AppointmentFilter
): Promise<AppointmentsResult> => {
  try {
    console.log("getUserAppointments called with filters:", filters);

    // Construct query params
    const queryParams = new URLSearchParams();

    if (filters) {
      if (filters.isUpcoming !== undefined) {
        queryParams.append("isUpcoming", filters.isUpcoming.toString());
      }
      if (filters.psychologistName) {
        queryParams.append("psychologistName", filters.psychologistName);
      }
      if (filters.startDate) {
        queryParams.append("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append("endDate", filters.endDate);
      }
      if (filters.sort) {
        queryParams.append("sort", filters.sort);
      }
      if (filters.pageIndex !== undefined) {
        queryParams.append("pageIndex", filters.pageIndex.toString());
      }
      if (filters.pageSize !== undefined) {
        queryParams.append("pageSize", filters.pageSize.toString());
      }
    }

    const url = `${API_BASE_URL}/appointments/user${queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

    console.log("Appointments API URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Appointments API status:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch appointments (${response.status})`);
    }

    const data = await response.json();
    console.log("Appointments API Response:", data);

    // Check if the response matches the expected paginated format
    if (data && typeof data === "object" && Array.isArray(data.data)) {
      // Return the appointments array and the count
      return {
        appointments: data.data,
        count: data.count || 0,
      };
    }

    // Fallback handling for any unexpected response format
    if (Array.isArray(data)) {
      return {
        appointments: data,
        count: data.length,
      };
    }

    // For any other format, return empty array
    console.error("Unexpected API response format:", data);
    return {
      appointments: [],
      count: 0,
    };
  } catch (err) {
    console.error("Error fetching appointments:", err);
    toast.error("Failed to load appointments");
    return {
      appointments: [],
      count: 0,
    };
  }
};
