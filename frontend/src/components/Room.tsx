import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import type { SignalData } from "../types";
import {
  Phone,
  LogIn,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";

// For production, this URL should be configurable
const socket = io("http://localhost:3000");

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  const pc = useRef<RTCPeerConnection | null>(null);

  const createOffer = async () => {
    if (!pc.current || !roomId) return;

    socket.emit("join-room", roomId);

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit("offer", { roomId, sdp: offer });
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(!isCameraOn);
    }
  };

  const initConnection = async () => {
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.current.onicecandidate = (event) => {
      if (event.candidate && roomId) {
        socket.emit("ice-candidate", {
          roomId: roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      stream
        .getTracks()
        .forEach((track) => pc.current?.addTrack(track, stream));
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }

    pc.current.onconnectionstatechange = () => {
      console.log("Connection State:", pc.current?.connectionState);
    };

    pc.current.oniceconnectionstatechange = () => {
      console.log("ICE State:", pc.current?.iceConnectionState);
    };
  };

  const endCall = () => {
    pc.current?.close();
    pc.current = null;

    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);

    if (videoRef.current) videoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    initConnection();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => {
    initConnection();
  }, [roomId]);

  useEffect(() => {
    const handleOffer = async (data: SignalData) => {
      try {
        if (!pc.current) return;

        await pc.current.setRemoteDescription(data.sdp);
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);

        socket.emit("answer", { roomId: roomId, sdp: answer });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAnswer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleIceCandidate = async (data: any) => {
      if (!pc.current) return;

      await pc.current.addIceCandidate(data.candidate);
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);

    return () => {
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
    };
  }, [roomId]);

  return (
    <div className="flex flex-col h-screen bg-[#1A1A1A]">
      <div className="flex-1 flex gap-1 p-1 min-h-0 relative z-10">
        <div
          className="flex-1 bg-[#111] rounded-none border-[3px] border-[#333] relative"
          id="local-video"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-none"
          ></video>
          <div className="absolute top-4 left-4 font-body text-white/50 text-sm">
            You
          </div>
        </div>
        <div
          className="flex-1 bg-[#111] rounded-none border-[3px] border-[#333] relative"
          id="remote-video"
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-none"
          ></video>
          <div className="absolute top-4 left-4 font-body text-white/50 text-sm">
            Guest
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-3 p-[14px] bg-brand-bg-base border-t-[3px] border-brand-text-dark grain z-20">
        <div className="font-display font-bold text-xl px-4 py-2 border-r-[3px] border-brand-text-dark flex items-center">
          ROOM: {roomId}
        </div>
        <button
          id="btn-call"
          onClick={createOffer}
          className="flex items-center gap-2 px-6 py-2 rounded-none border-[3px] border-brand-text-dark bg-brand-yellow-acid text-brand-text-dark font-display font-bold text-lg uppercase cursor-pointer hover:bg-white transition-all grain"
        >
          <Phone size={20} />
          Call
        </button>
        <button
          id="btn-join"
          onClick={() => socket.emit("join-room", roomId)}
          className="flex items-center gap-2 px-6 py-2 rounded-none border-[3px] border-brand-text-dark bg-brand-purple-vivid text-white font-display font-bold text-lg uppercase cursor-pointer hover:bg-brand-purple-deep transition-all grain"
        >
          <LogIn size={20} />
          Join
        </button>
        <button
          id="btn-mic"
          onClick={toggleMic}
          className={`flex items-center gap-2 px-6 py-2 rounded-none border-[3px] font-display font-bold text-lg uppercase cursor-pointer transition-all grain ${
            isMicOn
              ? "bg-white text-brand-text-dark border-brand-text-dark hover:bg-gray-100"
              : "bg-red-600 text-white border-brand-text-dark"
          }`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          Mic
        </button>
        <button
          id="btn-camera"
          onClick={toggleCamera}
          className={`flex items-center gap-2 px-6 py-2 rounded-none border-[3px] font-display font-bold text-lg uppercase cursor-pointer transition-all grain ${
            isCameraOn
              ? "bg-white text-brand-text-dark border-brand-text-dark hover:bg-gray-100"
              : "bg-red-600 text-white border-brand-text-dark"
          }`}
        >
          {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          Camera
        </button>
        <button
          id="btn-hangup"
          onClick={endCall}
          className="flex items-center gap-2 px-6 py-2 rounded-none border-[3px] border-brand-text-dark bg-brand-text-dark text-white font-display font-bold text-lg uppercase cursor-pointer hover:bg-[#333] transition-all grain ml-auto"
        >
          <PhoneOff size={20} />
          Hangup
        </button>
      </div>
    </div>
  );
}
