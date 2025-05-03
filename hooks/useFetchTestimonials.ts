import { useState, useEffect } from 'react';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

interface PayloadResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

const useFetchTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('https://vilasacms.vercel.app/api/testimonials');
        if (!response.ok) {
          throw new Error('Failed to fetch testimonials');
        }
        const data: PayloadResponse<Testimonial> = await response.json();

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

  return { testimonials, loading, error };
};

export default useFetchTestimonials; 