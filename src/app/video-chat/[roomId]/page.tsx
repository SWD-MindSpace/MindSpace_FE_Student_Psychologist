"use client";

import { useParams } from "next/navigation";
import VideoRoom from "@/components/VideoRoom";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VideoRoomPage() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //     if (!user) {
  //         router.push('/login');
  //     }
  // }, [user, router]);

  // if (!user || !roomId) {
  //     return null;
  // }

  return <VideoRoom roomId={roomId as string} />;
}
