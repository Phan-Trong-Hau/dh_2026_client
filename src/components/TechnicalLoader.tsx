'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  isVisible: boolean
}

export default function TechnicalLoader({ isVisible }: Props) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black"
        >
          {/* Background Image - Using the project's home background with blur */}
          <div className="absolute inset-0">
            <img 
              src="/images/home/home.png" 
              alt="Loading background" 
              className="w-full h-full object-cover blur-[40px] scale-110 opacity-70"
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 technical-grid opacity-20" />
          </div>

          {/* Kinetic Core Spinner */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer Ring - CW */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-yellow-500/30 rounded-full"
            />

            {/* Dashed Ring - CCW */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 border-[1.5px] border-dashed border-yellow-500/50 rounded-full"
            />

            {/* Fast Inner Ring - CW */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-5 border border-yellow-500/70 rounded-full border-t-transparent border-b-transparent shadow-[0_0_15px_rgba(245,197,24,0.3)]"
            />

            {/* Central Pulsing Diamond */}
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [45, 225, 405]
              }}
              transition={{ 
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "linear" }
              }}
              className="w-10 h-10 bg-yellow-500 rounded-sm shadow-[0_0_25px_#f5c518] z-10"
            />

            {/* Orbiting particles */}
            {[0, 120, 240].map((angle, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, delay: i * 0.4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_10px_#f5c518]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
