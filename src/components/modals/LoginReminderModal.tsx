"use client";

import { Button } from "@heroui/react";
import { useEffect, useState } from "react";

interface LoginReminderModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginReminderModal({
  open,
  onClose,
}: LoginReminderModalProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (open) {
      // Start animation after modal is shown
      const timer = setTimeout(() => setAnimate(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Dimmed background with animation */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          animate ? "opacity-60" : "opacity-0"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal with animation */}
      <div
        className={`bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5 relative transition-all duration-300 ${
          animate
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <h2 className="text-xl font-bold">Đăng nhập để tiếp tục</h2>

        <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
          Bạn cần đăng nhập để tiếp tục sử dụng dịch vụ này.
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onPress={() => (window.location.href = "/login")}
            className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary/90 transition-transform hover:scale-105"
          >
            Đăng nhập
          </Button>
          <Button
            onPress={onClose}
            className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-transform hover:scale-105"
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
