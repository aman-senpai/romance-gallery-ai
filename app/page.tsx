import Wizard from '@/components/Wizard';
import AestheticOverlay from '@/components/AestheticOverlay';
import { getStyleCategories } from '@/lib/style-loader';

export default async function Home() {
  const categories = await getStyleCategories();
  // Force rebuild for style-loader

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative font-sans dark:bg-black transition-colors duration-500">
      <Wizard categories={categories} />
    </main>
  );
}
