/* global web3 */

/**
 * Generic round function, see:
 *  - https://stackoverflow.com/a/18358056/1375656
 *  - https://stackoverflow.com/a/19722641/1375656
 *
 * Fixed for NaNs on really small values
 *
 * @param {number} num Number to round
 * @param {number} [places=2] Number of places to round to
 * @returns {number} Rounded number
 */
function round(num, places = 2) {
    const rounded = Number(Math.round(num + "e+" + places) + "e-" + places);
    return Number.isNaN(rounded) ? Number(num.toFixed(places)) : rounded;
}

/**
 * Get the whole and decimal parts from a number.
 * Trims leading and trailing zeroes.
 *
 * @param {any} num the number
 * @returns {Array<string>} array with the [<whole>, <decimal>] parts of the number
 */
function splitDecimalNumber(num) {
    let sign = "";
    if (typeof(num) == "number") {
        // to avoid scientific notion (e-) of Number.toString()
        // > 0.00000001.toString()
        // '1e-8'
        num = num.toFixed(50);
    }
    if (num.startsWith("-")) {
        sign = "-";
        num = num.slice(1);
    }
    const [whole = "", dec = ""] = num.toString().split(".");
    return [
        sign,
        whole.replace(/^0*/, ""), // trim leading zeroes
        dec.replace(/0*$/, ""), // trim trailing zeroes
    ];
}

/**
 * Format a decimal-based number back to a normal number
 *
 * @param {string} num the number
 * @param {number} decimals number of decimal places
 * @param {Object} [options] options object
 * @param {bool} [options.truncate=true] Should the number be truncated to its decimal base
 * @returns {string} formatted number
 */
function fromDecimals(num, decimals, { truncate = true } = {}) {
    const [sign, whole, dec] = splitDecimalNumber(num);
    if (!whole && !dec) {
        return "0";
    }

    const paddedWhole = whole.padStart(decimals + 1, "0");
    const decimalIndex = paddedWhole.length - decimals;
    const wholeWithoutBase = paddedWhole.slice(0, decimalIndex);
    const decWithoutBase = paddedWhole.slice(decimalIndex);

    if (!truncate && dec) {
        // We need to keep all the zeroes in this case
        return `${sign}${wholeWithoutBase}.${decWithoutBase}${dec}`;
    }

    // Trim any trailing zeroes from the new decimals
    const decWithoutBaseTrimmed = decWithoutBase.replace(/0*$/, "");
    if (decWithoutBaseTrimmed) {
        return `${sign}${wholeWithoutBase}.${decWithoutBaseTrimmed}`;
    } else {
        return sign + wholeWithoutBase;
    }
}

/**
 * Format the number to be in a given decimal base
 *
 * @param {string} num the number
 * @param {number} decimals number of decimal places
 * @param {Object} [options] options object
 * @param {bool} [options.truncate=true] Should the number be truncated to its decimal base
 * @returns {string} formatted number
 */
function toDecimals(num, decimals, { truncate = true } = {}) {
    const [sign, whole, dec] = splitDecimalNumber(num);
    if (!whole && !dec) {
        return "0";
    }

    const wholeLengthWithBase = whole.length + decimals;
    const withoutDecimals = (whole + dec).padEnd(wholeLengthWithBase, "0");
    const wholeWithBase = withoutDecimals.slice(0, wholeLengthWithBase);

    if (!truncate && wholeWithBase.length < withoutDecimals.length) {
        return `${sign}${wholeWithBase}.${withoutDecimals.slice(wholeLengthWithBase)}`;
    } else {
        return (sign + wholeWithBase).replace(/^0*/, "");
    }
}

/**
 * Format the wad(18 decimals BN) to a human readable one
 *
 * @param {string} wad The 18 decimals number
 * @param {number} decimals Number of decimal places to represent
 * @returns {string} Human readable wad representation, numbers are rounded
 */
function wad4human(wad, decimals = 5) {
    return Number(fromDecimals(wad.toString(), 18)).toFixed(decimals);
}

/**
 * Convert any number to a wad (18 decimals BN)
 * @param {any} n Number
 * @returns {object} wad, 18 decimals BN
 */
function toWad(n) {
    return web3.utils.toBN(toDecimals(n, 18));
}

function toBN() {
    return web3.utils.toBN.apply(null, arguments);
}

module.exports = {
    round,
    fromDecimals,
    toDecimals,
    wad4human,
    toWad,
    toBN,
};
