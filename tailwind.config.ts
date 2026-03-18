import type { Config } from 'tailwindcss'

// Tailwind v4: all theme tokens live in globals.css @theme block.
// This file is kept only for content path hints (v4 auto-detects anyway).
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
}

export default config
