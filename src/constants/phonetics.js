// 6-row x 8-column IPA chart. null = blank cell; column 4 is a vowel/consonant
// separator (blank in rows 1-5, schwa in row 6). Layout is meaningful, not decorative.
// NOTE: row 3 col 3 and row 4 col 3 both contain "ʊ" - this looks like a typo
// in the original data; one was probably intended to be a different vowel.
export const PHONETICS_GRID = [
    [{ symbol: "ɨ" },  { symbol: "ɐɪ" }, { symbol: "æ" }, null,             { symbol: "p" }, { symbol: "m" }, { symbol: "j" }, { symbol: "s" }],
    [{ symbol: "ɑ" },  { symbol: "ɔɪ" }, { symbol: "ɪ" }, null,             { symbol: "b" }, { symbol: "n" }, { symbol: "h" }, { symbol: "z" }],
    [{ symbol: "u" },  { symbol: "ɑʊ" }, { symbol: "ʊ" }, null,             { symbol: "t" }, { symbol: "ɳ" }, { symbol: "f" }, { symbol: "ʃ" }],
    [{ symbol: "ɔ" },  { symbol: "əʊ" }, null,            null,             { symbol: "d" }, { symbol: "w" }, { symbol: "v" }, { symbol: "ʒ" }],
    [{ symbol: "ɜ" },  { symbol: "ɛə" }, { symbol: "ɛ" }, null,             { symbol: "c/k" }, { symbol: "ǀ" }, { symbol: "θ" }, { symbol: "tʃ" }],
    [{ symbol: "ɑɪ" }, { symbol: "ɪə" }, { symbol: "ʌ" }, { symbol: "ə" },  { symbol: "g" }, { symbol: "r" }, { symbol: "ð" }, { symbol: "dʒ" }],
];
