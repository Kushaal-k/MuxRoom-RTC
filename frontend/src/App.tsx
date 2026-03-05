import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import type { SignalData } from "./types";
import {
  Phone,
  LogIn,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Keyboard,
} from "lucide-react";

const socket = io("http://localhost:3000");

function App() {
  const [roomId, setRoomId] = useState<string>("");
  const roomIdRef = useRef<string>("");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  const pc = useRef<RTCPeerConnection | null>(null);

  const createOffer = async () => {
    if (!pc.current) return;

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
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomId: roomIdRef.current,
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

  useEffect(() => {
    initConnection();
  }, []);

  useEffect(() => {
    const handleOffer = async (data: SignalData) => {
      try {
        if (!pc.current) return;

        await pc.current.setRemoteDescription(data.sdp);
        const answer = await pc.current.createAnswer();
        await pc.current.setLocalDescription(answer);

        socket.emit("answer", { roomId: roomIdRef.current, sdp: answer });
      } catch (error) {
        console.error("Error handling offer:", error);
      }
    };

    const handleAnswer = async (data: any) => {
      if (!pc.current) return;

      await pc.current.setRemoteDescription(data.sdp);
    };

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
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex gap-1 p-1 min-h-0">
        <div className="flex-1 bg-[#111] rounded-lg" id="local-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-lg"
          ></video>
        </div>
        <div className="flex-1 bg-[#111] rounded-lg" id="remote-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          ></video>
        </div>
      </div>
      <div className="flex justify-center flex-wrap gap-3 p-[14px]">
        <div className="relative flex items-center">
          <Keyboard className="absolute left-2 text-gray-500" size={16} />
          <input
            type="text"
            value={roomId}
            onChange={(e) => {
              setRoomId(e.target.value);
              roomIdRef.current = e.target.value;
            }}
            placeholder="Room ID"
            className="border pl-8 pr-2 py-1 rounded-sm text-black bg-white transition-all focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          id="btn-call"
          onClick={createOffer}
          className="flex items-center gap-2 px-6 py-2 rounded-md border border-[#333] bg-[#111] text-white text-sm cursor-pointer hover:bg-[#222] transition-all hover:scale-105 active:scale-95"
        >
          <Phone size={16} />
          Call
        </button>
        <button
          id="btn-join"
          onClick={() => socket.emit("join-room", roomId)}
          className="flex items-center gap-2 px-6 py-2 rounded-md border border-[#333] bg-[#111] text-white text-sm cursor-pointer hover:bg-[#222] transition-all hover:scale-105 active:scale-95"
        >
          <LogIn size={16} />
          Join
        </button>
        <button
          id="btn-mic"
          onClick={toggleMic}
          className={`flex items-center gap-2 px-6 py-2 rounded-md border border-[#333] text-white text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            isMicOn
              ? "bg-[#111] hover:bg-[#222]"
              : "bg-red-600 hover:bg-red-700 border-red-500"
          }`}
        >
          {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
          Toggle Mic
        </button>
        <button
          id="btn-camera"
          onClick={toggleCamera}
          className={`flex items-center gap-2 px-6 py-2 rounded-md border border-[#333] text-white text-sm cursor-pointer transition-all hover:scale-105 active:scale-95 ${
            isCameraOn
              ? "bg-[#111] hover:bg-[#222]"
              : "bg-red-600 hover:bg-red-700 border-red-500"
          }`}
        >
          {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
          Toggle Camera
        </button>
        <button
          id="btn-hangup"
          onClick={endCall}
          className="flex items-center gap-2 px-6 py-2 rounded-md border border-[#333] bg-[#111] text-white text-sm cursor-pointer hover:bg-[#222] transition-all hover:scale-105 active:scale-95"
        >
          <PhoneOff size={16} />
          Hangup
        </button>
      </div>
    </div>
  );
}

export default App;
