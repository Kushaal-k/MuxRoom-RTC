export interface SignalData {
  roomId: string;
  sdp: RTCSessionDescriptionInit;
}

export interface IceCandidateData {
  roomId: string;
  candidate: RTCIceCandidateInit;
}

export interface Participant {
  id: string;
  name: string;
  isMuted: boolean;
  isCameraOff: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}
