import { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
} from "lucide-react";
import { useWebRTC } from "../hooks/useRTC";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./ui/Toast";
import { GlassContainer } from "./ui/GlassContainer";
import { BrandButton } from "./ui/BrandButton";

/** Renders a single remote peer's video stream into a dedicated glass tile. */
function RemoteVideo({ stream, label }: { stream: MediaStream; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <GlassContainer className="relative flex-1 min-w-[300px] aspect-video overflow-hidden rounded-2xl group" hoverEffect>
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <div className="absolute top-4 left-4">
         <GlassContainer className="px-3 py-1 rounded-pill">
            <span className="text-[10px] uppercase tracking-widest font-display font-bold">{label}</span>
         </GlassContainer>
      </div>
    </GlassContainer>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const username = location.state?.username || "GUEST_USER";

  const { toasts, addToast, removeToast } = useToast();

  const {
    videoRef,
    remoteStreams,
    userNames,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    isScreenSharing,
    endCall,
    joinRoom,
    isMicOn,
    isCameraOn,
  } = useWebRTC(roomId, username, addToast);

  useEffect(() => {
    joinRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background text-primary min-h-screen flex flex-col font-body overflow-hidden">
      {/* Dynamic Header */}
      <header className="p-6 flex justify-between items-center z-50">
         <div className="flex items-center gap-4">
            <img src="/muxroom_logo_monochrome_1776460530657-removebg-preview.png" alt="Logo" className="h-8 invert opacity-80" />
            <div>
               <div className="font-display font-black text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">Session Active</div>
               <div className="font-display font-bold text-lg tracking-tighter uppercase">{roomId}</div>
            </div>
         </div>
         <BrandButton variant="glass" className="p-3">
            <Settings size={20} />
         </BrandButton>
      </header>

      {/* Video Grid */}
      <main className="flex-1 p-6 flex flex-wrap gap-6 items-center justify-center overflow-y-auto">
          {/* Local video */}
          <GlassContainer 
            className={`relative flex-1 min-w-[300px] aspect-video overflow-hidden rounded-2xl border-white/20`}
            id="local-video"
            hoverEffect
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover scale-x-[-1] ${!isCameraOn ? 'opacity-0' : 'opacity-100'}`}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-low">
                <VideoOff size={40} className="text-white/10" />
              </div>
            )}
            <div className="absolute top-4 left-4">
               <GlassContainer className="px-3 py-1 rounded-pill">
                  <span className="text-[10px] uppercase tracking-widest font-display font-bold">You (Self)</span>
               </GlassContainer>
            </div>
          </GlassContainer>

          {/* Remote videos */}
          {remoteStreams.size === 0 ? (
            <div className="flex-1 min-w-[300px] aspect-video flex flex-col items-center justify-center text-white/40">
              <div className="w-16 h-16 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-4 animate-spin duration-[10s]">
                 <div className="w-8 h-8 rounded-full border border-white/20" />
              </div>
              <span className="font-display uppercase tracking-[0.4em] text-[10px] font-bold">Scanning for nodes...</span>
            </div>
          ) : (
            Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
              <RemoteVideo
                key={peerId}
                stream={stream}
                label={userNames.get(peerId) || "GUEST_USER"}
              />
            ))
          )}
      </main>

      {/* Global Control Bar */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <GlassContainer className="px-6 py-4 flex items-center gap-4 rounded-pill shadow-2xl">
          <BrandButton 
            onClick={toggleMic}
            variant={isMicOn ? "glass" : "solid"}
            className={`w-14 h-14 rounded-full p-0! flex items-center justify-center transition-all ${!isMicOn ? 'bg-red-500! border-red-500! hover:bg-red-600!' : ''}`}
          >
            {isMicOn ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
          </BrandButton>

          <BrandButton 
            onClick={toggleCamera}
            variant={isCameraOn ? "glass" : "solid"}
            className={`w-14 h-14 rounded-full p-0! flex items-center justify-center transition-all ${!isCameraOn ? 'bg-red-500! border-red-500! hover:bg-red-600!' : ''}`}
          >
            {isCameraOn ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
          </BrandButton>

          <div className="w-px h-8 bg-white/10 mx-2" />

          <BrandButton 
            onClick={toggleScreenShare}
            variant={isScreenSharing ? "solid" : "glass"}
            className="w-14 h-14 rounded-full p-0! flex items-center justify-center"
          >
            {isScreenSharing ? <MonitorOff size={24} className="text-black" /> : <Monitor size={24} className="text-white" />}
          </BrandButton>

          <BrandButton 
            onClick={endCall}
            variant="solid"
            className="w-14 h-14 rounded-full p-0! flex items-center justify-center ml-4"
          >
            <PhoneOff size={24} className="text-black" />
          </BrandButton>
        </GlassContainer>
      </footer>

      {/* Toast overlay */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}