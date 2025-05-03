"use client";

import React, { useState, useEffect } from "react"; // Import React and useEffect
import Link from 'next/link';
import { Menu, X } from "lucide-react";
import ShinyText from '../../../components/ui/shiny'; // Assuming path is correct

// Define the props interface
interface NavbarProps {
    isDark: boolean; // Navbar now expects this prop
}

// Accept props and destructure isDark
const Navbar: React.FC<NavbarProps> = ({ isDark }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolledNav, setScrolledNav] = useState(false); // Keep track of scroll state for shadow/bg changes

    // Effect to handle scroll detection for Navbar styling changes (e.g., shadow)
    useEffect(() => {
        const handleScroll = () => {
            // Add shadow or slightly change background opacity after scrolling down a bit
            setScrolledNav(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        // Initial check in case the page loads already scrolled
        handleScroll();

        // Cleanup listener on component unmount
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Empty dependency array means this effect runs once on mount


    // --- Dynamic Style Classes ---
    // Base classes + smooth transitions for color changes
    const navBaseClasses = "fixed w-full z-50 transition-colors duration-500 ease-in-out py-4";

    // Light mode styles (default)
    const lightModeStyles = "bg-white/90 dark:bg-black/80"; // Base bg for light/dark

    // Styles applied when scrolled down
    const scrolledStyles = "shadow-md dark:shadow-gray-800 backdrop-blur-sm"; // Add blur/shadow on scroll

    // Text/Icon color for light/dark modes
    const textColor = "text-black dark:text-white";

    // Link hover styles
    const linkHover = "hover:text-primary dark:hover:text-primary-foreground"; // Adjust primary/primary-foreground if needed

    return (
        // Combine classes dynamically based on isDark and scrolledNav states
        <nav className={`${navBaseClasses} ${lightModeStyles} ${textColor} ${scrolledNav ? scrolledStyles : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo - Assuming ShinyText adapts or you style its container */}
                    <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tighter">
                        {/* ShinyText might need internal adjustments or props to respect dark mode */}
                        {/* Its parent's text color won't directly affect its canvas/SVG rendering */}
                        <ShinyText text="VIILASA" disabled={false} speed={3} className='custom-class' />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className={`hidden md:flex space-x-8 items-center ${textColor}`}>
                        {/* Apply hover styles */}
                        <Link href="/services" className={`${linkHover}`}>Services</Link>
                        <Link href="/work" className={`${linkHover}`}>Work</Link>
                        {/* <Link href="/blog" className={`${linkHover}`}>Blog</Link> */}
                        <Link href="/#contact" className={`${linkHover}`}>Contact</Link>
                    </div>

                    {/* Mobile Menu Button - Color should adapt via parent's text color */}
                    <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen
                            ? <X className="h-6 w-6" /> // Icon color inherits from textColor
                            : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    // Apply background and text color matching the nav's current mode
                    // Use absolute positioning and ensure background covers content below
                    <div className={`md:hidden flex flex-col space-y-4 mt-4 pb-4 px-2 absolute top-full left-0 right-0 ${lightModeStyles} ${textColor} ${scrolledStyles} shadow-lg`}>
                        <Link href="/services" onClick={() => setIsMobileMenuOpen(false)} className={`${linkHover} block px-2 py-1`}>Services</Link>
                        <Link href="/work" onClick={() => setIsMobileMenuOpen(false)} className={`${linkHover} block px-2 py-1`}>Work</Link>
                        <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className={`${linkHover} block px-2 py-1`}>Blog</Link>
                        <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)} className={`${linkHover} block px-2 py-1`}>Contact</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;