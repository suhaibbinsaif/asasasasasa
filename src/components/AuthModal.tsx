import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Fingerprint, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function AuthModal() {
  const { isModalOpen, closeModal } = useAuth();
  const { addToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [status, setStatus] = useState<'idle' | 'authenticating' | 'success'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearPendingTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  // Body scroll lock & Escape key handling
  useEffect(() => {
    if (!isModalOpen) {
      clearPendingTimeouts();
      const timer = setTimeout(() => {
        setStatus('idle');
        setLogs([]);
        setEmail('');
        setPassword('');
        setIsLogin(true);
      }, 300);
      timeoutsRef.current.push(timer);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'idle') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearPendingTimeouts();
    };
  }, [isModalOpen, status, closeModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setStatus('authenticating');
    setLogs(['> INITIATING SECURE CONNECTION...', '> EXCHANGING ENCRYPTION KEYS...']);

    const t1 = setTimeout(() => setLogs((l) => [...l, '> VERIFYING CREDENTIALS...']), 600);
    const t2 = setTimeout(() => setLogs((l) => [...l, '> VALIDATING CLEARANCE LEVEL...']), 1200);
    const t3 = setTimeout(() => setLogs((l) => [...l, '> ACCESS GRANTED.']), 1800);

    const t4 = setTimeout(() => {
      setStatus('success');
      addToast(`Operative clearance verified for ${email}. Welcome.`);
      const t5 = setTimeout(() => {
        closeModal();
      }, 1600);
      timeoutsRef.current.push(t5);
    }, 2200);

    timeoutsRef.current.push(t1, t2, t3, t4);
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={() => {
            if (status === 'idle') closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-dialog-title"
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#050505] border border-cyan-500/30 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.12)]"
          >
            {/* Animated scanning line */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
              className="absolute left-0 w-full h-[2px] bg-cyan-400/40 shadow-[0_0_8px_cyan] z-0 pointer-events-none"
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 bg-black/60">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 id="auth-dialog-title" className="font-mono text-sm tracking-widest text-white uppercase">
                    {isLogin ? 'Identity Verification' : 'New Clearance Request'}
                  </h3>
                  <div className="text-[10px] text-cyan-400/70 font-mono tracking-wider">
                    Secured Protocol • Demo Verification
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-500 hover:text-white transition-colors p-1"
                disabled={status !== 'idle'}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="relative z-10 p-6">
              {status === 'idle' && (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label 
                      htmlFor="operative-email"
                      className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest block"
                    >
                      Operative ID (Email)
                    </label>
                    <input
                      id="operative-email"
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-sm px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors placeholder:text-gray-600"
                      placeholder="agent@shadow.club"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label 
                      htmlFor="operative-passkey"
                      className="text-xs font-mono text-cyan-400/80 uppercase tracking-widest block"
                    >
                      Passkey
                    </label>
                    <input
                      id="operative-passkey"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-sm px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/60 transition-colors placeholder:text-gray-600"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-cyan-500 text-black py-3.5 font-bold tracking-widest uppercase hover:bg-cyan-400 transition-colors rounded-sm text-sm cursor-pointer shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                  >
                    <Fingerprint className="w-5 h-5" />
                    {isLogin ? 'Authenticate' : 'Request Access'}
                  </button>

                  <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-gray-500 justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Frontend Interactive Demo Clearance
                  </div>

                  <div className="text-center pt-3 border-t border-white/10 mt-4">
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors uppercase tracking-widest"
                    >
                      {isLogin ? 'Apply for Clearance →' : '← Back to Authentication'}
                    </button>
                  </div>
                </motion.form>
              )}

              {status === 'authenticating' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-6 flex flex-col items-center justify-center space-y-5"
                >
                  <div className="relative">
                    <div className="w-14 h-14 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    <Fingerprint className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="w-full bg-black border border-white/10 rounded-sm p-4 h-32 overflow-hidden flex flex-col justify-end">
                    <div className="space-y-1 font-mono text-xs text-cyan-400/90">
                      {logs.map((log, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 flex flex-col items-center justify-center space-y-3 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <CheckCircle2 className="w-14 h-14 text-cyan-400" />
                  </motion.div>
                  <h4 className="text-lg font-bold tracking-widest text-white uppercase">
                    Clearance Granted
                  </h4>
                  <p className="text-xs font-mono text-cyan-400/80 tracking-wider">
                    Secured operative session initialized.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
