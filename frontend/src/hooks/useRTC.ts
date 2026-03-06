import { useEffect, useRef, useState } from "react";
import { socket } from "../config/socket";

const roomMap = new Map<string, RTCPeerConnection>();

export function useWebRTC(roomId?: string, username?: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const joinRoom = () => {
    socket.emit("join-room", {roomId, username});
  } 

  const initConnection = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      pc.current?.addTrack(track, stream);
    });
  };

  const createOffer = async () => {
    if (!pc.current || !roomId) return;

    socket.emit("join-room", roomId);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, sdp: offer });
  };

  const toggleMic = () => {
    if (!localStream) return;

    const audio = localStream.getAudioTracks()[0];
    audio.enabled = !audio.enabled;

    setIsMicOn(audio.enabled);
  };

  const toggleCamera = () => {
    if (!localStream) return;

    const video = localStream.getVideoTracks()[0];
    video.enabled = !video.enabled;

    setIsCameraOn(video.enabled);
  };

  const endCall = async () => {
    pc.current?.close();
    pc.current = null;

    localStream?.getTracks().forEach((t) => t.stop());

    if (videoRef.current) videoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    socket.emit("peer-left", { roomId });
    await initConnection();
  };

  useEffect(() => {
    initConnection();
  }, [roomId]);

  useEffect(() => {
    const handleOffer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, sdp: answer });
    };

    const handleAnswer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);
    };

    const handleIce = async (data: any) => {
      if (!pc.current) return;

      await pc.current.addIceCandidate(data.candidate);
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIce);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIce);
    };
  }, [roomId]);

  return {
    videoRef,
    remoteVideoRef,
    createOffer,
    toggleMic,
    toggleCamera,
    endCall,
    joinRoom,
    isMicOn,
    isCameraOn,
  };
}