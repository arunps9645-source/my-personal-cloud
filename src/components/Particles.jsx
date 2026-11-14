import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// Deterministic pseudo-random so particles don't jump between renders.
const rand = (i, n) => {
  const x = Math.sin(i * 97.13 + n * 13.7) * 10000
  return x - Math.floor(x)
}

export default function Particles({ count = 34 }) {
  const reduce = useReducedMotion()
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: rand(i, 1) * 100,
        y: rand(i, 2) * 100,
        size: 2 + rand(i, 3) * 4,
        dur: 9 + rand(i, 4) * 10,
        delay: rand(i, 5) * 6,
        hue: [215, 265, 190][i % 3],
      })),
    [count],
  )
  if (reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {items.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `hsl(${p.hue} 90% 72%)`,
            boxShadow: `0 0 ${p.size * 4}px hsl(${p.hue} 90% 60% / .8)`,
          }}
          animate={{ y: [0, -60, 0], x: [0, 14, -10, 0], opacity: [0.15, 0.85, 0.15] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
