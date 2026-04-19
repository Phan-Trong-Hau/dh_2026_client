'use client'

import { useEffect } from 'react'

const PARTICLES = 8

export default function ClickEffect() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const x = e.clientX
      const y = e.clientY

      // tia sáng trung tâm
      const spark = document.createElement('span')
      spark.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: radial-gradient(circle, #fff9e6 0%, #f5c518 60%, transparent 100%);
        box-shadow: 0 0 12px 4px rgba(245, 197, 24, 0.7);
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        z-index: 9999;
        animation: spark-flash 0.45s ease-out forwards;
      `
      document.body.appendChild(spark)
      spark.addEventListener('animationend', () => spark.remove())

      // vòng 3D thứ nhất
      const ring1 = document.createElement('span')
      ring1.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 2.5px solid rgba(245, 197, 24, 0.75);
        box-shadow:
          0 0 10px rgba(245, 197, 24, 0.25),
          inset 0 2px 4px rgba(255, 248, 180, 0.9),
          inset 0 -2px 4px rgba(130, 80, 0, 0.55);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9999;
        animation: ring-expand-1 0.7s cubic-bezier(0.2, 0.8, 0.35, 1) forwards;
      `
      document.body.appendChild(ring1)
      ring1.addEventListener('animationend', () => ring1.remove())

      // vòng 3D thứ hai (trễ hơn, to hơn, nhạt hơn)
      const ring2 = document.createElement('span')
      ring2.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        border: 1.5px solid rgba(245, 197, 24, 0.35);
        box-shadow:
          0 0 8px rgba(245, 197, 24, 0.1),
          inset 0 2px 3px rgba(255, 248, 180, 0.5),
          inset 0 -2px 3px rgba(130, 80, 0, 0.3);
        transform: translate(-50%, -50%);
        pointer-events: none;
        z-index: 9998;
        animation: ring-expand-2 0.9s cubic-bezier(0.2, 0.8, 0.35, 1) 120ms forwards;
      `
      document.body.appendChild(ring2)
      ring2.addEventListener('animationend', () => ring2.remove())

      // các hạt kim cương (hình thoi)
      for (let i = 0; i < PARTICLES; i++) {
        const angle = (360 / PARTICLES) * i + Math.random() * 15
        const distance = 35 + Math.random() * 25
        const size = 3 + Math.random() * 2.5
        const duration = 650 + Math.random() * 250
        const dx = Math.cos((angle * Math.PI) / 180) * distance
        const dy = Math.sin((angle * Math.PI) / 180) * distance

        const particle = document.createElement('span')
        particle.style.cssText = `
          position: fixed;
          left: ${x}px;
          top: ${y}px;
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, #fff9e6 0%, #f5c518 50%, #b8860b 100%);
          box-shadow: 0 0 5px rgba(245, 197, 24, 0.5);
          transform: translate(-50%, -50%) rotate(45deg) scale(0);
          pointer-events: none;
          z-index: 9999;
          animation: diamond-fly ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          --dx: ${dx}px;
          --dy: ${dy}px;
        `
        document.body.appendChild(particle)
        particle.addEventListener('animationend', () => particle.remove())
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return null
}
