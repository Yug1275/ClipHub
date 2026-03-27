import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  hover = true,
  ...props 
}) {
  return (
    <motion.div
      className={`${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}