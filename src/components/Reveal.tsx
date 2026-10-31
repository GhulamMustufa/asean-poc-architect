'use client';

import { motion, type HTMLMotionProps } from 'motion/react';

/** Fades content up once when it scrolls into view (static under reduced motion via MotionConfig). */
export function Reveal({ delay = 0, children, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Same as Reveal, rendered as a list item. */
export function RevealItem({ delay = 0, children, ...props }: HTMLMotionProps<'li'> & { delay?: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay }}
      {...props}
    >
      {children}
    </motion.li>
  );
}
