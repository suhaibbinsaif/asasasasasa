import { Target, Zap, Shield } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

export function About() {
  const pillars = [
    { icon: Target, title: 'Hyper-Focused', desc: 'A curated network of top-tier talent.' },
    { icon: Shield, title: 'Absolute Privacy', desc: 'Secure, encrypted communication channels.' },
    { icon: Zap, title: 'High Velocity', desc: 'Rapid ideation and deployment pipelines.' }
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[#050505]/85 backdrop-blur-[2px] relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <ScrollReveal direction="up" delay={0.05} distance={24}>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight uppercase">
                Beyond the <span className="text-cyan-400">Surface</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15} distance={20}>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Shadow Club is not just a community; it is an ecosystem. We provide the infrastructure, network, and resources for the world's most driven individuals to collaborate on bleeding-edge projects.
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {pillars.map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={0.25 + i * 0.12} distance={20}>
                  <div className="flex items-start gap-4 group p-3 -mx-3 rounded-sm hover:bg-white/[0.02] transition-colors">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-cyan-400 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/10 transition-all">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold tracking-wide mb-1 uppercase group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal direction="left" delay={0.2} distance={36} className="relative h-[500px] w-full">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/20 to-transparent border border-white/10 rounded-sm overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30 grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
            </div>
            {/* Abstract tech element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
