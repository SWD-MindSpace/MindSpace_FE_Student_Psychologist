import * as signalR from "@microsoft/signalr";

/**
 * Configuration for STUN servers used in WebRTC peer connections
 * These servers help establish peer-to-peer connections through NAT/firewalls
 */
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/**
 * Service class handling WebRTC connections and SignalR communication
 */
class WebRTCService {
  // SignalR connection instance
  private connection: signalR.HubConnection;
  // Map to store peer connections with other users
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  // Local media stream (audio/video)
  private localStream: MediaStream | null = null;
  // Callback functions for different events
  private onRemoteStreamCallback:
    | ((stream: MediaStream, connectionId: string) => void)
    | null = null;
  private onUserLeftCallback: ((connectionId: string) => void) | null = null;
  private onRoomNotFoundCallback: ((roomId: string) => void) | null = null;

  constructor() {
    // Initialize SignalR connection with the hub
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(
        "https://29f9-2405-4803-c69b-4270-21fd-5310-3fd4-5916.ngrok-free.app/hub/webrtc"
      )
      .withAutomaticReconnect()
      .build();

    this.setupSignalRCallbacks();
  }

  /**
   * Set up all SignalR event handlers for WebRTC signaling
   */
  private setupSignalRCallbacks() {
    // Handle when a new user joins the room
    this.connection.on(
      "UserJoined",
      async (connectionId: string, username: string) => {
        console.log(`User joined: ${username} (${connectionId})`);
        const peerConnection = await this.createPeerConnection(connectionId);

        // Ensure we have local stream before sending offer
        if (this.localStream) {
          // Add tracks before creating offer
          this.localStream.getTracks().forEach((track) => {
            console.log("Adding track to new connection:", track.kind);
            peerConnection.addTrack(track, this.localStream!);
          });
          await this.sendOffer(connectionId);
        }
      }
    );

    // Handle when a user leaves the room
    this.connection.on("UserLeft", (connectionId: string) => {
      console.log(`User left: ${connectionId}`);
      this.removePeerConnection(connectionId);
      this.onUserLeftCallback?.(connectionId);
    });

    // Handle receiving WebRTC offer from another peer
    this.connection.on(
      "ReceiveOffer",
      async (offer: string, fromConnectionId: string) => {
        console.log(`Received offer from: ${fromConnectionId}`);
        const peerConnection = await this.createPeerConnection(
          fromConnectionId
        );

        // Add local tracks before setting remote description
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => {
            console.log("Adding track before processing offer:", track.kind);
            peerConnection.addTrack(track, this.localStream!);
          });
        }

        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(offer))
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          await this.connection.invoke(
            "SendAnswer",
            fromConnectionId,
            JSON.stringify(answer)
          );
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    );

    // Handle receiving WebRTC answer from another peer
    this.connection.on(
      "ReceiveAnswer",
      async (answer: string, fromConnectionId: string) => {
        console.log(`Received answer from: ${fromConnectionId}`);
        const peerConnection = this.peerConnections.get(fromConnectionId);
        if (peerConnection) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(JSON.parse(answer))
          );
        }
      }
    );

    // Handle receiving ICE candidates for connection establishment
    this.connection.on(
      "ReceiveIceCandidate",
      async (candidate: string, fromConnectionId: string) => {
        console.log(`Received ICE candidate from: ${fromConnectionId}`);
        const peerConnection = this.peerConnections.get(fromConnectionId);
        if (peerConnection) {
          await peerConnection.addIceCandidate(
            new RTCIceCandidate(JSON.parse(candidate))
          );
        }
      }
    );

    // Handle room not found error
    this.connection.on("RoomDoesNotExist", (roomId: string) => {
      console.log(`Room does not exist: ${roomId}`);
      this.onRoomNotFoundCallback?.(roomId);
    });
  }

  /**
   * Create a new WebRTC peer connection for a specific user
   */
  private async createPeerConnection(
    connectionId: string
  ): Promise<RTCPeerConnection> {
    if (this.peerConnections.has(connectionId)) {
      const existingConnection = this.peerConnections.get(connectionId)!;
      if (
        existingConnection.connectionState === "failed" ||
        existingConnection.connectionState === "closed"
      ) {
        this.removePeerConnection(connectionId);
      } else {
        return existingConnection;
      }
    }

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state changed: ${peerConnection.connectionState}`
      );
      if (peerConnection.connectionState === "connected") {
        console.log("Peer connection established successfully");
      }
    };

    // Handle ICE candidate generation
    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("Sending ICE candidate:", event.candidate.type);
        await this.connection.invoke(
          "SendIceCandidate",
          connectionId,
          JSON.stringify(event.candidate)
        );
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
      if (peerConnection.iceConnectionState === "failed") {
        console.log("ICE connection failed, restarting ICE");
        peerConnection.restartIce();
      }
    };

    // Handle receiving remote media tracks
    peerConnection.ontrack = (event) => {
      console.log("Received remote track:", event.track.kind);
      console.log("Track state:", event.track.readyState);
      console.log("Track enabled:", event.track.enabled);

      // Ensure we have a valid stream with tracks
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0];
        console.log("Remote stream tracks:", stream.getTracks().length);

        // Immediately notify about the stream
        this.onRemoteStreamCallback?.(stream, connectionId);

        // Monitor track changes
        stream.onremovetrack = () => {
          console.log("Remote track removed");
          if (stream.getTracks().length === 0) {
            this.onUserLeftCallback?.(connectionId);
          }
        };

        stream.onaddtrack = () => {
          console.log("Remote track added");
          this.onRemoteStreamCallback?.(stream, connectionId);
        };
      }
    };

    this.peerConnections.set(connectionId, peerConnection);
    return peerConnection;
  }

  /**
   * Remove and cleanup a peer connection
   */
  private removePeerConnection(connectionId: string) {
    const peerConnection = this.peerConnections.get(connectionId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(connectionId);
    }
  }

  /**
   * Send a WebRTC offer to a specific peer
   */
  private async sendOffer(connectionId: string) {
    const peerConnection = this.peerConnections.get(connectionId);
    if (peerConnection) {
      try {
        console.log("Creating and sending offer");
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
          iceRestart: true, // Add this to force new ICE candidates
        });
        await peerConnection.setLocalDescription(offer);
        await this.connection.invoke(
          "SendOffer",
          connectionId,
          JSON.stringify(offer)
        );
      } catch (error) {
        console.error("Error sending offer:", error);
      }
    }
  }

  /**
   * Start capturing local media (audio/video)
   */
  public async startLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  }

  /**
   * Join a video chat room
   */
  public async joinRoom(roomId: string) {
    if (this.connection.state === signalR.HubConnectionState.Disconnected) {
      await this.connection.start();
    }
    await this.connection.invoke("JoinRoom", roomId);
  }

  /**
   * Leave a video chat room and cleanup resources
   */
  public async leaveRoom(roomId: string) {
    await this.connection.invoke("LeaveRoom", roomId);
    this.peerConnections.forEach((_, connectionId) => {
      this.removePeerConnection(connectionId);
    });
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.localStream = null;
  }

  /**
   * Set callback functions for various events
   */
  public setCallbacks(callbacks: {
    onRemoteStream: (stream: MediaStream, connectionId: string) => void;
    onUserLeft: (connectionId: string) => void;
    onRoomNotFound: (roomId: string) => void;
  }) {
    this.onRemoteStreamCallback = callbacks.onRemoteStream;
    this.onUserLeftCallback = callbacks.onUserLeft;
    this.onRoomNotFoundCallback = callbacks.onRoomNotFound;
  }
}

// Export a singleton instance of the service
export const webRTCService = new WebRTCService();
