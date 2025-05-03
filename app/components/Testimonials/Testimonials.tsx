'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Testimonials.module.scss';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

interface TestimonialResponse {
  docs: Testimonial[];
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`);
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const data: TestimonialResponse = await response.json();
        console.log('Raw Testimonials Response:', JSON.stringify(data, null, 2));

        if (!data.docs || data.docs.length === 0) {
          console.error('No testimonials found in response');
          return;
        }

        setTestimonials(data.docs);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading testimonials...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <section className={styles.testimonials}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2>Client Success Stories</h2>
        <p>What our clients say about working with us</p>
      </motion.div>

      <div className={styles.testimonialGrid}>
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <TestimonialCard
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;