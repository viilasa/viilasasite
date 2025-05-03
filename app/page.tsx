"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from 'framer-motion';
import { ArrowDown } from "lucide-react"; // Removed Menu, X as they are in Navbar
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';

// --- Component Imports ---
import Services from "./services/page"; // You might rename this component file later if needed
import Gallery from "./gallery/page";   // This is the component triggering dark mode
import Process from "./process/page";
import TechStack from './components/TechStack/TechStack';

// --- Lazy Load Components ---
const Testimonials = dynamic(() => import("./components/Testimonials/Testimonials"));
// const Portfolio = dynamic(() => import("./components/Portfolio/Portfolio")); // Uncomment if needed
const Contact = dynamic(() => import('./components/Contact/Contact'));
const Footer = dynamic(() => import('./components/Footer/Footer'));
// Ensure Navbar component accepts 'isDark' prop as implemented previously
const Navbar = dynamic(() => import('./components/navbar/Navbar'));
const Threads = dynamic(() => import('@/components/ui/threads'), { ssr: false });
// const ShinyText = dynamic(() => import('../components/ui/shiny')); // Uncomment if needed

// --- Helper Function ---
const getWindowWidth = () => {
    return typeof window !== 'undefined' ? window.innerWidth : 0;
};

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [windowWidth, setWindowWidth] = useState(getWindowWidth());
    const [scrolled, setScrolled] = useState(false);
    const [isInitialTextVisible, setIsInitialTextVisible] = useState(false); // For "We Make..."
    const [isPremiumVisible, setIsPremiumVisible] = useState(false);       // For "Premium" word reveal
    const [isDark, setIsDark] = useState(false); // State for global dark mode

    // Refs for specific sections
    const sectionRef = useRef<HTMLDivElement>(null); // For the "We Make Premium..." scroll effect
    const galleryRef = useRef<HTMLDivElement>(null); // <<< Ref specifically for the Gallery section
    const processRef = useRef<HTMLDivElement>(null); // Ref for the Process section (not used for dark mode toggle here)

    // --- Debounced Scroll Handler ---
    const handleScroll = useCallback(debounce(() => {
        const currentScrollY = window.scrollY;
        setScrolled(currentScrollY > 50); // General scroll state

        // --- "We Make Premium Websites" Scroll Reveal Logic (UNCHANGED) ---
        if (sectionRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const scrollProgress = Math.max(0, -rect.top / (window.innerHeight * 0.5)); // Original calculation
            setIsInitialTextVisible(scrollProgress > 0);   // Original condition
            setIsPremiumVisible(scrollProgress > 0.6); // Original condition
        }
        // --- End of UNCHANGED Logic ---

        // --- Dark Mode Trigger Logic based on Gallery Section ---
        let currentlyDark = false;
        if (galleryRef.current) { // <<< Check using the specific galleryRef
            const rect = galleryRef.current.getBoundingClientRect();
            // Define when the gallery section is considered "active" for dark mode
            // Example: Active when its top is above 75% viewport height
            // AND its bottom is below 25% viewport height (meaning it overlaps the middle 50%)
            const thresholdMargin = window.innerHeight * 0.25; // 25% margin from top/bottom

            const isInViewport = rect.top < window.innerHeight - thresholdMargin && rect.bottom > thresholdMargin;

            if (isInViewport) {
                currentlyDark = true;
            }
            // If not in the viewport according to the condition, currentlyDark remains false
        }
        setIsDark(currentlyDark); // Update the dark mode state
        // --- End of Dark Mode Logic ---

    }, 50), [galleryRef]); // Debounce (50ms), depends only on galleryRef for dark mode calculation

    // --- Resize Handler ---
    const handleResize = useCallback(debounce(() => {
        setWindowWidth(window.innerWidth);
    }, 200), []);

    // --- Effects ---
    useEffect(() => {
        setMounted(true);
        setWindowWidth(window.innerWidth);

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        // Initial check on mount
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
            handleScroll.cancel(); // Cleanup debounced function
            handleResize.cancel(); // Cleanup debounced function
        };
    }, [handleScroll, handleResize]);

    // --- Effect to Toggle Dark Class on HTML Element ---
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]); // Run this effect whenever isDark changes

    // Calculate Threads props based on state
    const threadsAmplitude = windowWidth <= 768 ? 2.5 : 1;
    const threadsDistance = windowWidth <= 768 ? 0.5 : 0.2;
    // Update Threads color based on isDark state
    const threadsColor: [number, number, number] = isDark ? [0.9, 0.9, 0.9] : [0.1, 0.1, 0.1]; // Light on dark, Dark on light

    return (
        <>
            {/* Pass the isDark state to the Navbar */}
            <Navbar isDark={isDark} />

            <main className="relative">
                {/* Render Threads Background */}
                {mounted && (
                    <div className="fixed inset-0 -z-10 pointer-events-none">
                        <Threads
                            // Add isDark to key to potentially help force re-render on theme change if needed
                            key={`${windowWidth}-${isDark}`}
                            color={threadsColor}
                            amplitude={threadsAmplitude}
                            distance={threadsDistance}
                            enableMouseInteraction={false}
                        />
                    </div>
                )}

                {/* Hero Section (UNCHANGED) */}
                <section className="h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-[clamp(3.5rem,15vw,12rem)] sm:text-[clamp(2.5rem,12vw,12rem)] font-bold leading-none tracking-[0.2em] mb-4">
                            <span className="block">VIILASA</span>
                            <span className={`block text-[clamp(1.5rem,5vw,4rem)] sm:text-[clamp(1rem,4vw,4rem)] tracking-[0.5em] true-focus transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'
                                }`}>
                                Digital Studio
                            </span>
                        </h1>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                        <ArrowDown className="w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                </section>

                {/* Scroll Text Reveal Section (UNCHANGED) */}
                <section ref={sectionRef} className="scroll-section relative min-h-[200vh]">
                    <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                        <div className="text-container px-4 sm:px-6 lg:px-8 w-full">
                            <div className="text-center max-w-7xl mx-auto">
                                <h2 className="text-[clamp(3rem,10vw,8rem)] sm:text-[clamp(2rem,8vw,8rem)] font-bold tracking-[0.15em]">
                                    <div className={`text-reveal ${isInitialTextVisible ? 'visible' : ''}`}> {/* Original classes */}
                                        <div className="text-wrapper"> {/* Original wrapper */}
                                            <span className="whitespace-nowrap">We</span>{' '}
                                            <span className="whitespace-nowrap">Make</span>{' '}
                                            <span className={`premium-text whitespace-nowrap ${isPremiumVisible ? 'visible' : ''}`}> {/* Original classes */}
                                                Premium
                                            </span>{' '}
                                            <span className="whitespace-nowrap">Websites</span>
                                        </div>
                                    </div>
                                </h2>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ----- Gallery Section (Triggers Dark Mode) ----- */}
                {/* Attach the specific galleryRef here */}
                <section ref={galleryRef}>
                    <Gallery /> {/* Assumes Gallery is the component to trigger dark mode */}
                </section>
                {/* ------------------------------------------------ */}


                {/* Process Section */}
                <section ref={processRef}> {/* Attach processRef if needed for other effects, NOT dark mode */}
                    <Process />
                </section>

                

                {/* Services Section */}
                <section>
                <TechStack />
                </section>

                {/* Testimonials Section */}
                <section> {/* No ref needed unless for dark mode */}
                    <Testimonials />
                </section>

                {/* Contact Section */}
                <section id="contact" className="min-h-screen flex flex-col justify-center">
                    <Contact />
                </section>

                <Footer />
            </main>
        </>
    );
}