import { eMode } from "./modes";

export const PDF_VIEWERS = [
    { mode: eMode.PDF_VIEWER_THERAPY_MANUAL, label: "Therapy Manual" },
    { mode: eMode.PDF_VIEWER_SPEECH_ASSESSMENT, label: "Speech Assessment" },
    { mode: eMode.PDF_VIEWER_THERAPY_WORKSHEETS, label: "Therapy Worksheets" },
    { mode: eMode.PDF_VIEWER_ARTICULOGRAMS, label: "Articulograms" },
];

// The 5-digit unlock code decoded from the licence key (see validateKey in
// utils.js) gates one menu item per digit, left to right:
//   [0] Speech Builder, [1] Therapy Manual, [2] Speech Assessment,
//   [3] Therapy Worksheets, [4] Articulograms
// e.g. 10100 unlocks Speech Builder and Speech Assessment, locks the rest.
// A digit of 0 locks that item; any other digit unlocks it.
export const getUnlockDigits = (code) =>
    String(Math.max(0, code) || 0).padStart(5, "0").split("").map((d) => d !== "0");
