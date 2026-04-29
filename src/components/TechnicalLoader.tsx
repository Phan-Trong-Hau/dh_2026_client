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
          {/* Background Layer with heavy blur */}
          <div className="absolute inset-0">
            <img 
              src="/images/home/home.png" 
              alt="Loading background" 
              className="w-full h-full object-cover blur-[50px] scale-125 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <div className="absolute inset-0 technical-grid opacity-10" />
          </div>

          {/* New Technical Design: 3D Wireframe Scanner */}
          <div className="relative w-80 h-80 flex items-center justify-center perspective-[1000px]">
            
            {/* 1. Large Outer Frame Brackets (Static & Pulsing) */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-full h-full border border-yellow-500/10 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-yellow-500/60 animate-pulse" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-yellow-500/60 animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-yellow-500/60 animate-pulse" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-yellow-500/60 animate-pulse" />
               </div>
            </div>

            {/* 2. 3D Wireframe Cube */}
            <motion.div 
              animate={{ 
                rotateY: 360,
                rotateX: [0, 20, 0, -20, 0],
              }}
              transition={{ 
                rotateY: { duration: 6, repeat: Infinity, ease: "linear" },
                rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative w-32 h-32"
            >
              {/* Cube Faces (Wireframes) */}
              {[0, 90, 180, 270].map((angle, i) => (
                <div
                  key={i}
                  className="absolute inset-0 border border-yellow-500/40 bg-yellow-500/5 shadow-[inset_0_0_15px_rgba(245,197,24,0.1)]"
                  style={{ transform: `rotateY(${angle}deg) translateZ(64px)` }}
                />
              ))}
              <div
                className="absolute inset-0 border border-yellow-500/40 bg-yellow-500/5"
                style={{ transform: `rotateX(90deg) translateZ(64px)` }}
              />
              <div
                className="absolute inset-0 border border-yellow-500/40 bg-yellow-500/5"
                style={{ transform: `rotateX(-90deg) translateZ(64px)` }}
              />
            </motion.div>

            {/* 3. Scanning Laser Line (passing through the cube) */}
            <motion.div
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-full h-[2px] bg-yellow-400 shadow-[0_0_20px_#f5c518] z-30"
            />

            {/* 4. Crosshair Decors */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-1/2 left-4 w-12 h-[1px] bg-yellow-500/50" />
              <div className="absolute top-1/2 right-4 w-12 h-[1px] bg-yellow-500/50" />
              <div className="absolute top-4 left-1/2 w-[1px] h-12 bg-yellow-500/50" />
              <div className="absolute bottom-4 left-1/2 w-[1px] h-12 bg-yellow-500/50" />
            </div>

            {/* 5. Staggered Vertical Scanning Bars */}
            <div className="absolute bottom-12 flex gap-1 h-8 items-end">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ['20%', '100%', '40%'] }}
                  transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                  className="w-[2px] bg-yellow-500/30"
                />
              ))}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
