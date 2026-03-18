import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const PrejoinScreen = () => {
  const { roomId } = useParams<{ roomId: string}>();
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

    const initConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Audio Level monitoring setup
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
      // Cleanup on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      // Stream cleanup is handled primarily if the component unmounts. Let localStream state handle track stops later if needed.
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
    if(!meetingId) return;
    navigate(`/${meetingId}`, {
      state: { username: username.trim() || "GUEST_USER" }
    });
  };

  return (
    <div className="bg-[#f7f6f8] text-slate-900 min-h-screen flex flex-col font-['Space_Grotesk']">
      {/* Header */}
      <header className="flex items-center justify-between border-b-2 border-slate-900 px-10 py-4 bg-white z-10 relative">
        <div className="flex items-center gap-4 text-slate-900">
          <span className="material-symbols-outlined text-3xl">videocam</span>
          <h2 className="font-['Barlow_Condensed'] text-3xl font-black uppercase tracking-wider">
            MuxRoom
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <button className="font-['Inter'] text-sm font-semibold uppercase tracking-widest hover:text-[#8c2fca] transition-colors">
            Settings
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Media Preview */}
        <div className="grain bg-brand-blue-cobalt p-6 md:p-8 lg:p-10 flex flex-col justify-center min-h-[60vh] relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-6"
          >
            {/* Video Container */}
            <div className="relative w-full aspect-video bg-black border-4 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCamOn ? "hidden" : ""} scale-x-[-1]`}
              />
              {!isCamOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <span className="material-symbols-outlined text-6xl text-white/50">
                    videocam_off
                  </span>
                </div>
              )}

              {/* Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end gap-4">
                <div className="flex gap-3">
                  <button
                    onClick={toggleCamera}
                    className="flex flex-col items-center gap-1 group"
                    aria-label="Toggle Camera"
                  >
                    <div
                      className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-colors ${
                        isCamOn
                          ? "bg-brand-purple-vivid text-brand-yellow-acid group-hover:bg-brand-yellow-acid group-hover:text-brand-purple-vivid"
                          : "bg-red-500 text-white group-hover:bg-red-600"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isCamOn ? "videocam" : "videocam_off"}
                      </span>
                    </div>
                    <span className="font-['Inter'] text-xs font-bold text-white uppercase bg-black px-1">
                      Cam
                    </span>
                  </button>
                  <button
                    onClick={toggleMic}
                    className="flex flex-col items-center gap-1 group"
                    aria-label="Toggle Microphone"
                  >
                    <div
                      className={`w-12 h-12 border-2 border-black flex items-center justify-center transition-colors ${
                        isMicOn
                          ? "bg-brand-purple-vivid text-brand-yellow-acid group-hover:bg-brand-yellow-acid group-hover:text-brand-purple-vivid"
                          : "bg-red-500 text-white group-hover:bg-red-600"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {isMicOn ? "mic" : "mic_off"}
                      </span>
                    </div>
                    <span className="font-['Inter'] text-xs font-bold text-white uppercase bg-black px-1">
                      Mic
                    </span>
                  </button>
                </div>

                {/* Audio Level Meter */}
                <div className="flex flex-col gap-1 w-1/3 bg-black/50 p-2 border border-white/20">
                  <span className="font-['Inter'] text-[10px] font-bold text-brand-yellow-acid uppercase tracking-widest">
                    Audio Level
                  </span>
                  <div className="flex items-end gap-[2px] h-6 overflow-hidden">
                    {/* Generate fake bars that scale dynamically with true audio level */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const normalizedLevel =
                        audioLevel > 0 ? (audioLevel / 128) * 100 : 5;
                      // Using Math.sin to have a pure function instead of Math.random
                      const pseudoRandomOffset = isMicOn
                        ? Math.sin(i * 1234.5) * 20 - 10
                        : 0;
                      const heightPercentage = isMicOn
                        ? Math.min(
                            100,
                            Math.max(5, normalizedLevel + pseudoRandomOffset),
                          )
                        : 5;

                      return (
                        <div
                          key={i}
                          className={`w-full ${i < 5 ? "bg-brand-yellow-acid" : "bg-brand-yellow-acid/40"} transition-all duration-75`}
                          style={{ height: `${heightPercentage}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: User Input */}
        <div className="grain bg-brand-purple-light p-6 md:p-8 lg:p-10 flex flex-col justify-between border-l-4 border-slate-900 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 flex flex-col gap-6 mt-4"
          >
            <h1 className="font-['Barlow_Condensed'] text-6xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              GET
              <br />
              READY
            </h1>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="name-input"
                className="font-['Inter'] text-slate-900 font-bold uppercase tracking-widest text-lg"
              >
                Enter Your Name
              </label>
              <input
                id="name-input"
                className="w-full bg-white border-4 border-slate-900 p-4 font-['Inter'] text-lg font-bold text-slate-900 focus:outline-none focus:ring-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase placeholder-slate-400"
                placeholder="GUEST_USER_01"
                type="text"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label
                htmlFor="meeting-id"
                className="font-['Inter'] text-slate-900 font-bold uppercase tracking-widest text-lg mt-2"
              >
                Meeting ID
              </label>
              <input
                id="meeting-id"
                className="w-full bg-white border-4 border-slate-900 p-4 font-['Inter'] text-lg font-bold text-slate-900 focus:outline-none focus:ring-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase placeholder-slate-400"
                placeholder="ENTER MEETING ID"
                type="text"
                autoComplete="off"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            className="relative z-10 mt-6"
          >
            <button
              className="w-full bg-brand-yellow-acid border-4 border-slate-900 p-5 flex justify-between items-center group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 outline-none focus:ring-4 focus:ring-purple-500 transition-all cursor-pointer"
              onClick={handleJoinRoom}
            >
              <span className="font-['Barlow_Condensed'] text-4xl md:text-5xl font-black text-brand-purple-vivid uppercase tracking-wide">
                Enter Meeting
              </span>
              <span className="material-symbols-outlined text-5xl text-brand-purple-vivid group-hover:translate-x-2 transition-transform">
                arrow_forward
              </span>
            </button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default PrejoinScreen;
