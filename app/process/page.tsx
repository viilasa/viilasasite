'use client';

import { useRef } from "react";
import styles from './page.module.scss';
import { processes } from './data';
import ProcessCard from './components/ProcessCard';
import { Process } from './data';

export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <main ref={sectionRef} className={styles.main}>
      {processes.map((process: Process, i: number) => (
        <ProcessCard key={`p_${i}`} {...process} i={i} />
      ))}
    </main>
  );
}