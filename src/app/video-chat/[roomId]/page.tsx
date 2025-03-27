"use client";

import { useParams, useRouter } from "next/navigation";
import VideoRoom from "@/components/VideoRoom";
import { useState } from "react";
import FeedbackModal from "@/components/modals/FeedbackModal";

export default function VideoRoomPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const { roomId } = useParams();
  const router = useRouter();

  const handleModalClose = () => {
    setModalOpen(false);
    router.push("/video-chat");
  };

  return (
    <div className="relative">
      <VideoRoom
        roomId={roomId as string}
        onCallEnd={() => setModalOpen(true)}
      />

      <FeedbackModal
        open={modalOpen}
        onClose={handleModalClose}
        roomId={roomId as string}
      />
    </div>
  );
}
