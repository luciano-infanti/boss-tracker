/**
 * Formats a number with dots as thousands separator (Brazilian Portuguese format).
 * Example: 4090 → "4.090"
 */
export function formatNumber(value: number | undefined | null): string {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('pt-BR');
}
