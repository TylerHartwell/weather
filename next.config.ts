import type { NextConfig } from "next"

const prod = process.env.NODE_ENV === "production"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' https://www.tylerhartwell.com${prod ? "" : " http://localhost:3000"};`
          }
        ]
      }
    ]
  }
}

export default nextConfig
