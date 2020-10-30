const {
    round,
    fromDecimals,
    toDecimals,
    wad4human,
    toWad,
    toBN
} = require("../src");

describe("math-utils", () => {
    it("round", () => {
        // default 2 decimals
        assert.equal(round(2.322222), 2.32);
        assert.equal(round(0.00000000008), 0);
        assert.equal(round("2.322222"), 2.32);
        assert.equal(round("2.322"), 2.32);
        assert.equal(round("2.322", 3), 2.322);
        assert.equal(round("2.325555"), 2.33);
        assert.equal(round("2.325555"), 2.33);
        assert.equal(round("2.325555", 3), 2.326);
        assert.equal(round("-2.322222"), -2.32);
        assert.equal(round("-2.325555"), -2.33);
    })

    it("fromDecimals", () => {
        assert.equal(fromDecimals("1234567", 3), "1234.567");
        assert.equal(fromDecimals("1234560", 3), "1234.56");
        assert.equal(fromDecimals("1234560.2", 3), "1234.56");
        assert.equal(fromDecimals("1234560", 3), "1234.56");
        assert.equal(fromDecimals("1234560.2", 3, { truncate: false } ), "1234.5602");
        assert.equal(fromDecimals("-1234567", 3), "-1234.567");
        assert.equal(fromDecimals("-1234560", 3), "-1234.56");
        assert.equal(fromDecimals("-1234560.2", 3), "-1234.56");
        assert.equal(fromDecimals("-1234560.2", 3, { truncate: false } ), "-1234.5602");
        assert.equal(fromDecimals("2", 3, { truncate: false } ), "0.002");
        assert.equal(fromDecimals("-2", 3, { truncate: false } ), "-0.002");
        assert.equal(fromDecimals(".2", 3, { truncate: false } ), "0.0002");
        assert.equal(fromDecimals("-.2", 3, { truncate: false } ), "-0.0002");
        assert.equal(fromDecimals("0.2", 3, { truncate: false } ), "0.0002");
        assert.equal(fromDecimals("-0.2", 3, { truncate: false } ), "-0.0002");
        assert.equal(fromDecimals("0.2", 3), "0");
        assert.equal(fromDecimals("-0.2", 3), "-0");
    })

    it("toDecimals", () => {
        // not a good idea to use number type, but it's supported
        assert.equal(toDecimals(0.0000008, 18), "799999999999");
        assert.equal(toDecimals(1234.567, 3), "1234567");
        assert.equal(toDecimals(-1234.567, 3), "-1234567");
        assert.equal(toDecimals("0.0000008", 18), "800000000000");
        assert.equal(toDecimals(".34", 3), "340");
        assert.equal(toDecimals("1234.567", 3), "1234567");
        assert.equal(toDecimals("1234.56", 3), "1234560");
        assert.equal(toDecimals("1234.5602", 3), "1234560");
        assert.equal(toDecimals("1234.5602", 3, { truncate: false }), "1234560.2");
        assert.equal(toDecimals("-1234.567", 3), "-1234567");
        assert.equal(toDecimals("-1234.56", 3), "-1234560");
        assert.equal(toDecimals("-1234.5602", 3), "-1234560");
        assert.equal(toDecimals("-1234.5602", 3, { truncate: false }), "-1234560.2");
    })

    it("wad4human", () => {
        assert.equal(wad4human("1234567901234567890123456789"), "1234567901.23457");
        assert.equal(wad4human("1234567901234567890123456789", 2), "1234567901.23");
        assert.equal(wad4human("1234567901234567890123456789", 3), "1234567901.235");
        assert.equal(wad4human("1234567901000000000000000000", 3), "1234567901.000");
        assert.equal(wad4human("1234567901999999999999999999", 3), "1234567902.000");
        assert.equal(wad4human("-1234567901234567890123456789"), "-1234567901.23457");
        assert.equal(wad4human("-1234567901234567890123456789", 3), "-1234567901.235");
        assert.equal(wad4human("-1234567901230000000000000000", 3), "-1234567901.230");
        // unsupported case
        // assert.equal(wad4human("12345679012345678901234567891234567901234567890123456789", 3), "12345679012345678901234567891234567901.235");
    })

    it("toWad", () => {
        assert.equal(toWad("1234567901.23457").toString(), "1234567901234570000000000000");
        assert.equal(toWad("-1234567901.23457").toString(), "-1234567901234570000000000000");
    })

    it("toBN", () => {
        assert.equal(toBN(2).toString(), "2");
    })

})
