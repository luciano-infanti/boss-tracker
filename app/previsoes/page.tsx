
import PredictionsPageClient from './PredictionsPageClient';

export const revalidate = 3600;

export default function UpcomingPage() {
    return <PredictionsPageClient />;
}
