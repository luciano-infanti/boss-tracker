import BossPageClient from './BossPageClient';

export default async function BossPage({ params }: { params: Promise<{ bossName: string }> }) {
    const { bossName } = await params;
    const decodedName = decodeURIComponent(bossName);

    return <BossPageClient bossName={decodedName} />;
}
