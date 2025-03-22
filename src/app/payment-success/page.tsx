"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
      connection.stop().catch((err) => console.error("Error stopping connection:", err));
    };
  }, []);

  // Render loading state
  if (loading) {
    return (
      <div className="flex flex-col bg-gray-50 justify-center items-center min-h-screen px-4">
        <div className="border-4 border-blue-500 border-t-transparent h-16 rounded-full w-16 animate-spin mb-4"></div>
        <h2 className="text-gray-700 text-xl font-semibold">Đang xác nhận thanh toán...</h2>
      </div>
    );
  }

  // Render success or failure message
  return (
    <div className="flex flex-col bg-gray-50 justify-center items-center min-h-screen px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-6">
        {isSuccess ? (
          <>
            <div className="flex justify-center">
              <div className="flex bg-green-100 h-24 justify-center rounded-full w-24 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 text-green-500 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl text-center text-gray-800 font-bold">Thanh toán thành công!</h1>
            <p className="text-center text-gray-600">
              Cuộc hẹn của bạn đã được đặt thành công. Bạn sẽ nhận được email xác nhận chi tiết.
            </p>
            <div className="bg-green-50 p-4 rounded-md">
              <p className="text-green-800 text-sm">Mã giao dịch: {sessionId}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="flex bg-red-100 h-24 justify-center rounded-full w-24 items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 text-red-500 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl text-center text-gray-800 font-bold">Thanh toán thất bại</h1>
            <p className="text-center text-gray-600">
              Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại sau.
            </p>
          </>
        )}

        <div className="flex flex-col pt-4 space-y-3">
          <Link
            href="/dashboard/appointments"
            className="bg-blue-600 rounded-md text-center text-white w-full font-medium hover:bg-blue-700 px-4 py-3 transition-colors"
          >
            Xem lịch hẹn của tôi
          </Link>
          <Link
            href="/psychologists"
            className="bg-gray-200 rounded-md text-center text-gray-800 w-full font-medium hover:bg-gray-300 px-4 py-3 transition-colors"
          >
            Quay lại danh sách chuyên gia
          </Link>
        </div>
      </div>
    </div>
  );
}
