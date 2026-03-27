import { motion } from 'framer-motion';

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const dotVariants = {
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function LoadingSpinner({ size = 20, className = '' }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      variants={spinnerVariants}
      animate="animate"
    >
      <div className="w-full h-full border-2 border-brand-400 border-t-transparent rounded-full" />
    </motion.div>
  );
}

export function LoadingDots({ className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-brand-400 rounded-full"
          variants={dotVariants}
          animate="animate"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function PulsingCircle({ size = 12, color = 'bg-green-400', className = '' }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <motion.div
        className={`absolute inset-0 ${color} rounded-full opacity-75`}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.75, 0, 0.75],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <div className={`w-full h-full ${color} rounded-full`} />
    </div>
  );
}