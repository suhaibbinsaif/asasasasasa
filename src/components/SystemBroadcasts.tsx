import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export function SystemBroadcasts() {
  const { addToast } = useToast();

  useEffect(() => {
    // Simulate background network activity with subtle toasts
    const timeouts = [
      setTimeout(() => addToast('New member joined: 0x9A...F3'), 3000),
      setTimeout(() => addToast('Project "Neon Syndicate" approved for deployment.'), 15000),
      setTimeout(() => addToast('Upcoming Event: Neural Net Workshop registration open.'), 35000),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [addToast]);

  return null;
}
