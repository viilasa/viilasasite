'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Portfolio.module.scss';

interface PortfolioCardProps {
  title: string;
  description: string;
  category: string;
  image: string;
  link?: string;
  index: number;
}

export default function PortfolioCard({
  title,
  description,
  category,
  image,
  link = '#',
  index
}: PortfolioCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={styles.card}
    >
      <motion.div 
        className={styles.imageWrapper}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={image}
          alt={title}
          fill
          className={styles.image}
          unoptimized
        />
        <div className={styles.overlay}>
          <span className={styles.category}>{category}</span>
          <Link href={link} target="_blank" rel="noopener noreferrer">
            <motion.button 
              className={styles.viewButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              View Project
            </motion.button>
          </Link>
        </div>
      </motion.div>
      <div className={styles.content}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </motion.div>
  );
}
