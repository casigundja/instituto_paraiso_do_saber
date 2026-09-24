import type { NextConfig } from 'next';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
const workspaceRoot=resolve(process.cwd(),'../..');
const nextConfig:NextConfig={outputFileTracingRoot:existsSync(resolve(workspaceRoot,'apps','api'))?workspaceRoot:process.cwd()};
export default nextConfig;
