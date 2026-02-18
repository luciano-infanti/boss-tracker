
import WorldPageClient from './WorldPageClient';

export const revalidate = 3600;

export async function generateStaticParams() {
  return [];
}

export default function WorldPage() {
  return <WorldPageClient />;
}
