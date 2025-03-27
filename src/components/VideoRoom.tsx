"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { webRTCService } from "@/lib/services/webRTCService";
import { toast } from "react-hot-toast";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";

/**
 * Props interface for the VideoRoom component
 */
interface VideoRoomProps {
  roomId: string;
  onCallEnd?: () => void;
}

export default function VideoRoom({ roomId, onCallEnd }: VideoRoomProps) {
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
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  /**
   * Initialize WebRTC and handle SignalR connection
   */
  const stopWebcam = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        setIsReconnecting(false);
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
        } else if (webRTCService.getConnectionState() === "Connecting") {
          console.log(
            "Connection already in progress, waiting for it to complete"
          );
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
        webRTCService.setLocalStream(
          localVideoRef.current!.srcObject as MediaStream
        );
      } catch (error) {
        console.error("Error initializing connection:", error);
        toast.error("Failed to connect to video chat. Please try again.");
      }
    };

    initializeConnection();
  }, [roomId]);

  /**
   * Handle page unload to ensure proper cleanup of media resources
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopWebcam();

      if (isSignalRConnected) {
        webRTCService.leaveRoom();
      }
    };

    // Add event listener for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isSignalRConnected]);

  const startWebcam = async () => {
    if (isWebcamActive.current) return;

    try {
      // First, try with ideal constraints (which are more likely to be supported)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        isWebcamActive.current = true;
        toast.success("Camera and microphone access granted");
      }
    } catch (error: unknown) {
      console.error("Error starting webcam:", error);

      // Try with more permissive constraints if first attempt fails
      try {
        console.log("Trying fallback constraints");
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = fallbackStream;
          isWebcamActive.current = true;
          toast.success(
            "Camera and microphone access granted with fallback options"
          );
        }
      } catch (fallbackError) {
        console.error("Fallback webcam error:", fallbackError);

        // Try one last time with just audio if video fails
        try {
          console.log("Trying audio-only fallback");
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });

          if (localVideoRef.current) {
            localVideoRef.current.srcObject = audioOnlyStream;
            isWebcamActive.current = true;
            setIsVideoEnabled(false);
            toast.success("Audio-only mode activated. Camera access failed.");
          }
        } catch (audioOnlyError) {
          console.error("Audio-only fallback failed:", audioOnlyError);
          toast.error(
            "Failed to access microphone and camera. Please check your permissions and hardware."
          );
        }
      }
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
      toast.success(
        isAudioEnabled ? "Microphone disabled" : "Microphone enabled"
      );
    } else {
      toast.error("No local stream available");
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
      toast.success(isVideoEnabled ? "Camera disabled" : "Camera enabled");
    } else {
      toast.error("No local stream available");
    }
  };

  /**
   * Handle leaving the video chat room
   */
  const handleLeaveRoom = async () => {
    try {
      // Stop all tracks first to ensure proper cleanup
      stopWebcam();

      // Clear remote stream
      if (remoteVideoRef.current?.srcObject) {
        remoteVideoRef.current.srcObject = null;
      }

      // Reset state
      isWebcamActive.current = false;

      // Leave the room
      await webRTCService.leaveRoom();

      // Force disconnect to ensure clean state for next connection
      await webRTCService.forceDisconnect();

      // Trigger the onCallEnd callback if provided
      if (onCallEnd) {
        onCallEnd();
      }

      toast.success("Left the room successfully");
    } catch (error) {
      console.error("Error leaving room:", error);
      toast.error("Failed to leave room properly");
    }
  };

  const handleRemoteStream = (stream: MediaStream | null) => {
    if (stream) {
      remoteVideoRef.current!.srcObject = stream;
      remoteVideoRef.current!.muted = false;
      remoteVideoRef.current!.volume = 1.0;
      setIsConnected(true);

      const playRemoteVideo = async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        remoteVideoRef.current!.play();
      };
      playRemoteVideo();
    } else {
      remoteVideoRef.current!.srcObject = null;
      setIsConnected(false);
      console.warn("No remote stream found");
    }
  };

  /**
   * Handle reconnection attempts when connection drops
   */
  const handleReconnection = async () => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      toast.error(
        "Failed to reconnect after multiple attempts. Please try again later."
      );
      return;
    }

    setIsReconnecting(true);
    reconnectAttempts.current += 1;

    try {
      toast.loading(
        `Attempting to reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})...`
      );

      // First, check if we need to force a disconnect to clean up previous state
      if (webRTCService.getConnectionState() !== "Disconnected") {
        await webRTCService.forceDisconnect();
        // Brief pause to allow cleanup
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await webRTCService.startConnection();
      await webRTCService.joinRoom(roomId);

      if (localVideoRef.current?.srcObject) {
        webRTCService.setLocalStream(
          localVideoRef.current.srcObject as MediaStream
        );
      }

      setIsReconnecting(false);
      toast.success("Reconnected successfully!");
      reconnectAttempts.current = 0;
    } catch (error) {
      console.error("Reconnection failed:", error);
      toast.error("Failed to reconnect. Trying again...");

      // Wait before trying again
      setTimeout(() => {
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          handleReconnection();
        } else {
          setIsReconnecting(false);
          toast.error(
            "Maximum reconnection attempts reached. Please reload the page."
          );
        }
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Connection Status Bar */}
        <div
          className={`mb-4 p-3 rounded-lg text-white text-center ${isReconnecting
            ? "bg-yellow-600"
            : isSignalRConnected
              ? "bg-green-600"
              : "bg-red-600"
            }`}
        >
          {isReconnecting
            ? `Reconnecting... Attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS}`
            : isSignalRConnected
              ? `Connected to room: ${roomId}`
              : "Connecting to server..."}
        </div>

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

          {/* Reconnect Button - Only show when disconnected */}
          {!isSignalRConnected && (
            <button
              onClick={handleReconnection}
              className="p-4 rounded-full bg-yellow-600 hover:bg-yellow-700 transition-colors"
              disabled={isReconnecting}
            >
              {isReconnecting ? (
                <FaSpinner className="w-6 h-6 text-white animate-spin" />
              ) : (
                <FaRedo className="w-6 h-6 text-white" />
              )}
            </button>
          )}

          {/* Microphone Toggle Button */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${isAudioEnabled
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
            className={`p-4 rounded-full ${isVideoEnabled
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
