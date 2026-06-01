/**
 * ResQ AI Cinematic Loader - Redesigned
 * 
 * Premium loader with accurate Indian state coordinates
 * 
 * @animation_sequence
 * 0-1s:   Fade in, map appears
 * 1-4s:   Red scan downward
 * 4-6s:   Green scan upward (activation)
 * 6-7s:   Map fully fades out
 * 7-10s:  ResQ AI branding (3 seconds)
 * 10s:    Complete
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IndiaMap from '../mapLoader/Indian_map.png';

const ANIMATION_DURATION = 9000; // 9 seconds total
const SKIP_TRANSITION_DURATION = 300;

interface CinematicLoaderProps {
  onComplete?: () => void;
}

export function CinematicLoader({ onComplete }: CinematicLoaderProps = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSkipping, setIsSkipping] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing Emergency Response System');

  useEffect(() => {
    // Animate loading text with project-related messages
    const messages = [
      'Initializing Emergency Response System',
      'Connecting to Disaster Network',
      'Loading Real-time Data',
      'Activating AI Coordination',
      'System Ready'
    ];
    let messageIndex = 0;

    const loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingText(messages[messageIndex]);
    }, 1200);

    // Auto-hide after animation completes
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, ANIMATION_DURATION);

    return () => {
      clearInterval(loadingInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (!isSkipping) {
      setIsSkipping(true);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, SKIP_TRANSITION_DURATION);
    }
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#0A0A0A] cursor-pointer overflow-hidden"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isSkipping ? 0.3 : 0.5, ease: 'easeInOut' }}
        >
          {/* Background Grid - Simplified */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(220, 38, 38, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(220, 38, 38, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Corner Accents - Simplified */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-red-500/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 8, times: [0, 0.1, 0.7, 0.8] }}
            />
            <motion.div
              className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-red-500/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 8, times: [0, 0.1, 0.7, 0.8] }}
            />
            <motion.div
              className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-green-500/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1] }}
              transition={{ duration: 8, times: [0, 0.5, 0.6, 1] }}
            />
            <motion.div
              className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-green-500/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1] }}
              transition={{ duration: 8, times: [0, 0.5, 0.6, 1] }}
            />
          </div>

          {/* Minimal Floating Particles */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: '2px',
                    height: '2px',
                    backgroundColor: i < 10 ? '#EF4444' : '#10B981',
                  }}
                  animate={{
                    y: [0, -40, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Content Container */}
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* India Map Container */}
            <motion.div
              className="relative w-full max-w-[500px] h-[600px] flex items-center justify-center px-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: [0, 1, 1, 1, 0],
                scale: [0.95, 1, 1, 1, 1]
              }}
              transition={{ 
                duration: 10,
                times: [0, 0.1, 0.5, 0.6, 0.7],
                ease: 'easeOut'
              }}
            >
              {/* Map Glow Effect */}
              <motion.div
                className="absolute inset-0 blur-3xl opacity-20"
                style={{
                  background: 'radial-gradient(circle, #DC2626 0%, transparent 70%)',
                }}
                animate={{
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="absolute inset-0 blur-3xl"
                style={{
                  background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0, 0.25, 0.25, 0],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.4, 0.5, 0.6, 0.7],
                }}
              />

              {/* India Map Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.img
                  src={IndiaMap}
                  alt="India Map"
                  className="w-full h-full object-contain relative z-10"
                  style={{
                    filter: 'brightness(1.4) contrast(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                  }}
                  animate={{
                    filter: [
                      'brightness(1.4) contrast(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                      'brightness(1.6) contrast(1.3) drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
                      'brightness(1.4) contrast(1.2) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Red Scanning Beam (1-4s) */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute left-0 right-0 h-[5px] pointer-events-none z-20"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #EF4444 20%, #FFFFFF 50%, #EF4444 80%, transparent)',
                      boxShadow: '0 0 25px #EF4444, 0 0 40px rgba(239, 68, 68, 0.4)',
                      filter: 'blur(0.5px)',
                    }}
                    initial={{ top: '-10px' }}
                    animate={{ top: ['-10px', '110%'] }}
                    transition={{
                      duration: 3,
                      delay: 1,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                )}

                {/* Green Scanning Beam (4-6s) */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute left-0 right-0 h-[5px] pointer-events-none z-20"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #10B981 20%, #FFFFFF 50%, #10B981 80%, transparent)',
                      boxShadow: '0 0 25px #10B981, 0 0 40px rgba(16, 185, 129, 0.4)',
                      filter: 'blur(0.5px)',
                    }}
                    initial={{ top: '110%' }}
                    animate={{ top: ['110%', '-10px'] }}
                    transition={{
                      duration: 2,
                      delay: 4,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                )}

                {/* Green Activation Overlay */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none z-15"
                    style={{
                      background: 'linear-gradient(to bottom, transparent 20%, rgba(16, 185, 129, 0.15) 60%, rgba(16, 185, 129, 0.25) 100%)',
                      mixBlendMode: 'screen',
                    }}
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    animate={{ clipPath: 'inset(0% 0 0 0)' }}
                    transition={{
                      duration: 2,
                      delay: 4,
                      ease: [0.45, 0, 0.55, 1],
                    }}
                  />
                )}

                {/* Accurate Indian State/City Nodes - Centered on PNG */}
                {!prefersReducedMotion && [
                  { top: '66%', left: '38%', name: 'Jammu' }, // Jammu & Kashmir
                  { top: '68%', left: '58%', name: 'Delhi' }, // Delhi
                  { top: '70%', left: '48%', name: 'Jaipur' }, // Rajasthan
                  { top: '38%', left: '40%', name: 'Mumbai' }, // Maharashtra
                  { top: '40%', left: '62%', name: 'Lucknow' }, // Uttar Pradesh
                  { top: '42%', left: '78%', name: 'Kolkata' }, // West Bengal
                  { top: '48%', left: '52%', name: 'Bhopal' }, // Madhya Pradesh
                  { top: '52%', left: '70%', name: 'Bhubaneswar' }, // Odisha
                  { top: '58%', left: '60%', name: 'Nagpur' }, // Central India
                  { top: '58%', left: '45%', name: 'Goa' }, // Goa
                  { top: '68%', left: '62%', name: 'Hyderabad' }, // Telangana
                  { top: '74%', left: '55%', name: 'Bangalore' }, // Karnataka
                  { top: '82%', left: '65%', name: 'Chennai' }, // Tamil Nadu
                  { top: '88%', left: '60%', name: 'Kochi' }, // Kerala
                ].map((location, i) => (
                  <motion.div
                    key={`node-${i}`}
                    className="absolute w-2.5 h-2.5 rounded-full bg-green-400 z-20"
                    style={{ 
                      top: location.top, 
                      left: location.left,
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4)',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.3, 1],
                      opacity: [0, 1, 1],
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 4.5 + i * 0.08,
                      ease: 'easeOut',
                    }}
                  >
                    {/* Pulse Ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-green-400"
                      animate={{
                        scale: [1, 2.5],
                        opacity: [0.7, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: 4.5 + i * 0.08,
                        ease: 'easeOut',
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Loading Text - Clean Animated Style */}
              <div className="absolute bottom-3 left-0 right-0 flex flex-col items-center gap-6 px-8">
                {/* Animated Loading Text */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={loadingText}
                    className="text-white/90 text-base md:text-lg font-light tracking-wider"
                    style={{ 
                      fontFamily: "'Inter', sans-serif",
                      textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
                    }}
                    initial={{ 
                      opacity: 0, 
                      y: 10,
                    }}
                    animate={{ 
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{ 
                      opacity: 0,
                      y: -10,
                      transition: { duration: 0.3 }
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: 'easeOut',
                    }}
                  >
                    {loadingText}
                  </motion.div>
                </AnimatePresence>

                {/* Horizontal Progress Line - Progressive Fill */}
                <div className="w-full max-w-md h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                  {/* Filling progress line */}
                  <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-sky-400 to-sky-500"
                    style={{
                      boxShadow: '0 0 10px rgba(14, 165, 233, 0.6)',
                    }}
                    initial={{ width: '0%' }}
                    animate={{
                      width: ['0%', '33%', '50%', '100%'],
                    }}
                    transition={{
                      duration: 6.5,
                      times: [0, 0.35, 0.6, 1],
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* ResQ AI Branding - Centered with ResQ AI above tagline */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-8"
              style={{ zIndex: 9999 }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0, 1, 1, 0], 
              }}
              transition={{
                duration: 10,
                times: [0, 0.69, 0.71, 0.96, 1],
                ease: 'easeOut',
              }}
            >
              {/* Animated Background Glow */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] blur-[120px] pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
                  zIndex: 1,
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.69, 0.72, 0.96, 1],
                }}
              />

              {/* ResQ AI Logo - Above tagline */}
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 60px rgba(16, 185, 129, 0.9), 0 0 120px rgba(16, 185, 129, 0.6), 0 4px 30px rgba(0, 0, 0, 0.9)',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                ResQ AI
              </h1>

              {/* Tagline - Below ResQ AI */}
              <p
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wide text-white/95"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '0 2px 15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.4)',
                  fontStyle: 'italic',
                  position: 'relative',
                  zIndex: 10,
                }}
              >
                Protecting Lives. Powered by Intelligence.
              </p>

              {/* Decorative Line */}
              <motion.div
                className="relative mt-8 w-[350px] h-[2px] z-10"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0, 0, 1, 1, 0],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.69, 0.77, 0.81, 0.96, 1],
                }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-full bg-gradient-to-r from-transparent via-green-500 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ 
                    scaleX: [0, 0, 0, 1, 1, 0.9],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.78, 0.82, 0.96, 1],
                    ease: 'easeOut',
                  }}
                  style={{ transformOrigin: 'center' }}
                />
              </motion.div>

              {/* Corner Brackets */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[90%] max-w-[850px] h-[420px]"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0, 0, 0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: 10,
                  times: [0, 0.69, 0.74, 0.78, 0.96, 1],
                }}
              >
                <motion.div
                  className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-green-500/60"
                  initial={{ x: 15, y: 15 }}
                  animate={{
                    x: [15, 15, 15, 0, 0, 0],
                    y: [15, 15, 15, 0, 0, 0],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.74, 0.77, 0.96, 1],
                  }}
                />
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-green-500/60"
                  initial={{ x: -15, y: 15 }}
                  animate={{
                    x: [-15, -15, -15, 0, 0, 0],
                    y: [15, 15, 15, 0, 0, 0],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.75, 0.78, 0.96, 1],
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-green-500/60"
                  initial={{ x: 15, y: -15 }}
                  animate={{
                    x: [15, 15, 15, 0, 0, 0],
                    y: [-15, -15, -15, 0, 0, 0],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.76, 0.79, 0.96, 1],
                  }}
                />
                <motion.div
                  className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-green-500/60"
                  initial={{ x: -15, y: -15 }}
                  animate={{
                    x: [-15, -15, -15, 0, 0, 0],
                    y: [-15, -15, -15, 0, 0, 0],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.77, 0.8, 0.96, 1],
                  }}
                />
              </motion.div>

              {/* Floating Particles */}
              {!prefersReducedMotion && [...Array(15)].map((_, i) => (
                <motion.div
                  key={`text-particle-${i}`}
                  className="absolute w-1.5 h-1.5 bg-green-400 rounded-full"
                  style={{
                    left: `${25 + Math.random() * 50}%`,
                    top: `${35 + Math.random() * 30}%`,
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.9)',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 0, 0, 0.8, 0.3, 0.8, 0],
                    scale: [0, 0, 0, 1, 1.5, 1, 0],
                    y: [0, 0, 0, -15, -30, -50, -70],
                    x: [0, 0, 0, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 45],
                  }}
                  transition={{
                    duration: 10,
                    times: [0, 0.69, 0.75, 0.79, 0.84, 0.89, 0.96],
                    delay: 0.71 + i * 0.03,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>

            {/* Skip Hint */}
            <motion.div
              className="absolute bottom-8 text-white/30 text-xs tracking-wider"
              style={{ fontFamily: "'Inter', sans-serif" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.5, 0] }}
              transition={{ 
                duration: 10,
                times: [0, 0.1, 0.9, 0.95],
              }}
            >
              Click anywhere to skip
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
