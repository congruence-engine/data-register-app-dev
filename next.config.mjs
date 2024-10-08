/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/data-register-app-dev/docs",
  output: "export",
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      'onnxruntime-node$': false,
    };

    return config;
  },};

export default nextConfig;
