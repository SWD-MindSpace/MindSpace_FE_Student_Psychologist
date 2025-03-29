"use client";

import { useState } from "react";
import { Textarea, Button } from "@heroui/react";
import Rating from "../Rating";

const API_FEEDBACK_URL = `${process.env.NEXT_PUBLIC_API_URL}/feedbacks`;

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
}

interface FeedBackPostData {
  roomId: string;
  rating: number;
  feedbackContent: string;
}

export default function FeedbackModal({ open, onClose, roomId }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      if (!roomId || !rating || !feedback.trim()) {
        setError("Tất cả các trường là bắt buộc");
        return;
      }

      const feedbackPostData: FeedBackPostData = { roomId, rating, feedbackContent: feedback.trim() };

      const response = await fetch(API_FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackPostData),
      });

      if (!response.ok) throw new Error("Không thể gửi phản hồi. Vui lòng thử lại.");

      setSuccess("Phản hồi của bạn đã được gửi thành công");
      setFeedback("");
      setRating(0);

      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-5">
        <h2 className="text-xl font-bold">Đánh giá chuyên viên</h2>

        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Đánh giá sao</label>
          <div className="mt-1">
            <Rating
              value={rating}
              onChange={handleRating}
              readonly={rating > 0}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nội dung phản hồi</label>

          <Textarea
            placeholder="Nhập phản hồi của bạn..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary mt-1"
            rows={4}
          />

        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200"
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
