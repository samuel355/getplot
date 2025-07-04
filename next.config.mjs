/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ydrhcpjwywtfnejjbfua.supabase.co" },
      { protocol: "https", hostname: "izawjgcfbdfvixnqjqjg.supabase.co" },
    ],
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    PAYSTACK_SECRET_KEY: "sk_test_75ab8e0be82be3241fdf4f27f149645941701688",
    mySecret: "secret",
    secondSecret: process.env.SECOND_SECRET, // Pass through env variables
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: "/static",
  },
};

export default nextConfig;
