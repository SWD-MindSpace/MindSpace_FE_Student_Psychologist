export interface WebRTCUser {
    connectionId: string;
    username: string;
}

export interface IWebRTCClientNotification {
    userJoined: (connectionId: string, username: string) => void;
    userLeft: (connectionId: string) => void;
    receiveOffer: (offer: string, fromConnectionId: string) => void;
    receiveAnswer: (answer: string, fromConnectionId: string) => void;
    receiveIceCandidate: (candidate: string, fromConnectionId: string) => void;
    roomDoesNotExist: (roomId: string) => void;
}

export interface PeerConnection {
    connection: RTCPeerConnection;
    dataChannel?: RTCDataChannel;
} 