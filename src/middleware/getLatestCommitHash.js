import { getLatestCommitHash } from "../utils/helpers.js";

export const getLatestCommitHashMiddleware = async (req, res, next) => {
  try {
    const { fullHash, shortHash } = await getLatestCommitHash();
    res.locals.commitHash = shortHash === "unknow" ? "dev" : shortHash; // Use 'dev' when no hash available
    res.locals.fullCommitHash = fullHash === "unknown" ? "" : fullHash; // Empty string when no hash available
    next();
  } catch (error) {
    console.error("Error getting commit hash:", error);
    res.locals.commitHash = "unknown"; // Fallback if there's an error
    res.locals.fullCommitHash = ""; // Clear full hash on error
    next();
  }
};
