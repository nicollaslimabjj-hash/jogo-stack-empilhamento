import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    glsl(), // Add GLSL shader support for advanced graphics
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@types": path.resolve(__dirname, "src/types"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Optimize for games
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js and game libraries for better caching
          'three': ['three'],
          'react-three': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
          'game-engines': ['pixi.js', 'matter-js', 'ogl'],
          'animations': ['gsap', 'framer-motion'],
          'audio': ['howler'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
  // Support for large game assets
  assetsInclude: [
    "**/*.gltf", 
    "**/*.glb", 
    "**/*.fbx",
    "**/*.obj",
    "**/*.mtl",
    "**/*.mp3", 
    "**/*.ogg", 
    "**/*.wav",
    "**/*.m4a",
    "**/*.hdr",
    "**/*.exr",
    "**/*.glsl",
    "**/*.vert",
    "**/*.frag"
  ],
  server: {
    port: 3000,
    host: true, // Allow external connections for mobile testing
    allowedHosts: [
      '.e2b.app', // Allow all E2B subdomains
      'localhost',
      '127.0.0.1',
    ],
  },
  // Optimize for game development
  optimizeDeps: {
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'gsap',
      'howler',
      'matter-js',
      'pixi.js'
    ],
  },
});
