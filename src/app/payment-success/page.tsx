"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as signalR from "@microsoft/signalr";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // Safely access localStorage after component mounts
    const storedSessionId = localStorage.getItem("sessionId");
    console.log("Session ID from storage:", storedSessionId);

    if (!storedSessionId) {
      console.log("No session ID in storage");
      setLoading(false);
      return;
    }

    // Set session ID and transaction ID
    setSessionId(storedSessionId);

    // Create SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7096/hub/payment")
      .withAutomaticReconnect()
      .build();

    // Listen for payment updates
    connection.on("ClientNotifyPaymentSuccess", () => {
      console.log("Payment success");
      setIsSuccess(true);
      setLoading(false);
    });

    // Start connection
    connection
      .start()
      .then(() => {
        connection.invoke("AddToGroup", storedSessionId);
        console.log(`Added to group ${storedSessionId}`);
      })
      .catch((err) => {
        console.error("SignalR Connection Error: ", err);
        setLoading(false);
      });

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("Payment verification timeout reached");
        setLoading(false);
      }
    }, 15000); // 15 second timeout

    // Clean up
    return () => {
      clearTimeout(timeout);
      connection
        .stop()
        .catch((err) => console.error("Error stopping connection:", err));
    };
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">
          Đang xác nhận thanh toán...
        </h2>
      </div>
    );
  }

  // Render success or failure message
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 space-y-6">
        {isSuccess ? (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Thanh toán thành công!
            </h1>
            <p className="text-center text-gray-600">
              Cuộc hẹn của bạn đã được đặt thành công. Bạn sẽ nhận được email
              xác nhận chi tiết.
            </p>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-sm text-green-800">
                Mã giao dịch: {sessionId}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800">
              Thanh toán thất bại
            </h1>
            <p className="text-center text-gray-600">
              Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại
              sau.
            </p>
          </>
        )}

        <div className="flex flex-col space-y-3 pt-4">
          <Link
            href="/dashboard/appointments"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center transition-colors"
          >
            Xem lịch hẹn của tôi
          </Link>
          <Link
            href="/psychologists"
            className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md text-center transition-colors"
          >
            Quay lại danh sách chuyên gia
          </Link>
        </div>
      </div>
    </div>
  );
}
