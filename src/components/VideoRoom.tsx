"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { webRTCService } from "@/lib/services/webRTCService";
import { toast } from "react-hot-toast";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
} from "react-icons/fa";

/**
 * Props interface for the VideoRoom component
 */
interface VideoRoomProps {
  roomId: string;
}

export default function VideoRoom({ roomId }: VideoRoomProps) {
  const router = useRouter();
  // Refs for video elements
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const isWebcamActive = useRef(false);

  // State for media controls and connection status
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSignalRConnected, setIsSignalRConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  /**
   * Initialize WebRTC and handle SignalR connection
   */
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Set up callbacks for remote stream handling
        webRTCService.setCallbacks({
          onRemoteStreamCallback: handleRemoteStream,
          onConnectionIdCallback: (id: string | null) => {
            setConnectionId(id);
            setIsSignalRConnected(!!id);
          },
        });

        // Check connection state before attempting to start
        console.log("Connection state:", webRTCService.getConnectionState());
        if (webRTCService.getConnectionState() === "Disconnected") {
          // Start SignalR connection and wait for it to establish
          await webRTCService.startConnection();
          await webRTCService.joinRoom(roomId);
        } else {
          console.log(
            "Connection already in progress or connected, skipping initialization"
          );
          // If already connected but in a different room, leave and join the new room
          if (webRTCService.getCurrentRoom() !== roomId) {
            await webRTCService.leaveRoom();
            await webRTCService.joinRoom(roomId);
          }
        }

        await startWebcam();
        webRTCService.setLocalStream(localVideoRef.current!.srcObject as MediaStream);
      } catch (error) {
        console.error("Error initializing connection:", error);
        toast.error("Failed to connect to video chat. Please try again.");
      }
    };

    initializeConnection();

    // Cleanup function
    return () => {
      if (isSignalRConnected) {
        webRTCService.leaveRoom();
      }
      // Stop webcam
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId]);

  const startWebcam = async () => {
    if (isWebcamActive.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "user" },
        },
        audio: true,
      });

      localVideoRef.current!.srcObject = stream;
      isWebcamActive.current = true;
    } catch (error) {
      console.error("Error starting webcam:", error);
      toast.error("Failed to access webcam. Please check your permissions.");
    }
  };
  /**
   * Toggle microphone on/off
   */
  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  /**
   * Toggle camera on/off
   */
  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  /**
   * Handle leaving the video chat room
   */
  const handleLeaveRoom = async () => {
    await webRTCService.leaveRoom();
    router.push("/video-chat");
  };

  const handleRemoteStream = (stream: MediaStream | null) => {
    if (stream) {
      remoteVideoRef.current!.srcObject = stream;
      remoteVideoRef.current!.muted = false;
      remoteVideoRef.current!.volume = 1.0;
      remoteVideoRef.current!.play();
    } else {
      remoteVideoRef.current!.srcObject = null;
      console.warn("No remote stream found");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Video Display */}
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted // Mute local video to prevent echo
              className="w-full rounded-lg bg-black"
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              You
            </div>
          </div>

          {/* Remote Video Display */}
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg bg-black"
              onLoadedMetadata={() =>
                console.log("Remote video element metadata loaded")
              }
              onPlay={() => console.log("Remote video started playing")}
              onError={(e) => console.error("Remote video error:", e)}
            />
            <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
              {isConnected ? "Remote User" : "Waiting for someone to join..."}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-75 px-6 py-3 rounded-full">
          {/* Connection ID Display */}
          <div className="bg-gray-800 px-4 py-2 rounded-lg text-white text-sm">
            Connection ID: {connectionId || "Not connected"}
          </div>

          {/* Microphone Toggle Button */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } transition-colors`}
          >
            {isAudioEnabled ? (
              <FaMicrophone className="w-6 h-6 text-white" />
            ) : (
              <FaMicrophoneSlash className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Camera Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled
                ? "bg-gray-600 hover:bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            } transition-colors`}
          >
            {isVideoEnabled ? (
              <FaVideo className="w-6 h-6 text-white" />
            ) : (
              <FaVideoSlash className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Leave Room Button */}
          <button
            onClick={handleLeaveRoom}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          >
            <FaPhoneSlash className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
