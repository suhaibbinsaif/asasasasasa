import { useAudio } from '../context/AudioContext';

export function useAmbientAudio() {
  const { isPlaying, toggleAudio, playAudio, pauseAudio, volume, setVolume, audioMode, setAudioMode } = useAudio();
  return {
    isPlaying,
    toggleAudio,
    playAudio,
    pauseAudio,
    volume,
    setVolume,
    audioMode,
    setAudioMode,
  };
}
