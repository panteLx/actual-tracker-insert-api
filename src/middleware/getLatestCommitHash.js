import { getLatestCommitHash } from "../utils/helpers.js";

export const getLatestCommitHashMiddleware = async (req, res, next) => {
  try {
    const { fullHash, shortHash } = await getLatestCommitHash();
    res.locals.commitHash = shortHash; // Make the short hash available in all views
    res.locals.fullCommitHash = fullHash; // Keep the full hash for linking
    next();
  } catch (error) {
    console.error("Error getting commit hash:", error);
    res.locals.commitHash = "unknown"; // Fallback if there's an error
    res.locals.fullCommitHash = ""; // Clear full hash on error
    next();
  }
};
