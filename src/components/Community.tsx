import { ScrollReveal } from './ScrollReveal';

const stats = [
  { value: '10K+', label: 'Global Members', change: '+24% this mo' },
  { value: '250+', label: 'Active Projects', change: 'Across 14 hubs' },
  { value: '80+', label: 'Annual Events', change: 'Global summits' },
  { value: '24/7', label: 'Network Uptime', change: 'Encrypted relay' },
];

export function Community() {
  return (
    <section id="community" className="py-24 bg-[#050505]/85 backdrop-blur-[2px] border-t border-b border-white/5 relative overflow-hidden">
      {/* Background cyber ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {stats.map((stat, i) => (
            <ScrollReveal
              key={stat.label}
              direction="scale"
              distance={20}
              delay={i * 0.12}
              duration={0.7}
              className="p-4 rounded-sm border border-transparent hover:border-white/5 transition-colors"
            >
              <div className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tighter hover:text-cyan-300 transition-colors">
                {stat.value}
              </div>
              <div className="text-cyan-400 text-xs md:text-sm font-mono uppercase tracking-widest mb-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                {stat.change}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
