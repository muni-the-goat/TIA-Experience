import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Multiple package-lock.json files exist above this project (in the home
    // dir and the Web3 parent), which made Next infer the wrong workspace root.
    // Pin the file-tracing root to this project to silence that warning.
    outputFileTracingRoot: __dirname,
  },
};

export default nextConfig;
