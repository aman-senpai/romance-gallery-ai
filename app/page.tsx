import Wizard from '@/components/Wizard';
import AestheticOverlay from '@/components/AestheticOverlay';
import { getStyleCategories } from '@/lib/csv-parser';

export default async function Home() {
  const categories = await getStyleCategories();

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative font-sans">
      <AestheticOverlay />

      <Wizard categories={categories} />
    </main>
  );
}
