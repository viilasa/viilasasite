'use client';

import { motion } from 'framer-motion';
import styles from './Testimonials.module.scss';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

const TestimonialCard = ({ quote, author, role, company }: TestimonialCardProps) => {
  return (
    <motion.div 
      className={styles.testimonialCard}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.quoteIcon}>"</div>
      <blockquote className={styles.quote}>{quote}</blockquote>
      <div className={styles.author}>
        <div className={styles.name}>{author}</div>
        <div className={styles.role}>
          {role} at {company}
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;