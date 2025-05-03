'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Portfolio from '@/app/components/Portfolio/Portfolio';
import Footer from '@/app/components/Footer/Footer';
import Navbar from '@/app/components/navbar/Navbar';
import styles from './work.module.scss';

export default function WorkPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navigation */}
      <Navbar isDark={false} />

      <main className={styles.workPage}>
        {/* Header */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Our Work</h1>
          <p>Explore our curated collection of premium digital experiences</p>
        </motion.header>

        {/* Portfolio Grid */}
        <section className={styles.portfolioSection}>
          <Portfolio />
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}