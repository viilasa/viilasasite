'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './TechStack.module.scss';

const techCategories = [
  {
    title: 'Primary Stack',
    tools: [
      {
        name: 'Next.js',
        description: 'Server-side rendering & routing',
        icon: 'https://cdn.worldvectorlogo.com/logos/next-js.svg'
      },
      {
        name: 'React',
        description: 'Building user interfaces',
        icon: 'https://cdn.worldvectorlogo.com/logos/react-2.svg'
      },
      {
        name: 'Payload CMS',
        description: 'Headless content management',
        icon: 'https://images.seeklogo.com/logo-png/44/1/payload-logo-png_seeklogo-444238.png'
      },
      {
        name: 'Vite',
        description: 'Fast development & bundling',
        icon: 'https://cdn.worldvectorlogo.com/logos/vitejs.svg'
      },
      {
        name: 'Supabase',
        description: 'Backend & database management',
        icon: 'https://images.seeklogo.com/logo-png/43/1/supabase-logo-png_seeklogo-435677.png'
      }
    ]
  },
  {
    title: 'Development Tools',
    tools: [
      {
        name: 'Node.js',
        description: 'Server-side JavaScript runtime',
        icon: 'https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg'
      },
      {
        name: 'Express',
        description: 'Web application framework',
        icon: 'https://img.icons8.com/color/512/express-js.png'
      },
      {
        name: 'TypeScript',
        description: 'Type-safe JavaScript',
        icon: 'https://cdn.worldvectorlogo.com/logos/typescript.svg'
      }
    ]
  },
  {
    title: 'UI Components',
    tools: [
      {
        name: 'Bolt.new',
        description: 'Rapid UI development',
        icon: 'https://pbs.twimg.com/profile_images/1880702021122342912/fe9TlQqJ_400x400.jpg'
      },
      {
        name: 'Windsurf',
        description: 'Styling and layout system',
        icon: 'https://cdn.worldvectorlogo.com/logos/tailwind-css-2.svg'
      },
      {
        name: 'ReactBits',
        description: 'Reusable component library',
        icon: 'https://cdn.worldvectorlogo.com/logos/material-ui-1.svg'
      }
    ]
  }
];

export default function TechStack() {
  return (
    <section className={styles.techStack}>
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2>Our Tech Stack</h2>
        <p>Leveraging cutting-edge technologies to deliver exceptional digital experiences</p>
      </motion.div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              className={styles.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3>{category.title}</h3>
              <div className={styles.tools}>
                {category.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.name}
                    className={styles.tool}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: toolIndex * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={styles.iconWrapper}>
                      <Image
                        src={tool.icon}
                        alt={tool.name}
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>
                    <div className={styles.content}>
                      <h4>{tool.name}</h4>
                      <p>{tool.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}