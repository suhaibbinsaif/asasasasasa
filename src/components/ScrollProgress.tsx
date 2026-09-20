import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
      setProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      id="scroll-progress-container"
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-white/[0.03]"
    >
      <div
        id="scroll-progress-bar"
        className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(0,255,255,0.8)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
