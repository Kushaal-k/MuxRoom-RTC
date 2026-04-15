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
} from "lucide-react";
import { useWebRTC } from "../hooks/useRTC";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "./ui/Toast";

/** Renders a single remote peer's video stream into a dedicated tile. */
function RemoteVideo({ stream, label }: { stream: MediaStream; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="flex-1 bg-[#111] rounded-none border-[3px] border-[#333] relative min-w-[200px]">
      <video
        ref={ref}
        autoPlay
        playsInline
        className="w-full h-full object-cover rounded-none"
      />
      <div className="absolute top-4 left-4 font-body text-white/50 text-sm">
        {label}
      </div>
    </div>
  );
}

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const username = location.state?.username || "GUEST_USER";

  // Toast state lives here; addToast is threaded into useWebRTC so socket events
  // can surface notifications without coupling the hook to UI concerns.
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
    <>
      <div className="flex flex-col h-screen bg-brand-text-dark">
        <div className="flex-1 flex flex-wrap gap-1 p-1 min-h-0 relative z-10">
          {/* Local video */}
          <div
            className="flex-1 bg-[#111] rounded-none border-[3px] border-[#333] relative min-w-[200px]"
            id="local-video"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover rounded-none"
            />
            <div className="absolute top-4 left-4 font-body text-white/50 text-sm">
              You
            </div>
          </div>

          {/* Remote videos — one tile per connected peer */}
          {remoteStreams.size === 0 ? (
            <div className="flex-1 bg-[#111] rounded-none border-[3px] border-[#333] relative min-w-[200px] flex items-center justify-center">
              <span className="text-white/20 font-body text-sm">Waiting for others...</span>
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
        </div>

        {/* Control bar */}
        <div className="flex justify-center flex-wrap gap-3 p-[14px] bg-brand-bg-base border-t-[3px] border-brand-text-dark grain z-20">
          <div className="font-display font-bold text-xl px-4 py-2 border-r-[3px] border-brand-text-dark flex items-center">
            ROOM: {roomId}
          </div>

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
            id="btn-screen-share"
            onClick={toggleScreenShare}
            className={`flex items-center gap-2 px-6 py-2 rounded-none border-[3px] font-display font-bold text-lg uppercase cursor-pointer transition-all grain ${
              isScreenSharing
                ? "bg-white text-brand-text-dark border-brand-text-dark hover:bg-gray-100"
                : "bg-red-600 text-white border-brand-text-dark"
            }`}
          >
            {isScreenSharing ? <Monitor size={20} /> : <MonitorOff size={20} />}
            Screen Share
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

      {/* Toast overlay — fixed bottom-right, z-50, renders above everything */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}