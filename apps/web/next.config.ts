import "@voltaze/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	transpilePackages: ["@mantine/core", "@mantine/hooks"],
};

export default nextConfig;
