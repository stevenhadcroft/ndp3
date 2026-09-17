import { eMode } from "./modes";
import { TRIAL_DAYS_BY_DIGIT } from "../utils";
import { getTrialDaysLeft } from "../services/localLicenseMananger";

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
// A digit of 0 locks that item. Digit 5 unlocks it with no expiry. Digits
// 1-4 unlock it for a trial window (see TRIAL_DAYS_BY_DIGIT in utils.js) -
// once that trial runs out the item locks again.
export const getUnlockCodeDigits = (code) =>
    String(Math.max(0, code) || 0).padStart(5, "0").split("").map((d) => parseInt(d, 10));

// Per-product unlock state, in the same left-to-right order as the digits.
// `trialDaysLeft` is null for a locked (0) or unlimited (5) digit, and the
// (possibly zero) days remaining for a time-limited digit (1-4).
export const getUnlockStates = (code) =>
    getUnlockCodeDigits(code).map((digit, index) => {
        if (digit === 0) return { digit, unlocked: false, trialDaysLeft: null };
        const trialDaysLeft = getTrialDaysLeft(index, digit);
        return { digit, unlocked: trialDaysLeft === null || trialDaysLeft > 0, trialDaysLeft };
    });
