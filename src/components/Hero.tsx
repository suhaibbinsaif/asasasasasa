import { motion } from 'motion/react';
import { Send, Cloud, Mail, ArrowUpRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Cyber Animated Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        {/* Radial Central Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(163,230,53,0.06)_0%,rgba(0,0,0,0.85)_80%)]" />
        
        {/* Animated Cyber Radar Reticle & Concentric Target Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] md:w-[680px] h-[340px] sm:h-[540px] md:h-[680px] pointer-events-none opacity-40">
          {/* Outer Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border border-lime-500/20 animate-pulse-ring" />
          
          {/* Middle Dotted Ring */}
          <div className="absolute inset-12 sm:inset-20 rounded-full border border-dashed border-lime-400/25" />
          
          {/* Rotating Compass Radar Sweep */}
          <div className="absolute inset-24 sm:inset-36 rounded-full border border-white/10 animate-radar-sweep">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_10px_#a3e635]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-lime-400" />
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-lime-400" />
          </div>

          {/* Center Target Crosshairs */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-lime-500/20 to-transparent" />
        </div>

        {/* Floating Telemetry Coordinates */}
        <div className="hidden lg:flex absolute top-28 left-10 font-mono text-[11px] text-lime-400/60 flex-col gap-1 animate-float-gentle">
          <span className="text-lime-400/90 font-bold tracking-wider">// TELEMETRY.SYS</span>
          <span>LAT: 37.7749° N</span>
          <span>LON: 122.4194° W</span>
          <span className="text-emerald-400/70">SIGNAL: 99.98% LOCKED</span>
        </div>

        <div className="hidden lg:flex absolute top-36 right-10 font-mono text-[11px] text-lime-400/60 flex-col gap-1 text-right animate-float-gentle" style={{ animationDelay: '2s' }}>
          <span className="text-lime-400/90 font-bold tracking-wider">// MESH.ONLINE</span>
          <span>NODES: 1,024 ACTIVE</span>
          <span>LATENCY: 1.2ms</span>
          <span className="text-emerald-400/80">ENCRYPTION: AES-256</span>
        </div>

        {/* Ambient Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-lime-400 font-mono tracking-[0.3em] text-sm md:text-base mb-6 uppercase font-bold">
            Initiate Sequence
          </h2>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white mb-6 uppercase">
            Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">Shadow</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            A private digital club built for creators, technology enthusiasts, gamers, and innovators. 
            Connect, build, and transcend the ordinary.
          </p>

          {/* User's 3 Primary Action Buttons matching screenshot */}
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Telegram Button */}
              <a
                id="hero-btn-telegram"
                href="https://cloudshot.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-black/80 hover:bg-lime-950/25 border border-lime-500/30 hover:border-lime-400 rounded-sm transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.06)] hover:shadow-[0_0_25px_rgba(163,230,53,0.2)]"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-sm bg-lime-500/10 border border-lime-500/40 flex items-center justify-center text-lime-400 group-hover:scale-110 group-hover:bg-lime-500/25 transition-all">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-lime-300 transition-colors">
                      Telegram
                    </div>
                    <div className="text-[11px] font-mono text-lime-400/90 font-medium">cloudshot.ai.studio</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-lime-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>

              {/* 2. Cloud Beta Button with prominent lime highlight & glowing border dot */}
              <a
                id="hero-btn-cloud"
                href="https://shadowtech.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/80 hover:border-lime-400 rounded-sm transition-all duration-300 cursor-pointer shadow-[0_0_25px_rgba(163,230,53,0.18)] hover:shadow-[0_0_35px_rgba(163,230,53,0.35)]"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-sm bg-lime-500/20 border border-lime-400/60 flex items-center justify-center text-lime-300 group-hover:scale-110 group-hover:bg-lime-500/35 transition-all">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-lime-200 transition-colors">
                      Cloud Beta
                    </div>
                    <div className="text-[11px] font-mono text-lime-300 font-medium">shadowtech.ai.studio</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-lime-400 group-hover:text-lime-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />

                {/* Glowing neon lime status dot on bottom border as in screenshot */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_8px_#a3e635]" />
              </a>

              {/* 3. GmailHub Button */}
              <a
                id="hero-btn-gmailhub"
                href="https://gmailhub.ai.studio/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-between p-4 bg-black/80 hover:bg-lime-950/25 border border-lime-500/30 hover:border-lime-400 rounded-sm transition-all duration-300 cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.06)] hover:shadow-[0_0_25px_rgba(163,230,53,0.2)]"
              >
                <div className="flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-sm bg-lime-500/10 border border-lime-500/40 flex items-center justify-center text-lime-400 group-hover:scale-110 group-hover:bg-lime-500/25 transition-all">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-lime-300 transition-colors">
                      GmailHub
                    </div>
                    <div className="text-[11px] font-mono text-lime-400/90 font-medium">gmailhub.ai.studio</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-lime-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lime-500/20 to-transparent" />
    </section>
  );
}
