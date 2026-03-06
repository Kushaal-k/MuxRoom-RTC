import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Phone,
  LogIn,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
} from "lucide-react";
import { useWebRTC } from "../hooks/useRTC";
import { socket } from "../config/socket";

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const {
    videoRef,
    remoteVideoRef,
    createOffer,
    toggleMic,
    toggleCamera,
    endCall,
    joinRoom,
    isMicOn,
    isCameraOn,
  } = useWebRTC(roomId);

  useEffect(() => {
    socket.on("peer-left", (data) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      console.log("Peer left: " + data.roomId);
    });
  }, [roomId]);

  return (
    <div className="flex flex-col h-screen bg-brand-text-dark">
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
          onClick={joinRoom}
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
