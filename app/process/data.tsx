export interface Process {
  title: string;
  description: string;
  src: string;
  color: string;
}

export const processes: Process[] = [
  {
    title: "Share Your Vision",
    description: "Tell us what you need—whether it's a personal brand site, a portfolio, or a business website. We'll discuss your goals and suggest the best approach.",
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop",
    color: "#c1c1c1"
  },
  {
    title: "We Design & Build",
    description: "Our team crafts a high-converting, visually stunning website tailored to your brand. You'll get a preview and can request refinements.",
    src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop",
    color: "#BBACAF"
  },
  {
    title: "Launch & Grow",
    description: "Once you're happy, we go live! Your site will be fully optimized, responsive, and ready to scale. Need ongoing support? We've got you covered.",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
    color: "#666666"
  }
];