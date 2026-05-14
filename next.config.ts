import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** כשיש lockfile גם בתיקיית הורה, Turbopack עלול לבחור שורש שגוי — תיקון ל־dev מקומי. */
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
