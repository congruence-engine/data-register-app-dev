/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/data-register-app-dev",
    output: "export",
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            sharp$: false,
            'onnxruntime-node$': false,
        };
        return config;
    },
};

export default nextConfig;