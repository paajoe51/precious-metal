// Gold calculation formulas from the Excel sheet
class GoldCalculator {
    static calculatePounds(top) {
        return Math.floor(top / 7.75 * 100) / 100;
    }

    static calculateKarat(top, down) {
        return Math.floor(top / down * 100) / 100;
    }

    static calculateMoro(karat) {
        if (karat < 10.51) return 0;
        return Math.floor((karat - 10.51) * (52.838) / karat * 100) / 100;
    }

    static calculateValue(base, pounds, karat) {
        return Math.floor((base * pounds * karat) / 23);
    }

    static determineStatus(karat) {
        return karat < 10.51 ? "No Gold" : "Gold";
    }

    // TBR specific calculations
    static calculateTotalBuy(base, pounds, karat) {
        return Math.ceil((base * 23) / (karat * pounds) * 1000) / 1000;
    }
}