import { useState, useEffect } from 'react';

import { Work } from '@/types/work';

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

const BASE_URL = 'https://vilasacms.vercel.app';

const useFetchWorks = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/portfolio`);

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }

        const data: PayloadResponse<any> = await response.json();
        

        const formattedWorks: Work[] = data.docs.map((item) => ({
          mainHeader: item.title,
          mainDescription: { root: { children: [{ children: [{ text: item.description }] }] } },
          image: {
            url: item.image?.url ? `${BASE_URL}${item.image.url}` : '/placeholder.png',
            alt: item.image?.alt || item.title || 'Portfolio image',
          },
          link: item.link,
          category: item.category || "All",
          slug: { url: item.slug?.url }
        }));

        setWorks(formattedWorks);
      } catch (err) {
        console.error('Error fetching works:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  return { works, loading, error };
};

export default useFetchWorks;
