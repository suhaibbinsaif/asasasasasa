import { Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScrollReveal } from './ScrollReveal';

const plans = [
  {
    name: 'CORE',
    price: 'Free',
    desc: 'For emerging talent and observers.',
    features: ['Public Forums', 'Weekly Newsletter', 'Read-Only Project Access', 'Standard Events'],
    color: 'text-gray-300',
    border: 'border-white/10 hover:border-gray-500',
    btn: 'bg-white/10 hover:bg-white/20 text-white',
  },
  {
    name: 'ELITE',
    price: '$49/mo',
    desc: 'For active creators and builders.',
    features: ['Private Community Channels', 'Project Collaboration', 'Resource Library', 'Priority Event Access'],
    color: 'text-cyan-400',
    border: 'border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.1)]',
    btn: 'bg-cyan-500 text-black hover:bg-cyan-400',
  },
  {
    name: 'BLACK',
    price: 'Invite Only',
    desc: 'For industry leaders and innovators.',
    features: ['Inner Circle Access', 'Venture Funding Ops', 'Proprietary Tech Access', 'VIP Summits'],
    color: 'text-purple-400',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    btn: 'bg-purple-500/10 text-purple-400 border border-purple-500/50 hover:bg-purple-500/20',
  }
];

export function Membership() {
  const { openModal } = useAuth();

  return (
    <section id="membership" className="py-24 md:py-32 bg-[#050505]/85 backdrop-blur-[2px] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" distance={24} className="text-center mb-16">
          <h2 className="text-cyan-400 font-mono tracking-[0.2em] text-sm mb-4 uppercase">Access Tiers</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase">Membership</h3>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal
              key={plan.name}
              direction="up"
              distance={36}
              delay={i * 0.15}
              duration={0.75}
              className="h-full"
            >
              <div
                className={`h-full p-8 bg-black/50 backdrop-blur-sm border ${plan.border} flex flex-col rounded-sm transition-all duration-300 relative overflow-hidden`}
              >
                <h4 className={`text-2xl font-bold tracking-widest uppercase mb-2 ${plan.color}`}>{plan.name}</h4>
                <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                <p className="text-gray-500 text-sm mb-8">{plan.desc}</p>
                
                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-gray-300 text-sm">
                      <Check className={`w-4 h-4 ${plan.color}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={openModal}
                  className={`w-full py-4 font-bold tracking-widest uppercase rounded-sm transition-colors text-sm cursor-pointer ${plan.btn}`}
                >
                  Apply Now
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
