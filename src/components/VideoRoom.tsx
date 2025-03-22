'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webRTCService } from '@/lib/services/webRTCService';
import { toast } from 'react-hot-toast';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

/**
 * Props interface for the VideoRoom component
 */
interface VideoRoomProps {
    roomId: string;
}

/**
 * VideoRoom component handles the video chat interface and functionality
 * It manages local and remote video streams, and provides controls for audio/video
 */
export default function VideoRoom({ roomId }: VideoRoomProps) {
    const router = useRouter();
    // Refs for video elements
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // State for media controls and connection status
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Setup function to initialize the video room
        const setupRoom = async () => {
            try {
                // Initialize local video stream
                const stream = await webRTCService.startLocalStream();
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // Configure WebRTC callbacks
                webRTCService.setCallbacks({
                    // Handle incoming remote stream
                    onRemoteStream: (stream, connectionId) => {
                        console.log('Received remote stream from:', connectionId);
                        console.log('Remote stream tracks:', stream.getTracks().map(track => ({
                            kind: track.kind,
                            enabled: track.enabled,
                            state: track.readyState
                        })));

                        if (remoteVideoRef.current) {
                            console.log('Setting remote video source');
                            remoteVideoRef.current.srcObject = stream;
                            remoteVideoRef.current.onloadedmetadata = () => {
                                console.log('Remote video metadata loaded');
                                remoteVideoRef.current?.play().catch(e =>
                                    console.error('Error playing remote video:', e)
                                );
                            };
                            setIsConnected(true);
                        } else {
                            console.error('Remote video ref is not available');
                        }
                    },
                    // Handle when other user leaves
                    onUserLeft: () => {
                        if (remoteVideoRef.current) {
                            remoteVideoRef.current.srcObject = null;
                            setIsConnected(false);
                        }
                        toast('Other participant has left the room', {
                            icon: '👋',
                        });
                    },
                    // Handle room not found error
                    onRoomNotFound: (roomId) => {
                        toast.error(`Room ${roomId} does not exist`);
                        router.push('/video-chat');
                    }
                });

                // Join the video chat room
                await webRTCService.joinRoom(roomId);
                toast.success('Successfully joined the room');
            } catch (error) {
                console.error('Error setting up video room:', error);
                toast.error('Failed to set up video room');
            }
        };

        setupRoom();

        // Cleanup function to leave room when component unmounts
        return () => {
            webRTCService.leaveRoom(roomId);
        };
    }, [roomId, router]);

    /**
     * Toggle microphone on/off
     */
    const toggleAudio = () => {
        const stream = localVideoRef.current?.srcObject as MediaStream;
        if (stream) {
            stream.getAudioTracks().forEach(track => {
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
            stream.getVideoTracks().forEach(track => {
                track.enabled = !isVideoEnabled;
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    };

    /**
     * Handle leaving the video chat room
     */
    const handleLeaveRoom = async () => {
        await webRTCService.leaveRoom(roomId);
        router.push('/video-chat');
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
                            onLoadedMetadata={() => console.log('Remote video element metadata loaded')}
                            onPlay={() => console.log('Remote video started playing')}
                            onError={(e) => console.error('Remote video error:', e)}
                        />
                        <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                            {isConnected ? 'Remote User' : 'Waiting for someone to join...'}
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-75 px-6 py-3 rounded-full">
                    {/* Microphone Toggle Button */}
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
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
                        className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
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