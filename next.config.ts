import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' https://www.tylerhartwell.com http://localhost:3000;`
          }
        ]
      }
    ]
  }
}

export default nextConfig
