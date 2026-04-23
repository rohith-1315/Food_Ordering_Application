import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CuisineFilterBar from '../components/CuisineFilterBar';
import HeroSection from '../components/HeroSection';
import HowItWorks from '../components/HowItWorks';
import OfferBanner from '../components/OfferBanner';
import RestaurantGrid from '../components/RestaurantGrid';

/**
 * Homepage composition for discovery, filtering, offers, and restaurant browsing.
 */
export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  const query = searchParams.get('query') || '';

  const handleFilterChange = (cuisine) => {
    setSelectedCuisines((prev) => {
      if (cuisine === '') {
        return [];
      }

      if (prev.includes(cuisine)) {
        return prev.filter((entry) => entry !== cuisine);
      }

      return [...prev, cuisine];
    });
  };

  return (
    <div className="min-h-screen bg-white transition-colors dark:bg-black">
      <HeroSection />
      <OfferBanner />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <CuisineFilterBar selected={selectedCuisines} onFilterChange={handleFilterChange} />

        <RestaurantGrid
          query={query}
          cuisines={selectedCuisines}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </main>

      <HowItWorks />
    </div>
  );
}
