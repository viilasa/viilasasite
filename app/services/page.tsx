'use client';

import { motion } from 'framer-motion';
// Added useEffect (was already present but mentioning for clarity)
import { useState, useRef, useEffect } from 'react';
import { Menu, X, Check, ArrowRight } from 'lucide-react'; // Keep if used elsewhere
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from '../components/Footer/Footer';
import styles from './styles.module.scss'; // Assuming this exists and is correct
import VariableProximity from '../components/text/VariableProximity';
import Testimonials from "../components/Testimonials/Testimonials";
import Navbar from '../components/navbar/Navbar';
import useFetchServices from '@/hooks/useFetchServices';
import useFetchTestimonials from '@/hooks/useFetchTestimonials';

// --- NEW IMPORTS ---
import Hyperspeed, { HyperspeedOptions } from '@/components/ui/hyperspeed/hyperspeed';
import { hyperspeedPresets } from '@/components/ui/hyperspeed/presets'; // Adjust path if necessary
// --- END NEW IMPORTS ---

export default function ServicesPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Keep this if used elsewhere
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);
  const { packages, faqs, loading: packagesLoading, error: packagesError } = useFetchServices();
  const { testimonials, loading: testimonialsLoading, error: testimonialsError } = useFetchTestimonials(); // Keep this if Testimonials component uses it

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Avoid rendering until mounted, helps with hydration mismatches
    return null;
  }

  // --- CHOOSE YOUR PRESET ---
  const selectedPreset: Partial<HyperspeedOptions> = {
    ...hyperspeedPresets.one,
    lightStickWidth: [0.12, 0.5] as [number, number],
    lightStickHeight: [1.3, 1.7] as [number, number],
    movingAwaySpeed: [60, 80] as [number, number],
    movingCloserSpeed: [-120, -160] as [number, number],
    carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
    carLightsRadius: [0.05, 0.14] as [number, number],
    carWidthPercentage: [0.3, 0.5] as [number, number],
    carShiftX: [-0.8, 0.8] as [number, number],
    carFloorSeparation: [0, 5] as [number, number],
    colors: {
      // roadColor: 0,
      // islandColor: 0,
      // background: 0,
      shoulderLines: 0xffffff,
      brokenLines: 0xffffff,
      leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
      rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
      sticks: 0x03b3c3,
     
    }
  };
  // --- ---

  return (
    <>
      {/* --- Hyperspeed Background --- */}
      <div
        style={{
          position: 'fixed', // Fix it to the viewport
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1, // Send it behind the content
          overflow: 'hidden', // Prevent potential scrollbars from the canvas
        }}
      >
        <Hyperspeed effectOptions={selectedPreset} />
      </div>
      {/* --- End Hyperspeed Background --- */}

      {/* --- Content Wrapper --- */}
      <div style={{ position: 'relative', zIndex: 1 }}> {/* Ensure content is above the background */}
        <Navbar isDark={false} />

        <main className={styles.servicesPage}>
          {/* Hero Section */}
          <section className={styles.hero}>
             {/* Consider adding a semi-transparent overlay here if text is hard to read over the background */}
             {/* Example: <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 0}}></div> */}
            <motion.div
              className={styles.content}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ position: 'relative', zIndex: 1 }} // Ensure content is above potential overlay
            >
              <div
                ref={containerRef}
                style={{ position: 'relative' }}
              >
                <VariableProximity
                  label={'We Build Fast. We Deliver Faster.'}
                  className={'variable-proximity-demo'} // Make sure this class exists if needed
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={containerRef}
                  radius={60}
                  falloff='linear'
                  style={{
                    fontSize: '4rem',
                    lineHeight: '1.2',
                    // Ensure text color contrasts well with the background
                    color: '#000000', // Example: black text
                  }}
                />
              </div>
               {/* Ensure text color contrasts well with the background */}
              <p style={{ color: '#000000' }}>Elevate your digital presence with our expertly crafted websites</p>
              <a href="#packages" className={styles.cta}>
                View Packages
                <ArrowRight className={styles.arrow} />
              </a>
            </motion.div>
          </section>

          {/* Packages Section */}
          <section id="packages" className={styles.packages}>
             {/* Add background color to sections if needed to make content readable */}
             {/* Example: style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} */}
            <motion.div
              className={styles.header}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Choose Your Package</h2>
              <p>Tailored solutions for every business need</p>
            </motion.div>

            {/* Grid container for packages, error, or loader */}
            <div className={styles.grid}>
              {packagesLoading ? (
                // --- Loader Integration ---
                // Replaced the loading div with the loader centered
                <div className="flex justify-center items-center py-20 col-span-full"> {/* Use col-span-full if grid applies here */}
                  <div className="loader"></div> {/* Your Loader HTML */}
                </div>
                // --- End Loader Integration ---
              ) : packagesError ? (
                <div className={`${styles.error} col-span-full`}>Error: {packagesError}</div> /* Added col-span-full */
              ) : packages && packages.length > 0 ? (
                packages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id} // Assuming pkg has an id
                    className={`${styles.package} ${index === 1 ? styles.popular : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                     // Add background to individual packages if needed
                     // style={{ backgroundColor: 'white' }}
                  >
                    {index === 1 && (
                      <div className={styles.popularBadge}>Most Popular</div>
                    )}
                    <div className={styles.packageHeader}>
                      <h3>{pkg.title}</h3>
                      <div className={styles.price}>{pkg.price}</div>
                      <p>{pkg.description}</p>
                    </div>
                    <ul className={styles.features}>
                      {Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                        pkg.features.map((feature, i) => (
                          <li key={i} className={styles.featureItem}>
                            <Check className={styles.checkIcon} />
                            <span>{feature}</span>
                          </li>
                        ))
                      ) : (
                        <li className={styles.noFeatures}>No features available</li>
                      )}
                    </ul>
                    <a href="#contact" className={styles.button}>Get Started</a>
                  </motion.div>
                ))
              ) : (
                 <div className={`${styles.error} col-span-full`}>No packages available</div> /* Added col-span-full */
              )}
            </div>
          </section>

          {/* Testimonials Section */}
           {/* Make sure Testimonials component has appropriate background/styling */}
          <Testimonials />

          {/* FAQ Section */}
          <section className={styles.faq}>
             {/* Add background color if needed */}
             {/* Example: style={{ backgroundColor: 'rgba(245, 245, 245, 0.9)' }} */}
            <motion.div
              className={styles.header}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Frequently Asked Questions</h2>
              <p>Find answers to common questions about our services</p>
            </motion.div>

            <div className={styles.faqContainer}>
              <Accordion type="single" collapsible className="w-full">
                {faqs && faqs.length > 0 ? ( // Check if faqs exist
                    faqs.map((faq, index) => (
                    // Assuming faq has id or use index for key. Ensure question/answer exist.
                    <AccordionItem key={faq.id || index} value={`item-${index}`} /* style={{ backgroundColor: 'white', marginBottom: '10px' }} */>
                      <AccordionTrigger className="text-lg font-serif">
                        {faq.question || 'Missing Question'}
                      </AccordionTrigger>
                      <AccordionContent className="text-base font-serif text-gray-700">
                         {/* Ensure faq.answer is a string or renderable node */}
                        {typeof faq.answer === 'string' ? faq.answer : 'Answer format not supported'}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  // Consider showing loader/error for FAQs if useFetchServices also handles them
                  !packagesLoading && <p>No FAQs available.</p>
                )
                }
              </Accordion>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className={styles.contact}>
            {/* Add background color if needed */}
            {/* Example: style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }} */}
            <motion.div
              className={styles.header}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>Start Your Project</h2>
              <p>Get in touch to discuss your requirements</p>
            </motion.div>

            <div className={styles.formContainer}>
               {/* Add background to form if needed */}
               {/* <form className={styles.form} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}> */}
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <input type="text" placeholder="Your Name *" required />
                </div>
                <div className={styles.formGroup}>
                  <input type="email" placeholder="Email Address *" required />
                </div>
                <div className={styles.formGroup}>
                  <select required>
                    <option value="">Select Package *</option>
                     {/* Dynamically populate options from packages if possible */}
                    {packages && packages.map(pkg => (
                         <option key={pkg.id} value={pkg.title}>{pkg.title}</option> // Assuming pkg has id/title
                    ))}
                     {/* Fallback or static options - This might not be needed if packages load reliably */}
                    {/* {!packages && (
                       <>
                         <option value="Essential">Essential</option>
                         <option value="Professional">Professional</option>
                         <option value="Enterprise">Enterprise</option>
                       </>
                    )} */}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <textarea placeholder="Project Details *" rows={5} required></textarea>
                </div>
                <button type="submit" className={styles.submitButton}>
                  Send Message
                  <ArrowRight className={styles.arrow} />
                </button>
              </form>
            </div>
          </section>

        </main>

        <Footer />
      </div>
      {/* --- End Content Wrapper --- */}
    </>
  );
}
