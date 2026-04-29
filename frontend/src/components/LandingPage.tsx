import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Monitor,
  ScreenShare,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { GlassContainer } from "./ui/GlassContainer";
import { BrandButton } from "./ui/BrandButton";

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
    <div className="bg-background text-primary font-body min-h-screen selection:bg-white selection:text-black overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
        <GlassContainer className="max-w-7xl w-full px-8 py-3 flex justify-between items-center rounded-pill">
          <div className="flex items-center gap-4">
            <img src="/muxroom_logo_monochrome_1776460530657-removebg-preview.png" alt="MUXROOM" className="h-8 invert" />
            <span className="font-display font-extrabold text-xl tracking-tighter uppercase text-glow hidden sm:block">
              MUXROOM
            </span>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            <a
              className="text-on-surface-variant hover:text-primary font-medium transition-colors text-sm uppercase tracking-widest"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-on-surface-variant hover:text-primary font-medium transition-colors text-sm uppercase tracking-widest"
              href="#how-it-works"
            >
              How It Works
            </a>
          </div>
          <BrandButton onClick={handleStartRoom} variant="solid" className="py-2 px-6 text-sm">
            Launch Room
          </BrandButton>
        </GlassContainer>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Atmospheric Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="font-display text-7xl md:text-8xl lg:text-9xl font-extrabold leading-[0.9] uppercase mb-8"
              >
                The Digital <br />
                <span className="text-glow">Monolith.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-on-surface-variant text-xl md:text-2xl max-w-xl mb-12 font-medium leading-relaxed"
              >
                No downloads. No friction. Just ethereal, high-definition video 
                conferencing held together by gravitational hierarchy.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-6"
              >
                <BrandButton onClick={handleStartRoom} variant="solid" className="py-5 px-12 text-lg">
                  Start Instant Meeting
                </BrandButton>
                <form onSubmit={handleJoinRoom} className="flex gap-2">
                  <GlassContainer className="px-4 py-2 flex items-center gap-3 rounded-pill">
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-primary placeholder:text-white/20 w-32 uppercase tracking-widest font-display font-bold"
                      placeholder="CODE"
                    />
                    <button type="submit" className="p-2 hover:text-white transition-colors">
                      <ArrowRight size={20} />
                    </button>
                  </GlassContainer>
                </form>
              </motion.div>
            </div>

            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                <GlassContainer className="aspect-4/5 md:aspect-square rounded-3xl p-1 relative overflow-hidden group shadow-2xl" hoverEffect>
                   <motion.div 
                     animate={{ y: [0, -10, 0] }}
                     transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute inset-0 z-0"
                   >
                     <img 
                       src="/hero_visual.png" 
                       alt="MuxRoom Monolith Interface" 
                       className="w-full h-full object-cover rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                     />
                   </motion.div>
                   <div className="absolute inset-0 bg-linear-to-tr from-black/60 via-transparent to-white/5 pointer-events-none" />
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                         <span className="font-display text-[10px] uppercase tracking-[0.4em] text-white/40">Secure Monolith Active</span>
                      </div>
                      <div className="h-px w-full bg-linear-to-r from-white/20 to-transparent" />
                   </div>
                </GlassContainer>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border-t border-r border-white/10 rounded-tr-3xl pointer-events-none" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b border-l border-white/10 rounded-bl-3xl pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (No lines, just tonal shifts) */}
      <section className="bg-surface py-16 md:py-24 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            <div className="text-center md:text-left">
              <div className="font-display font-extrabold text-6xl mb-2 text-glow">10M+</div>
              <div className="text-on-surface-variant font-medium uppercase tracking-[0.2em] text-xs">Meetings Hosted</div>
            </div>
            <div className="text-center md:text-left">
              <div className="font-display font-extrabold text-6xl mb-2 text-glow">150</div>
              <div className="text-on-surface-variant font-medium uppercase tracking-[0.2em] text-xs">Countries Served</div>
            </div>
            <div className="text-center md:text-left">
              <div className="font-display font-extrabold text-6xl mb-2 text-glow">99.9%</div>
              <div className="text-on-surface-variant font-medium uppercase tracking-[0.2em] text-xs">Uptime Reliability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
             <h2 className="font-display text-5xl md:text-6xl font-extrabold uppercase mb-6">Cinema <span className="text-glow">Precision.</span></h2>
             <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-medium">Every detail is engineered for cinematic clarity and professional focus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassContainer className="p-8 min-h-[300px] flex flex-col justify-between" hoverEffect>
              <Monitor size={32} className="text-primary mb-8" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase mb-3">HD Video</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Stunning high definition, optimized for bandwidth in real-time.</p>
              </div>
            </GlassContainer>

            <GlassContainer className="p-8 min-h-[300px] flex flex-col justify-between" hoverEffect>
              <ScreenShare size={32} className="text-primary mb-8" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase mb-3">Instant Share</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Collaborate with zero-latency screen sharing on any browser.</p>
              </div>
            </GlassContainer>

            <GlassContainer className="p-8 min-h-[300px] flex flex-col justify-between" hoverEffect>
              <MessageCircle size={32} className="text-primary mb-8" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase mb-3">Silent Pulse</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">Integrated chat for seamless coordination without interruption.</p>
              </div>
            </GlassContainer>

            <GlassContainer className="p-8 min-h-[300px] flex flex-col justify-between" hoverEffect>
              <ShieldCheck size={32} className="text-primary mb-8" />
              <div>
                <h3 className="font-display text-xl font-bold uppercase mb-3">Secure Flow</h3>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">End-to-end encryption protecting your most valuable conversations.</p>
              </div>
            </GlassContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-display text-6xl md:text-8xl font-extrabold uppercase mb-12 leading-[0.9]">
            Ready to <br />
            <span className="text-glow">Transcend?</span>
          </h2>
          <BrandButton onClick={handleStartRoom} variant="solid" className="py-6 px-16 text-xl mx-auto">
            Launch Your Room
          </BrandButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-3">
              <img src="/muxroom_logo_monochrome_1776460530657-removebg-preview.png" alt="Logo" className="h-6 invert opacity-50" />
              <span className="font-display font-extrabold text-2xl tracking-tighter uppercase text-glow">
                MUXROOM
              </span>
            </div>
            <div className="flex gap-12">
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest">Privacy</a>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest">Security</a>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs uppercase tracking-widest">Status</a>
            </div>
          </div>
          <div className="text-center text-white/20 text-[10px] uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} MuxRoom — Cinematic Authority Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
