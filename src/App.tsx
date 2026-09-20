/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Features } from './components/Features';
import { Membership } from './components/Membership';
import { Events } from './components/Events';
import { Community } from './components/Community';
import { Showcase } from './components/Showcase';
import { Join } from './components/Join';
import { Footer } from './components/Footer';
import { CursorTrail } from './components/CursorTrail';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';
import { CommandConsole } from './components/CommandConsole';
import { ToastProvider } from './context/ToastContext';
import { AudioProvider } from './context/AudioContext';
import { SystemBroadcasts } from './components/SystemBroadcasts';
import { Achievements } from './components/Achievements';
import { ThemeProvider } from './context/ThemeContext';
import { ScrollProgress } from './components/ScrollProgress';
import { Atmosphere } from './components/Atmosphere';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AudioProvider>
          <ToastProvider>
            <div className="min-h-screen bg-black text-gray-200 selection:bg-lime-500/30 selection:text-lime-100 font-sans relative">
              <Atmosphere />
              <ScrollProgress />
              <CursorTrail />
              <CommandConsole />
              <SystemBroadcasts />
              <Navbar />
              <AuthModal />
              <main>
                <Hero />
                <About />
                <Features />
                <Membership />
                <Events />
                <Community />
                <Achievements />
                <Showcase />
                <Join />
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </AudioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
