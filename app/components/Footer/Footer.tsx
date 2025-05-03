'use client';

import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          VIILASA
        </Link>
        
        <div className={styles.right}>
          <div className={styles.address}>
            <h1>Talk Now </h1> 
          
          </div>
          
          <div className={styles.links}>
            <Link href="https://www.instagram.com/viilasa" target="_blank" rel="noopener noreferrer">
              Instagram
            </Link>
            <Link href="https://linkedin.com/viilasa" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </Link>
            <Link href="https://x.com/VIILASANFT">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}