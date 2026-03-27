import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(true) // Default to dark since our design is dark

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored) {
      setIsDark(stored === 'dark')
    }
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  return (
    <motion.button
      onClick={() => setIsDark(!isDark)}
      className="relative w-12 h-6 glass rounded-full p-0.5 glass-hover"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"
        animate={{
          x: isDark ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
      >
        <motion.div
          animate={{
            rotate: isDark ? 180 : 0,
          }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon size={12} className="text-gray-700" />
          ) : (
            <Sun size={12} className="text-yellow-600" />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  )
}