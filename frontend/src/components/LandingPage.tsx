import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Monitor,
  ScreenShare,
  MessageCircle,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  const handleStartRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 9);
    navigate(`/preview/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      navigate(`/preview/${joinCode.trim()}`);
    }
  };

  return (
    <div className="bg-white text-brand-text-dark font-body min-h-screen selection:bg-brand-yellow-acid selection:text-brand-text-dark">
      <nav className="bg-brand-purple-vivid grain border-b-4 border-brand-text-dark">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center">
              <span className="font-display font-black text-4xl text-white tracking-wider uppercase">
                MUXROOM
              </span>
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a
                className="text-white hover:text-brand-yellow-acid font-display text-xl uppercase font-bold tracking-wide transition-colors"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-white hover:text-brand-yellow-acid font-display text-xl uppercase font-bold tracking-wide transition-colors"
                href="#how-it-works"
              >
                How It Works
              </a>
            </div>
            <div>
              <button
                onClick={handleStartRoom}
                className="inline-block bg-brand-yellow-acid text-brand-purple-vivid font-display font-black text-xl px-6 py-3 border-4 border-brand-purple-vivid hover:bg-white transition-colors duration-200 uppercase tracking-widest shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#1A1A1A]"
              >
                Start a Room
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full border-b-4 border-brand-text-dark">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px] bg-brand-text-dark">
          <div className="bg-brand-purple-light grain p-10 md:p-16 flex flex-col justify-center min-h-[500px]">
            <div className="relative z-10">
              <h1 className="font-display font-black text-7xl lg:text-8xl text-white leading-none uppercase mb-6 drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                Start
                <br />
                Your
                <br />
                Meeting.
              </h1>
              <p className="font-body text-xl font-medium text-brand-text-dark leading-tight max-w-sm">
                No downloads. No friction. Just instant, high-quality video
                conferencing right in your browser.
              </p>
            </div>
          </div>

          <div className="bg-brand-purple-vivid grain p-10 md:p-16 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
            <div className="absolute w-[150%] h-[150%] border-[20px] border-white/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-10 w-full max-w-md text-center">
              <h2 className="font-display font-bold text-4xl text-white uppercase mb-6 drop-shadow-[2px_2px_0_rgba(26,26,26,1)]">
                Join with Code
              </h2>
              <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full bg-white/10 border-4 border-white text-white font-display text-2xl p-4 text-center placeholder-white/70 focus:outline-none focus:ring-0 focus:border-brand-yellow-acid uppercase tracking-widest transition-colors duration-200"
                  placeholder="Enter Room Code"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-brand-purple-vivid font-display font-black text-2xl py-4 border-4 border-transparent hover:border-brand-text-dark hover:bg-brand-yellow-acid transition-colors duration-200 uppercase tracking-widest shadow-[4px_4px_0px_#1A1A1A]"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>

          <div className="bg-brand-yellow-acid grain flex flex-col min-h-[500px]">
            <button
              onClick={handleStartRoom}
              className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 hover:bg-white transition-colors duration-300 group cursor-pointer border-none"
            >
              <span
                className="font-display font-black text-6xl lg:text-8xl text-brand-purple-vivid text-center uppercase leading-none transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[4px_4px_0_rgba(26,26,26,0.15)]"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              >
                Start
                <br />A Room
              </span>
              <ArrowDown className="text-brand-purple-vivid w-16 h-16 mt-8 transform group-hover:translate-y-4 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-blue-cobalt grain border-b-4 border-brand-text-dark py-12">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x-4 divide-white/30">
            <div className="py-4">
              <div className="font-display font-black text-6xl text-white drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                10M+
              </div>
              <div className="font-display text-xl text-brand-purple-light uppercase tracking-widest mt-2">
                Meetings Hosted
              </div>
            </div>
            <div className="py-4">
              <div className="font-display font-black text-6xl text-white drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                150
              </div>
              <div className="font-display text-xl text-brand-purple-light uppercase tracking-widest mt-2">
                Countries Served
              </div>
            </div>
            <div className="py-4">
              <div className="font-display font-black text-6xl text-white drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                99.9%
              </div>
              <div className="font-display text-xl text-brand-purple-light uppercase tracking-widest mt-2">
                Uptime Reliability
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white"
      >
        <h2 className="font-display font-black text-5xl md:text-7xl text-center mb-16 uppercase text-brand-text-dark drop-shadow-[4px_4px_0_rgba(139,47,201,0.2)]">
          Everything You Need
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[3px] auto-rows-min bg-brand-text-dark border-4 border-brand-text-dark">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-brand-purple-vivid grain border-0 p-8 md:col-span-2 min-h-[300px] flex flex-col justify-end"
          >
            <div className="relative z-10">
              <Monitor className="text-white w-14 h-14 mb-4" />
              <h3 className="font-display font-black text-4xl text-white uppercase mb-2">
                Crystal Clear HD Video
              </h3>
              <p className="font-body text-white/90 text-lg max-w-md font-medium">
                Experience meetings in stunning high definition, automatically
                optimized for your bandwidth.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-brand-yellow-acid grain border-0 p-8 min-h-[300px] flex flex-col justify-between"
          >
            <div className="relative z-10 self-end">
              <ScreenShare className="text-brand-purple-vivid w-14 h-14" />
            </div>
            <div className="relative z-10">
              <h3 className="font-display font-black text-3xl text-brand-purple-vivid uppercase mb-2">
                Screen Share
              </h3>
              <p className="font-body text-brand-text-dark font-medium">
                Share your entire screen, a window, or a specific tab instantly.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-brand-blue-cobalt grain border-0 p-8 min-h-[300px] flex flex-col justify-between"
          >
            <div className="relative z-10">
              <h3 className="font-display font-black text-3xl text-white uppercase mb-2">
                Live Chat
              </h3>
              <p className="font-body text-white/90 font-medium">
                Communicate without interrupting the speaker with integrated
                text chat.
              </p>
            </div>
            <div className="relative z-10 self-end mt-4">
              <MessageCircle className="text-white w-14 h-14" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-brand-purple-light grain border-0 p-8 md:col-span-2 min-h-[300px] flex flex-col sm:flex-row items-center sm:items-end justify-between"
          >
            <div className="relative z-10 mb-6 sm:mb-0">
              <h3 className="font-display font-black text-4xl text-brand-purple-vivid uppercase mb-2">
                Secure & Private
              </h3>
              <p className="font-body text-brand-text-dark font-bold text-lg max-w-sm">
                End-to-end encryption ensures your conversations remain
                confidential.
              </p>
            </div>
            <div className="relative z-10">
              <ShieldCheck className="text-brand-purple-vivid w-24 h-24" />
            </div>
          </motion.div>
        </div>
      </div>

      <div
        id="how-it-works"
        className="bg-brand-purple-vivid grain border-y-4 border-brand-text-dark py-24"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display font-black text-5xl md:text-7xl text-white text-center mb-16 uppercase drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center p-6 border-4 border-transparent hover:border-brand-yellow-acid transition-colors duration-300"
            >
              <div className="font-display font-black text-8xl text-brand-yellow-acid leading-none mb-4 drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                01
              </div>
              <h3 className="font-display font-bold text-3xl text-white uppercase mb-3">
                Create
              </h3>
              <p className="font-body text-white/90 text-lg font-medium">
                Click 'Start a Room' to generate a unique, secure meeting link
                instantly.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center p-6 border-4 border-transparent hover:border-brand-yellow-acid transition-colors duration-300"
            >
              <div className="font-display font-black text-8xl text-brand-yellow-acid leading-none mb-4 drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                02
              </div>
              <h3 className="font-display font-bold text-3xl text-white uppercase mb-3">
                Share
              </h3>
              <p className="font-body text-white/90 text-lg font-medium">
                Send the link or room code to your participants. No accounts
                needed.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center p-6 border-4 border-transparent hover:border-brand-yellow-acid transition-colors duration-300"
            >
              <div className="font-display font-black text-8xl text-brand-yellow-acid leading-none mb-4 drop-shadow-[4px_4px_0_rgba(26,26,26,1)]">
                03
              </div>
              <h3 className="font-display font-bold text-3xl text-white uppercase mb-3">
                Meet
              </h3>
              <p className="font-body text-white/90 text-lg font-medium">
                Everyone joins in the browser. Start collaborating immediately.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-brand-yellow-acid grain border-b-4 border-brand-text-dark py-24 text-center">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="font-display font-black text-6xl md:text-8xl text-brand-purple-vivid uppercase mb-8 leading-tight drop-shadow-[4px_4px_0_rgba(26,26,26,0.15)]">
            Ready To
            <br />
            Meet?
          </h2>
          <button
            onClick={handleStartRoom}
            className="inline-block bg-brand-purple-vivid text-white font-display font-black text-3xl px-12 py-6 border-4 border-brand-text-dark hover:bg-white hover:text-brand-purple-vivid transition-colors duration-200 uppercase tracking-widest shadow-[8px_8px_0_rgba(26,26,26,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0_rgba(26,26,26,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px]"
          >
            Start For Free
          </button>
        </div>
      </div>

      <footer className="bg-brand-text-dark py-12 grain">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <span className="font-display font-black text-4xl text-white tracking-wider mb-4 md:mb-0 uppercase">
              MUXROOM
            </span>
            <div className="flex space-x-6">
              <a
                className="text-brand-purple-light hover:text-brand-yellow-acid font-display uppercase tracking-widest text-lg transition-colors"
                href="#"
              >
                About
              </a>
              <a
                className="text-brand-purple-light hover:text-brand-yellow-acid font-display uppercase tracking-widest text-lg transition-colors"
                href="#"
              >
                Privacy
              </a>
              <a
                className="text-brand-purple-light hover:text-brand-yellow-acid font-display uppercase tracking-widest text-lg transition-colors"
                href="#"
              >
                Terms
              </a>
            </div>
          </div>
          <div className="text-center md:text-left text-white/50 font-body text-sm border-t border-white/20 pt-8">
            © {new Date().getFullYear()} MuxRoom. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
