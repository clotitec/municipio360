import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://fdmiztsyhbucdttxgoyf.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkbWl6dHN5aGJ1Y2R0dHhnb3lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMDg2OTgsImV4cCI6MjA5MDc4NDY5OH0.9HzRxslh3g0lzR9mw68X-UqREoZmCkzjuVVG0K6yXWI",
    NEXT_PUBLIC_MAPTILER_KEY: "EjH8WEi3yiBuYaRgvoQQ",
    NEXT_PUBLIC_DEFAULT_MUNICIPIO: "llanes",
    NEXT_PUBLIC_APP_URL: "https://municipio360.vercel.app",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fdmiztsyhbucdttxgoyf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
