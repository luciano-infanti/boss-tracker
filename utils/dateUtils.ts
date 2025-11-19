export function isKilledToday(lastKillDate: string | undefined): boolean {
    if (!lastKillDate || lastKillDate === 'Never' || lastKillDate === 'N/A') return false;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const parts = lastKillDate.split('/');
        if (parts.length !== 3) return false;

        const [day, month, year] = parts.map(Number);
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;

        const killDate = new Date(year, month - 1, day);
        killDate.setHours(0, 0, 0, 0);

        return killDate.getTime() === today.getTime();
    } catch {
        return false;
    }
}
