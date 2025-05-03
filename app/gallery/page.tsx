"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Orb5 from "../../components/ui/orb";
// --- Import GridDistortion ---
import GridDistortion from '../../components/ui/GridDistortion'; // Make sure this path is correct

const cards: CardData[] = [
  {
    id: 1,
    title: "Crafting Premium Digital Experiences",
    description: "We design high-quality, intuitive online journeys that elevate your brand and captivate users, reflecting Viilasa – Premium in digital form.",
    image: "https://res.cloudinary.com/ddhhlkyut/video/upload/v1746008774/3129671-uhd_3840_2160_30fps_lrctha.mp4",
    type: "video",
  },
  {
    id: 2,
    title: "AI-Powered Efficiency, Modern Tech Mastery.",
    description: "Harnessing AI with Next.js, React & Vite expertise, we deliver sophisticated solutions faster without compromising on quality.",
    image: "https://res.cloudinary.com/ddhhlkyut/video/upload/v1746008325/2792370-hd_1920_1080_30fps_mxlrd8.mp4",
    type: "video",
  },
  {
    id: 3,
    title: "Driven by Your Success: We Solve Problems, You Thrive. ",
    description: "We're passionate problem-solvers, building digital tools focused purely on making your business succeed and driving measurable growth.",
    // No image needed, will use black background + Orb
    type: "image",
  },
  {
    id: 4,
    title: "Your Partner for Impactful Digital Growth.",
    description: "More than an agency – your dedicated partner (UI/UX, SEO, Apps, Branding) focused on creating lasting value and tangible results. Ready to elevate?",
    // --- Image URL for GridDistortion and Text Masking ---
    image: "https://res.cloudinary.com/ddhhlkyut/image/upload/v1746030879/again_od61qn.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    type: "image",
  }
];

// Define the card type more explicitly: image property is now optional
type CardData = {
  id: number;
  title: string;
  description: string;
  image?: string; // Make image optional
  type: 'video' | 'image';
};


function Card({ card }: { card: CardData; }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100]);

  // --- Define style for text masking effect ---
  // We apply this conditionally using inline styles because Tailwind
  // cannot dynamically set background-image URLs in classes easily.
  const textMaskStyle = card.id === 4 && card.image
    ? {
        backgroundImage: `linear-gradient(rgba(230, 230, 230, 0.7), rgba(230, 230, 230, 0.7)), url(${card.image})`,
        // Add vendor prefix for broader compatibility
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent', // Make the text color transparent
      }
    : {};

  return (
    <motion.div
      ref={cardRef}
      style={{
        opacity,
        scale,
        y
      }}
      className="h-screen w-full flex items-center justify-center sticky top-0"
    >
      <div className="relative w-full h-full">
        {/* Background: Video OR GridDistortion OR Black Background */}
        {card.type === 'video' ? (
          <video
            src={card.image ?? ""} // Use optional chaining safely
            autoPlay
            loop
            muted
            playsInline
            className="object-cover w-full h-full"
          >
            Your browser does not support the video tag.
          </video>
        ) : card.id === 4 ? (
          <GridDistortion
            imageSrc={card.image ?? ""} // Pass the image source
            grid={10}
            mouse={0.1}
            strength={0.15}
            relaxation={0.9}
            className="w-full h-full object-cover" // Ensure it covers the area
          />
        ) : (
          // Default for other 'image' types (e.g., ID 3 gets black background)
          <div className="w-full h-full bg-black"></div>
        )}

        {/* Conditional Orb Rendering (Still only for ID 3) */}
        {card.id === 3 && (
          <div
            style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1,
            }}
          >
            <Orb5
              hoverIntensity={0.5} rotateOnHover={true} hue={0} forceHoverState={false}
            />
          </div>
        )}

        {/* Overlay - Added z-10 and pointer-events-none */}
        {/* Only add overlay if it's NOT card 4 with the text mask, otherwise it covers the effect */}
        {card.id !== 4 && (
             <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />
        )}


        {/* Text Content - Added z-20 and pointer-events-none */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-4 z-20 pointer-events-none">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            // --- Apply conditional classes and styles ---
            className={`text-4xl md:text-6xl font-bold mb-4 text-center tracking-widest ${
              // Add Tailwind classes needed for background clip effect ONLY if card.id is 4
              card.id === 4 && card.image ? 'bg-cover bg-center bg-clip-text' : ''
            }`}
            // Apply the inline style for background-image and transparency if card.id is 4
            style={textMaskStyle}
          >
            {card.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
             // --- Apply conditional classes and styles ---
            className={`text-xl md:text-2xl text-center max-w-2xl ${
              // Add Tailwind classes needed for background clip effect ONLY if card.id is 4
              card.id === 4 && card.image ? 'bg-cover bg-center bg-clip-text' : ''
            }`}
             // Apply the inline style for background-image and transparency if card.id is 4
            style={textMaskStyle}
          >
            {card.description}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-black">
      <div className="h-[400vh]"> {/* 100vh per card */}
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}