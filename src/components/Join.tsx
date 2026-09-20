import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from './ScrollReveal';

export function Join() {
  const { openModal } = useAuth();

  return (
    <section id="join" className="py-32 relative bg-[#050505]/85 backdrop-blur-[2px] overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <ScrollReveal direction="up" distance={28} duration={0.8}>
          <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter uppercase">
            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Enter?</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={20} delay={0.15} duration={0.8}>
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto">
            The network is waiting. Submit your application to join the most exclusive digital collective.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="scale" distance={16} delay={0.28} duration={0.75}>
          <button 
            id="join-cta-btn"
            onClick={openModal}
            className="px-12 py-5 bg-cyan-500 text-black font-bold tracking-widest uppercase hover:bg-cyan-400 transition-all rounded-sm text-lg shadow-[0_0_40px_rgba(0,255,255,0.25)] hover:shadow-[0_0_50px_rgba(0,255,255,0.45)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            Join Shadow Club
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
