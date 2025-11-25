export const getWorldIcon = (worldName: string) => {
    if (['Auroria', 'Belaria'].includes(worldName)) {
        return 'https://wiki.rubinot.com/icons/open-pvp.gif';
    }
    if (['Bellum', 'Tenebrium', 'Spectrum'].includes(worldName)) {
        return 'https://wiki.rubinot.com/icons/retro-open-pvp.gif';
    }
    return 'https://wiki.rubinot.com/icons/optional-pvp.gif';
};
