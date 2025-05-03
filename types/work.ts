export interface Work {
  mainHeader: string;
  mainDescription?: any;
  category?: string;
  image: {
    url: string;
    alt?: string;
  };
  link?: string;
  slug?: { url?: string };
}
