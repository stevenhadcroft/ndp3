import * as storage from "./storage";
import * as api from "./api";
import * as categories from "./categories";

export * from "./modes";
export * from "./text";
export * from "./storage";
export * from "./api";
export * from "./categories";
export * from "./phonetics";
export * from "./unlocks";

// Aggregate object kept for back-compat with existing `Constants.X` callers.
// Prefer importing named exports from sub-modules in new code.
export const Constants = {
    ...storage,
    ...api,
    ...categories,
};
