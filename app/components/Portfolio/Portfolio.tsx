'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react'; // useEffect is imported but not used in the final code, kept as it was in original
import useFetchWorks from '@/hooks/useFetchWorks';
import PortfolioCard from './PortfolioCard';
import styles from './Portfolio.module.scss';

import { Work } from '@/types/work';

const categories: string[] = ["All", "E-commerce", "Portfolio", "Web App", "Travel", "Art", "Finance"];

export default function Portfolio() {
  const { works, loading, error } = useFetchWorks();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [filteredProjects, setFilteredProjects] = useState<Work[]>([]);

  function extractTextFromLexical(richText: any): string {
    if (!richText || !richText.root || !richText.root.children) {
      return "";
    }
    return richText.root.children
      .map((paragraph: any) => paragraph.children ? paragraph.children.map((textNode: any) => textNode.text || "").join(" ") : "")
      .filter(Boolean)
      .join(" ");
  }

  useEffect(() => {
    if (Array.isArray(works)) {
      setFilteredProjects(
        selectedCategory === "All"
          ? works
          : works.filter((project: Work) => project.category === selectedCategory)
      );
    }
  }, [works, selectedCategory]);

  return (
    <section className={styles.portfolio}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={styles.header}
      >
        <h2>Explore Our Portfolio</h2>
        <p>Transforming complex themes into entertaining and emotional experiences</p>
      </motion.div>

      {/* Category buttons remain commented out as in the original */}
      {/* <div className={styles.categories}> ... </div> */}

      {/* --- Conditional Rendering --- */}
      {loading ? (
        // --- Loader Integration ---
        // Replaced the <p> tag with the loader div
        <div className="flex justify-center items-center py-20"> {/* Centering container */}
           <div className="loader"></div> {/* Your Loader HTML */}
        </div>
        // --- End Loader Integration ---
      ) : error ? (
        <p className={styles.error}>Error: {error}</p>
      ) : filteredProjects.length === 0 ? (
        <p className={styles.noProjects}>No projects available in this category.</p>
      ) : (
        <motion.div className={styles.grid} layout>
          {filteredProjects.map((project: Work, index: number) => (
            <PortfolioCard
              // Using index as key fallback if link is undefined - ensure link is a stable unique identifier if possible
              key={project.link || project.slug?.url || index}
              title={project.mainHeader || "Untitled"}
              description={extractTextFromLexical(project.mainDescription)}
              category={project.category || "Uncategorized"}
              image={project.image?.url || "/placeholder.png"} // Make sure you have a placeholder image at this path
              link={project.link || "#"}
              index={index}
            />
          ))}
        </motion.div>
      )}
      {/* --- End Conditional Rendering --- */}
    </section>
  );
}