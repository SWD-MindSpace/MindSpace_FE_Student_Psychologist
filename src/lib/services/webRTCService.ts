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
    .withUrl(`${process.env.NEXT_PUBLIC_URL}/hub/webrtc`)
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

        // Don't try to invoke methods when the connection is closed
        console.log("Connection closed, room:", this.roomId);
        this.roomId = null;
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
      if (this.connection.state === "Connected") {
        await this.connection.invoke("LeaveRoom", this.roomId);
        console.log("Left room:", this.roomId);
      } else {
        console.log(
          `Cannot leave room: connection state is ${this.connection.state}`
        );
      }
      this.roomId = null;
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  }

  public async joinRoom(roomId: string) {
    try {
      if (this.connection.state === "Connected") {
        await this.connection.invoke("JoinRoom", roomId);
        this.roomId = roomId;
        console.log("Joined room:", roomId);
      } else {
        console.error(
          `Cannot join room: connection state is ${this.connection.state}`
        );
        throw new Error(`Cannot join room: connection is not connected`);
      }
    } catch (error) {
      console.error("Error joining room:", error);
      throw error;
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

    // Check if we're in a state where we can create an offer
    if (peerConnection.signalingState !== "stable") {
      console.log(
        `Cannot create offer: signaling state is ${peerConnection.signalingState}, waiting...`
      );
      // Wait for the signaling state to stabilize before creating offer
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (!peerConnection || peerConnection.signalingState === "stable") {
            resolve();
          } else {
            setTimeout(checkState, 500);
          }
        };
        checkState();
      });
    }

    // If we already have a local offer, don't create another one
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
      // Create offer with explicit transceivers to maintain consistent m-line order
      // First, check if we need to create transceivers
      const transceivers = peerConnection.getTransceivers();
      if (transceivers.length === 0 && this.localStream) {
        // Create transceivers in consistent order - video first, then audio
        if (this.localStream.getVideoTracks().length > 0) {
          peerConnection.addTransceiver("video", { direction: "sendrecv" });
        }
        if (this.localStream.getAudioTracks().length > 0) {
          peerConnection.addTransceiver("audio", { direction: "sendrecv" });
        }
      }

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

        if (this.connection.state === "Connected") {
          await this.connection.invoke(
            "SendOffer",
            this.roomId,
            JSON.stringify(peerConnection.localDescription)
          );
          console.log("Offer sent to user:", connectionId);
        } else {
          console.error(
            `Cannot send offer: connection state is ${this.connection.state}`
          );
        }
      } else {
        console.warn(`No local description found for ${connectionId}`);
      }
    } catch (error) {
      console.error("Error creating or sending offer:", error);

      // If there was an error with the order of m-lines, recreate the peer connection
      if (
        error instanceof Error &&
        (error.message.includes(
          "The order of m-lines in subsequent offer doesn't match"
        ) ||
          error.message.includes("Failed to set local offer sdp"))
      ) {
        console.log("SDP error detected. Recreating peer connection...");

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

            // Check if we're in the right state to receive an answer
            if (peerConnection.signalingState !== "have-local-offer") {
              console.warn(
                `Cannot set remote answer: signaling state is ${peerConnection.signalingState}, expected 'have-local-offer'`
              );
              return;
            }

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(parsedAnswer)
            );

            console.log("Answer processed from user:", fromConnectionId);
          } catch (error) {
            console.error("Error processing answer:", error);

            // If we have an invalid state error, the negotiation may be out of sync
            if (
              error instanceof Error &&
              (error.message.includes("Called in wrong state") ||
                error.message.includes("Failed to set remote answer sdp"))
            ) {
              console.log(
                "Invalid state for answer, restarting negotiation..."
              );

              // Restart the negotiation process
              if (this.connectionId && this.connectionId > fromConnectionId) {
                setTimeout(() => {
                  this.sendOfferToUser(fromConnectionId);
                }, 1000);
              }
            }
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

          // Handle different signaling states properly
          if (peerConnection!.signalingState !== "stable") {
            console.log(
              `Peer connection not in stable state (${
                peerConnection!.signalingState
              }), rolling back...`
            );

            // If we have a pending local offer, roll it back
            if (peerConnection!.signalingState === "have-local-offer") {
              await peerConnection!.setLocalDescription({ type: "rollback" });
              console.log("Rolled back local description");
            }

            // Wait for rollback to complete
            await new Promise<void>((resolve) => {
              const checkState = () => {
                if (
                  !peerConnection ||
                  peerConnection.signalingState === "stable"
                ) {
                  resolve();
                } else {
                  setTimeout(checkState, 100);
                }
              };
              checkState();
            });

            console.log(
              "Signaling state is now stable, continuing with offer processing"
            );
          }

          // Set the remote description
          await peerConnection!.setRemoteDescription(
            new RTCSessionDescription(parsedOffer)
          );
          console.log(`Remote description set for ${fromConnectionId}`);

          // Create and set local answer
          const answer = await peerConnection!.createAnswer();
          console.log(`Created answer for ${fromConnectionId}:`, answer);

          // Check signaling state before setting local description
          if (peerConnection!.signalingState === "have-remote-offer") {
            await peerConnection!.setLocalDescription(answer);
            console.log(
              `Local description (answer) set for ${fromConnectionId}`
            );

            // Send the answer
            if (this.connection.state === "Connected") {
              await this.connection.invoke(
                "SendAnswer",
                fromConnectionId,
                JSON.stringify(answer)
              );
              console.log(`Answer sent to ${fromConnectionId}`);
            } else {
              console.error(
                `Cannot send answer: connection state is ${this.connection.state}`
              );
            }
          } else {
            console.warn(
              `Cannot set local description: Signaling state is ${
                peerConnection!.signalingState
              }, expected 'have-remote-offer'`
            );
          }
        } catch (error) {
          console.error("Error handling offer:", error);

          // If we have an SDP-related error, recreate the connection
          if (
            error instanceof Error &&
            (error.message.includes(
              "The order of m-lines in subsequent offer doesn't match"
            ) ||
              error.message.includes("Called in wrong state") ||
              error.message.includes("Failed to set remote offer sdp"))
          ) {
            console.log("SDP error detected. Recreating peer connection...");

            // Get the existing connection
            const peerConnection = this.peerConnections.get(fromConnectionId);
            if (peerConnection) {
              peerConnection.close();
              this.peerConnections.delete(fromConnectionId);
            }

            // Create a new connection
            this.createPeerConnection(fromConnectionId);

            // Try processing the offer again after a short delay
            setTimeout(() => {
              if (this.connection.state === "Connected") {
                this.handleProcessOffer(offer, fromConnectionId);
              }
            }, 1000);
          }
        }
      }
    );
  }

  // Added this method to handle reprocessing offers after connection reset
  private async handleProcessOffer(offer: string, fromConnectionId: string) {
    try {
      console.log(`Reprocessing offer from ${fromConnectionId}`);

      const parsedOffer = JSON.parse(offer);
      const peerConnection = this.peerConnections.get(fromConnectionId);

      if (!peerConnection) {
        console.warn(`No peer connection found for ${fromConnectionId}`);
        return;
      }

      // Set the remote description
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(parsedOffer)
      );

      // Create and set local answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      // Send the answer
      if (this.connection.state === "Connected") {
        await this.connection.invoke(
          "SendAnswer",
          fromConnectionId,
          JSON.stringify(answer)
        );
      }
    } catch (error) {
      console.error("Error reprocessing offer:", error);
    }
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

        // Set a consistent order: always add all video tracks, then all audio tracks
        // This helps prevent m-line order mismatches
        if (videoTracks.length > 0) {
          videoTracks.forEach((track) => {
            console.log(`Adding video track: ${track.id} to peer connection`);
            peerConnection.addTrack(track, this.localStream!);
          });
        }

        if (audioTracks.length > 0) {
          audioTracks.forEach((track) => {
            console.log(`Adding audio track: ${track.id} to peer connection`);
            peerConnection.addTrack(track, this.localStream!);
          });
        }
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
          if (this.connection.state === "Connected") {
            this.connection.invoke(
              "SendIceCandidate",
              connectionId,
              JSON.stringify(event.candidate)
            );
          } else {
            console.warn(
              `Cannot send ICE candidate: connection state is ${this.connection.state}`
            );
          }
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
