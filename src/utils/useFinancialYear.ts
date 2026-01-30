export const useFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const startYear = (month >= 3) ? year : (year - 1);
    const endYear = startYear + 1;

    const shortStartYear = String(startYear).slice(-2)
    const shortEndYear = String(endYear).slice(-2)

    return `${shortStartYear}-${shortEndYear}`
}