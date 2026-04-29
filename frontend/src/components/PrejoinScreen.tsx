import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, CameraOff, Mic, MicOff, Settings, ArrowRight } from "lucide-react";
import { GlassContainer } from "./ui/GlassContainer";
import { BrandButton } from "./ui/BrandButton";

const PrejoinScreen = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [meetingId, setMeetingId] = useState<string>(roomId || "");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [username, setUsername] = useState<string>("");
  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let streamRef: MediaStream | null = null;

    const initConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef = stream;

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const analyzer = audioContext.createAnalyser();
        analyzerRef.current = analyzer;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);

        analyzer.fftSize = 256;
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const updateAudioLevel = () => {
          if (!mounted) return;
          analyzer.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        };

        updateAudioLevel();
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    initConnection();

    return () => {
      mounted = false;
      streamRef?.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const handleJoinRoom = () => {
    if (!meetingId) return;
    navigate(`/${meetingId}`, {
      state: { username: username.trim() || "GUEST_USER" }
    });
  };

  return (
    <div className="bg-background text-primary min-h-screen flex flex-col font-body">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <GlassContainer className="max-w-7xl w-full px-8 py-3 flex justify-between items-center rounded-pill">
          <div className="flex items-center gap-4">
             <img src="/muxroom_logo_monochrome_1776460530657-removebg-preview.png" alt="Logo" className="h-8 invert" />
             <span className="font-display font-extrabold text-xl tracking-tighter uppercase">MUXROOM</span>
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Settings size={20} />
          </button>
        </GlassContainer>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: Video Preview */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <GlassContainer className="aspect-video rounded-3xl overflow-hidden relative group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCamOn ? "hidden" : ""} scale-x-[-1]`}
              />
              {!isCamOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-low">
                   <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mb-4">
                      <CameraOff size={40} className="text-white/20" />
                   </div>
                   <span className="text-white/20 font-display uppercase tracking-widest text-xs">Visual feed suspended</span>
                </div>
              )}

              {/* Media Controls Overlay */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <GlassContainer 
                  className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isCamOn ? 'bg-white/10' : 'bg-red-500/20 border-red-500/50'}`}
                  onClick={toggleCamera}
                  hoverEffect
                >
                  {isCamOn ? <Camera size={20} /> : <CameraOff size={20} className="text-red-500" />}
                </GlassContainer>
                
                <GlassContainer 
                  className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${isMicOn ? 'bg-white/10' : 'bg-red-500/20 border-red-500/50'}`}
                  onClick={toggleMic}
                  hoverEffect
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} className="text-red-500" />}
                </GlassContainer>
              </div>

              {/* Audio Meter Visualizer */}
              <div className="absolute top-6 right-6 flex items-end gap-[2px] h-8 w-12">
                 {Array.from({ length: 6 }).map((_, i) => {
                    const normalizedLevel = audioLevel > 0 ? (audioLevel / 128) * 100 : 5;
                    const pseudoRandomOffset = isMicOn ? Math.sin(i * 1234.5) * 20 - 10 : 0;
                    const height = isMicOn ? Math.min(100, Math.max(10, normalizedLevel + pseudoRandomOffset)) : 10;
                    return (
                       <div 
                        key={i} 
                        className={`w-1 rounded-full transition-all duration-75 ${i > 4 ? 'bg-white/10' : 'bg-white/40'}`}
                        style={{ height: `${height}%` }}
                       />
                    );
                 })}
              </div>
            </GlassContainer>
          </motion.div>
        </div>

        {/* Right: Setup Info */}
        <div className="lg:col-span-5 flex flex-col gap-10">
           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
           >
              <h1 className="font-display text-5xl md:text-6xl font-extrabold uppercase leading-[0.9] mb-4">
                Verify <br /> <span className="text-glow">Presence.</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
                Calibrate your sensory inputs before entering the digital monolith.
              </p>
           </motion.div>

           <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-8"
           >
              <div className="flex flex-col gap-3">
                 <label className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">Identity Signature</label>
                 <GlassContainer className="p-1 rounded-pill">
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="ENTER IDENTIFIER..."
                      className="w-full bg-transparent border-none focus:ring-0 px-6 py-3 font-display font-bold uppercase tracking-widest placeholder:text-white/20"
                    />
                 </GlassContainer>
              </div>

              <div className="flex flex-col gap-3">
                 <label className="text-white/20 text-[10px] uppercase tracking-[0.4em] font-bold">Node Address</label>
                 <GlassContainer className="p-1 rounded-pill">
                    <input 
                      type="text"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      placeholder="ENTER MEETING ID..."
                      className="w-full bg-transparent border-none focus:ring-0 px-6 py-3 font-display font-bold uppercase tracking-widest placeholder:text-white/20"
                    />
                 </GlassContainer>
              </div>

              <BrandButton onClick={handleJoinRoom} variant="solid" className="w-full py-5 text-xl mt-4">
                 Manifest Presence <ArrowRight size={24} className="ml-2" />
              </BrandButton>
           </motion.div>
        </div>
      </main>

      {/* Atmospheric Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default PrejoinScreen;
