import * as signalR from "@microsoft/signalr";
/**
 * Service class handling WebRTC connections and SignalR communication
 */
class WebRTCService {
  private servers = {
    iceServers: [
      {
        urls: [
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
        ],
      },
    ],
  };

  private roomId: string | null = null;
  private connectionId: string | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private connection: signalR.HubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hub/webrtc`)
    .withAutomaticReconnect()
    .build();
  private onRemoteStreamCallback:
    | ((stream: MediaStream | null) => void)
    | null = null;
  private onConnectionIdCallback:
    | ((connectionId: string | null) => void)
    | null = null;

  public async setCallbacks(callbacks: {
    onRemoteStreamCallback: (stream: MediaStream | null) => void;
    onConnectionIdCallback?: (connectionId: string | null) => void;
  }) {
    this.onRemoteStreamCallback = callbacks.onRemoteStreamCallback;
    if (callbacks.onConnectionIdCallback) {
      this.onConnectionIdCallback = callbacks.onConnectionIdCallback;
    }
  }

  public getConnectionId(): string | null {
    return this.connectionId;
  }

  public async startConnection() {
    try {
      this.localStream = null;
      this.remoteStream = null;
      this.peerConnections.clear();

      // Initialize all event handlers before starting the connection
      this.handleUserJoined();
      this.handleReceiveOffer();
      this.handleReceiveAnswer();
      this.handleReceiveIceCandidate();
      this.handleUserLeft();

      // Handle connection state changes
      this.connection.onreconnecting((error) => {
        console.log(
          "SignalR connection lost. Attempting to reconnect...",
          error
        );
        this.connectionId = null;
        if (this.onConnectionIdCallback) {
          this.onConnectionIdCallback(null);
        }
      });

      this.connection.onreconnected((connectionId) => {
        console.log("SignalR connection reestablished.", connectionId);
        this.connectionId = connectionId || null;
        if (this.onConnectionIdCallback) {
          this.onConnectionIdCallback(connectionId || null);
        }
        // Rejoin room if we were in one
        if (this.roomId) {
          this.joinRoom(this.roomId);
        }
      });

      this.connection.onclose((error) => {
        console.log("SignalR connection closed.", error);
        this.connectionId = null;
        if (this.onConnectionIdCallback) {
          this.onConnectionIdCallback(null);
        }
        // Clean up peer connections
        this.peerConnections.forEach((connection, connectionId) => {
          connection.close();
          this.peerConnections.delete(connectionId);
        });
        // Clear streams
        if (this.localStream) {
          this.localStream.getTracks().forEach((track) => track.stop());
          this.localStream = null;
        }
        this.remoteStream = null;
        if (this.onRemoteStreamCallback) {
          this.onRemoteStreamCallback(null);
        }

        console.log("Leaving room:", this.roomId);
        this.connection.invoke("LeaveRoom", this.roomId);
      });

      // Start the SignalR connection
      await this.connection.start();
      this.connectionId = this.connection.connectionId || null;
      if (this.onConnectionIdCallback) {
        this.onConnectionIdCallback(this.connection.connectionId || null);
      }
      console.log("SignalR connection started with ID:", this.connectionId);
    } catch (error) {
      console.error("Error starting SignalR connection:", error);
      throw error; // Re-throw to handle in the component
    }
  }

  public setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    this.peerConnections.forEach((peerConnection) => {
      try {
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });
      } catch (error) {
        console.error(
          "Error adding local stream to existing peer connection:",
          error
        );
      }
    });
  }

  public async leaveRoom() {
    try {
      await this.connection.invoke("LeaveRoom", this.roomId);
      console.log("Left room:", this.roomId);
      this.roomId = null;
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }

  public async joinRoom(roomId: string) {
    try {
      await this.connection.invoke("JoinRoom", roomId);
      this.roomId = roomId;
      console.log("Joined room:", roomId);
    } catch (error) {
      console.error("Error joining room:", error);
    }
  }

  private handleUserJoined() {
    this.connection.on(
      "UserJoined",
      (connectionId: string, username: string) => {
        if (!this.peerConnections.has(connectionId)) {
          console.log("Creating peer connection for:", connectionId);
          this.createPeerConnection(connectionId);

          if (this.connectionId && this.connectionId > connectionId) {
            this.sendOfferToUser(connectionId);
          }
        }
        console.log("User joined:", connectionId, username);
      }
    );
  }

  private async sendOfferToUser(connectionId: string) {
    const peerConnection = this.peerConnections.get(connectionId);

    if (!peerConnection) {
      console.warn(`No peer connection found for ${connectionId}`);
      return;
    }

    if (
      peerConnection.localDescription &&
      peerConnection.localDescription.type === "offer"
    ) {
      console.log(
        `Already have local description for ${connectionId}, skipping offer creation`
      );
      return;
    }

    try {
      // Create offer with consistent m-line order
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // Log SDP for debugging
      console.log("Created offer SDP:", offer.sdp);

      // Set local description
      await peerConnection.setLocalDescription(offer);

      if (
        peerConnection.localDescription &&
        peerConnection.localDescription.type
      ) {
        console.log("Sending offer to user:", connectionId);
        console.log(
          "Offer being sent:",
          JSON.stringify(peerConnection.localDescription)
        );

        await this.connection.invoke(
          "SendOffer",
          this.roomId,
          JSON.stringify(peerConnection.localDescription)
        );

        console.log("Offer sent to user:", connectionId);
      } else {
        console.warn(`No local description found for ${connectionId}`);
      }
    } catch (error) {
      console.error("Error creating or sending offer:", error);

      // If there was an error with the order of m-lines, try recreating the connection
      if (
        error instanceof Error &&
        error.message.includes(
          "The order of m-lines in subsequent offer doesn't match"
        )
      ) {
        console.log(
          "M-line order mismatch detected. Recreating peer connection..."
        );

        // Close the existing connection
        peerConnection.close();
        this.peerConnections.delete(connectionId);

        // Create a new connection
        this.createPeerConnection(connectionId);

        // Try sending offer again after a short delay
        setTimeout(() => {
          this.sendOfferToUser(connectionId);
        }, 1000);
      }
    }
  }

  private handleReceiveAnswer() {
    console.log("Handling receive answer");
    this.connection.on(
      "ReceiveAnswer",
      async (answer: string, fromConnectionId: string) => {
        console.log("Received answer from user:", fromConnectionId);

        const peerConnection = this.peerConnections.get(fromConnectionId);

        if (peerConnection) {
          try {
            const parsedAnswer = JSON.parse(answer);
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(parsedAnswer)
            );

            console.log("Answer received from user:", fromConnectionId);
          } catch (error) {
            console.error("Error parsing answer:", error);
          }
        } else {
          console.warn(`No peer connection found for ${fromConnectionId}`);
        }
      }
    );
  }
  private handleReceiveOffer() {
    this.connection.on(
      "ReceiveOffer",
      async (offer: string, fromConnectionId: string) => {
        try {
          console.log(`Received offer from ${fromConnectionId}`);
          console.log("Raw offer:", offer);

          // Parse the offer
          let parsedOffer;
          try {
            parsedOffer = JSON.parse(offer);
            console.log("Parsed offer:", parsedOffer);
          } catch (error) {
            console.error("Error parsing offer:", error);
            return;
          }

          // Get or create peer connection
          let peerConnection = this.peerConnections.get(fromConnectionId);
          if (!peerConnection) {
            console.log(`Creating new peer connection for ${fromConnectionId}`);
            this.createPeerConnection(fromConnectionId);
            peerConnection = this.peerConnections.get(fromConnectionId);
          }

          // Set the remote description
          await peerConnection!.setRemoteDescription(
            new RTCSessionDescription(parsedOffer)
          );
          console.log(`Remote description set for ${fromConnectionId}`);

          // Create and set local answer
          const answer = await peerConnection!.createAnswer();
          console.log(`Created answer for ${fromConnectionId}:`, answer);

          await peerConnection!.setLocalDescription(answer);
          console.log(`Local description (answer) set for ${fromConnectionId}`);

          // Send the answer
          await this.connection.invoke(
            "SendAnswer",
            fromConnectionId,
            JSON.stringify(answer)
          );
          console.log(`Answer sent to ${fromConnectionId}`);
        } catch (error) {
          console.error("Error handling offer:", error);

          // If we have an m-line order mismatch, recreate the connection
          if (
            error instanceof Error &&
            error.message.includes(
              "The order of m-lines in subsequent offer doesn't match"
            )
          ) {
            console.log(
              "M-line order mismatch detected. Recreating peer connection..."
            );
            this.createPeerConnection(fromConnectionId);
          }
        }
      }
    );
  }

  private handleReceiveIceCandidate() {
    this.connection.on(
      "ReceiveIceCandidate",
      async (iceCandidate: string, fromConnectionId: string) => {
        const peerConnection = this.peerConnections.get(fromConnectionId);

        if (peerConnection) {
          try {
            console.log("Adding ice candidate:", iceCandidate);
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(JSON.parse(iceCandidate))
            );
          } catch (error) {
            console.error("Error adding ice candidate:", error);
          }
        } else {
          console.warn(`No peer connection found for ${fromConnectionId}`);
        }
      }
    );
  }
  private handleUserLeft() {
    console.log("Handling user left");
    this.connection.on("UserLeft", (connectionId: string) => {
      if (this.peerConnections.has(connectionId)) {
        this.peerConnections.get(connectionId)?.close();
        this.peerConnections.delete(connectionId);
        console.log("User left:", connectionId);
      }
    });

    this.handleUpdateRemoteDisplay();
  }
  private handleUpdateRemoteDisplay() {
    const audioTracks = this.remoteStream?.getAudioTracks();

    if (audioTracks && audioTracks.length > 0) {
      console.log("Remote audio track added");
      console.log(`Audio track info:`, {
        enabled: audioTracks[0].enabled,
        muted: audioTracks[0].muted,
        readyState: audioTracks[0].readyState,
        id: audioTracks[0].id,
      });
    } else {
      console.warn("No remote audio track found");
    }

    if (this.onRemoteStreamCallback) {
      this.onRemoteStreamCallback(this.remoteStream);
    }
  }

  private createPeerConnection(connectionId: string) {
    // Close any existing connection for this peer
    if (this.peerConnections.has(connectionId)) {
      console.log(
        `Closing existing connection for ${connectionId} before creating a new one`
      );
      const existing = this.peerConnections.get(connectionId);
      existing?.close();
      this.peerConnections.delete(connectionId);
    }

    // Create new connection
    const peerConnection = new RTCPeerConnection(this.servers);
    this.peerConnections.set(connectionId, peerConnection);

    this.remoteStream = new MediaStream();

    if (this.localStream) {
      try {
        console.log("Adding local stream tracks to peer connection");
        // Add tracks in a consistent order - first video, then audio
        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();

        // Add video tracks first
        videoTracks.forEach((track) => {
          console.log(`Adding video track: ${track.id} to peer connection`);
          peerConnection.addTrack(track, this.localStream!);
        });

        // Then add audio tracks
        audioTracks.forEach((track) => {
          console.log(`Adding audio track: ${track.id} to peer connection`);
          peerConnection.addTrack(track, this.localStream!);
        });
      } catch (error) {
        console.error(
          "Error adding local stream tracks to peer connection:",
          error
        );
      }
    } else {
      console.warn("No local stream found when creating peer connection");
    }

    peerConnection.ontrack = (event) => {
      console.log(`Received remote track from ${connectionId}`, event.streams);
      console.log(
        `Track kind: ${event.track.kind}, enabled: ${event.track.enabled}, readyState: ${event.track.readyState}`
      );

      if (event.streams && event.streams[0]) {
        // add the remote stream tracks to remoteStream
        this.remoteStream = event.streams[0];

        this.handleUpdateRemoteDisplay();

        const audioTracks = this.remoteStream.getAudioTracks();

        // check for audio tracks
        if (audioTracks.length > 0) {
          console.log("Remote audio track added");
        } else {
          console.warn("No remote audio track found");
        }
      } else {
        console.warn(`Received event with no streams from ${connectionId}`);
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        try {
          console.log(
            `ICE candidate for ${connectionId}:`,
            event.candidate.candidate
          );
          this.connection.invoke(
            "SendIceCandidate",
            connectionId,
            JSON.stringify(event.candidate)
          );
        } catch (error) {
          console.error("Error sending ice candidate:", error);
        }
      }
    };

    peerConnection.onnegotiationneeded = async () => {
      console.log(`Negotiation needed for ${connectionId}`);
      try {
        // Don't send an offer if we're in the middle of setting a remote description
        if (peerConnection.signalingState === "stable") {
          await this.sendOfferToUser(connectionId);
        } else {
          console.log(
            `Delaying offer until signaling state is stable. Current state: ${peerConnection.signalingState}`
          );
          // Queue the negotiation until signaling state is stable
          setTimeout(() => {
            if (peerConnection.signalingState === "stable") {
              this.sendOfferToUser(connectionId);
            }
          }, 1000);
        }
      } catch (error) {
        console.error("Error during negotiation:", error);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === "connected") {
        console.log(`Successfully connected to ${connectionId}`);
      } else if (peerConnection.connectionState === "failed") {
        console.log(`Connection to ${connectionId} failed`);

        // Try to restart ICE
        if (peerConnection.restartIce) {
          console.log(`Attempting to restart ICE for ${connectionId}`);
          try {
            peerConnection.restartIce();
          } catch (err) {
            console.error(`Error restarting ICE:`, err);
          }
        }
      } else if (peerConnection.connectionState === "disconnected") {
        console.log(`Connection to ${connectionId} was disconnected`);

        // Try to recover from disconnection after a short delay
        setTimeout(() => {
          if (peerConnection.connectionState === "disconnected") {
            console.log(
              `Attempting to recover disconnected connection with ${connectionId}`
            );
            // Try to restart ICE if available
            if (peerConnection.restartIce) {
              try {
                peerConnection.restartIce();
              } catch (err) {
                console.error(`Error restarting ICE:`, err);
              }
            }
          }
        }, 2000);
      } else if (peerConnection.connectionState === "closed") {
        console.log(`Connection to ${connectionId} was closed`);
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state changed for ${connectionId}: ${peerConnection.iceConnectionState}`
      );

      // If ICE fails, try to reconnect
      if (peerConnection.iceConnectionState === "failed") {
        console.log(
          `ICE connection failed for ${connectionId}, attempting to restart`
        );

        // Try to restart ICE
        if (peerConnection.restartIce) {
          try {
            peerConnection.restartIce();
            console.log(`ICE restart initiated for ${connectionId}`);
          } catch (err) {
            console.error(`Error restarting ICE:`, err);
          }
        } else {
          console.log(`restartIce() not available, attempting to renegotiate`);
          // If restartIce is not available, try to renegotiate
          setTimeout(() => this.sendOfferToUser(connectionId), 1000);
        }
      }
    };

    peerConnection.onicegatheringstatechange = () => {
      console.log(
        "ICE gathering state changed:",
        peerConnection.iceGatheringState
      );
    };
  }

  public getConnectionState(): string {
    return this.connection.state;
  }

  public getCurrentRoom(): string | null {
    return this.roomId;
  }

  public async forceDisconnect(): Promise<void> {
    try {
      if (this.connection.state !== "Disconnected") {
        await this.connection.stop();
        this.connectionId = null;
        if (this.onConnectionIdCallback) {
          this.onConnectionIdCallback(null);
        }
      }
    } catch (error) {
      console.error("Error during force disconnect:", error);
    }
  }
}

// Export a singleton instance of the service
export const webRTCService = new WebRTCService();
