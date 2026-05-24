import React from 'react'
import { motion } from 'framer-motion'

export function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl filter"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer Shield with Glassy Effect */}
        <motion.path 
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d="M50 5 L15 20 V45 C15 70 50 95 50 95 C50 95 85 70 85 45 V20 L50 5Z" 
          fill="url(#logo-gradient)" 
          stroke="#450a0a"
          strokeWidth="2"
        />
        
        {/* Glow Layer */}
        <path 
          d="M50 10 L20 23 V43 C20 63 50 83 50 83 C50 83 80 63 80 43 V23 L50 10Z" 
          fill="url(#glow-gradient)" 
        />

        {/* AI Pulse Core */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="12" 
          fill="#ffffff" 
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        />
        
        {/* Connection Orbs */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <motion.circle
            key={i}
            cx={50 + 25 * Math.cos((angle * Math.PI) / 180)}
            cy={50 + 25 * Math.sin((angle * Math.PI) / 180)}
            r="4"
            fill="#ffffff"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
          />
        ))}

        {/* Data lines */}
        <motion.path 
          d="M50 50 L75 50 M50 50 L35 75 M50 50 L35 25"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </svg>
    </div>
  )
}
