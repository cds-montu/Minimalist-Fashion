import React from 'react';
import { motion } from 'framer-motion';

const defaultVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const defaultTransition = {
  duration: 0.65,
  ease: [0.25, 0.46, 0.45, 0.94],
};

/**
 * Lightweight scroll-triggered reveal. Keeps design unchanged, adds subtle motion.
 */
export default function ScrollReveal({ children, delay = 0, variants = defaultVariants, transition = defaultTransition, ...props }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-48px 0px -48px 0px', amount: 0.2 }}
      variants={variants}
      transition={{ ...transition, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
