import { useState, useEffect, Key } from 'react';

interface Package {
  id: Key | null | undefined;
  title: string;
  description: string;
  price: string;
  features: string[]; // Converted from textarea string to string[]
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface Service {
  id: string;
  title: string;
  packages: Array<{
    title: string;
    description: string;
    price: string;
    features: string; // textarea string
  }>;
  faqs: FAQ[];
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

const useFetchServices = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://vilasacms.vercel.app/api/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }

        const data: PayloadResponse<Service> = await response.json();

        // Take the first service document
        const firstService = data.docs[0];

        // Transform packages: split features by new lines
        const transformedPackages = firstService?.packages.map((pkg, index) => ({
          id: index,
          title: pkg.title,
          description: pkg.description,
          price: pkg.price,
          features: pkg.features
            ? pkg.features.split('\n').map(f => f.trim()).filter(Boolean)
            : [],
        })) || [];

        // Extract FAQs
        const transformedFaqs = firstService?.faqs || [];

        setPackages(transformedPackages);
        setFaqs(transformedFaqs);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { packages, faqs, loading, error };
};

export default useFetchServices;
