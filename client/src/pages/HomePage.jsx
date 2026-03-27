import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Globe, Lock, Clock, Copy, Upload, QrCode, Eye, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedCard from '../components/AnimatedCard'

const FEATURES = [
  { icon: Zap,    title: 'Instant sharing',    desc: 'Paste text and share in seconds. No signup, no friction.' },
  { icon: Globe,  title: 'Local & global',      desc: 'Works on your WiFi hotspot or across the internet.' },
  { icon: Lock,   title: 'Secure files',        desc: 'File uploads protected with JWT authentication.' },
  { icon: Clock,  title: 'Auto-expiry',         desc: 'Set TTL from 1 min to 1 day. Data auto-deletes.' },
  { icon: Copy,   title: 'Key-based access',    desc: 'Use any custom key. Share the key, share the content.' },
  { icon: Upload, title: 'Drag & drop files',   desc: 'Upload images, PDFs, docs — retrieve anywhere.' },
  { icon: QrCode, title: 'QR code sharing',     desc: 'Generate QR codes for instant mobile access.' },
  { icon: Eye,    title: 'View limits',         desc: 'Set maximum views before clips auto-delete.' },
  { icon: Shield, title: 'Password protection', desc: 'Protect sensitive content with passwords.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export default function HomePage() {
  const [key, setKey] = useState('')
  const navigate = useNavigate()

  const handleGo = (e) => {
    e.preventDefault()
    if (key.trim()) navigate('/clip?key=' + encodeURIComponent(key.trim()))
  }

  return (
    <main className="relative min-h-screen pt-24 pb-20 px-4 overflow-hidden">

      {/* Enhanced Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[350px] h-[350px] bg-blue-800/10 rounded-full blur-3xl" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-float" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-blue-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Status Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-xs text-blue-400 border border-blue-500/20"
        >
          <motion.span 
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          Universal clipboard & file transfer with advanced security
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="font-bold text-5xl md:text-7xl text-white leading-tight tracking-tight mb-6"
        >
          Share anything,
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              backgroundImage: 'linear-gradient(135deg, #5b9bff 0%, #93c5fd 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            anywhere
          </motion.span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          ClipHub is a universal clipboard bridge. Share text instantly, upload files securely, 
          and control access with passwords, view limits, and QR codes.
        </motion.p>

        {/* Key Input Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleGo}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-16"
        >
          <motion.input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter a key (e.g. my-notes)"
            className="input-base flex-1 text-base"
            autoFocus
            whileFocus={{ scale: 1.01 }}
          />
          <motion.button
            type="submit"
            className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!key.trim()}
          >
            Open Clip <ArrowRight size={16} />
          </motion.button>
        </motion.form>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-16"
        >
          {FEATURES.map(({ icon: Icon, title, desc }, index) => (
            <AnimatedCard
              key={title}
              delay={0.1 * index}
              className="card glass-hover group cursor-pointer"
            >
              <motion.div 
                className="w-9 h-9 rounded-lg bg-blue-500/15 flex items-center justify-center mb-3 group-hover:bg-blue-500/25 transition-colors duration-200"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Icon size={17} className="text-blue-400" />
              </motion.div>
              <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </AnimatedCard>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          className="flex flex-wrap justify-center gap-10"
        >
          {[
            ['Zero friction', 'No login for text'],
            ['Key-based', 'Custom access keys'],
            ['Auto-delete', 'TTL on all data'],
            ['Real-time', 'Live collaboration']
          ].map(([label, sub], index) => (
            <motion.div
              key={label}
              variants={itemVariants}
              className="text-center group"
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="font-bold text-2xl text-white group-hover:text-blue-400 transition-colors duration-300"
                animate={{ 
                  textShadow: ["0 0 0px rgba(91,155,255,0)", "0 0 20px rgba(91,155,255,0.3)", "0 0 0px rgba(91,155,255,0)"]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                {label}
              </motion.div>
              <div className="text-gray-500 text-sm mt-0.5 group-hover:text-gray-400 transition-colors duration-300">
                {sub}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-16 pt-16 border-t border-white/5"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to start sharing?
          </h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Join thousands of users who trust ClipHub for seamless content sharing across devices.
          </p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => navigate('/clip')}
              className="btn-primary text-base px-8 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
            <motion.a
              href="/docs"
              className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-4"
              whileHover={{ x: 5 }}
            >
              Learn more →
            </motion.a>
          </motion.div>
        </motion.div>

      </motion.div>
    </main>
  )
}