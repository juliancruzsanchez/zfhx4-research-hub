import { vlyPlugin } from "@vly-ai/integrations";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
//
// Chunking strategy:
//
//  - react-vendor: core framework (react, react-dom, react-router).
//    These change with every React release; isolating them keeps the
//    long-lived page chunks cacheable.
//  - radix-ui: every Radix package the project imports, in one
//    chunk. The list is generated from `grep -rhE
//    "from '@radix-ui/react-[a-z-]+'" src/` — re-derive if a new
//    Radix dependency is added. AspectRatio and Slot were missing
//    from the previous list and were inlining into the main bundle.
//  - framer-motion: large animation library. Own chunk so the main
//    page bundle stays small and the animation code is loaded only
//    where it is used.
//
// Removed chunks:
//
//  - convex-vendor (was empty: the project does not import `convex`
//    in any client code path).
//  - charts (was empty: `recharts` is only imported by the shadcn
//    `chart.tsx` UI scaffold, which the app does not render).
//  - forms (was empty: `react-hook-form` / `zod` are only imported
//    by the shadcn `form.tsx` UI scaffold, which the app does not
//    render).
export default defineConfig({
  plugins: [vlyPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for better debugging (disable in production if needed)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router"],
          "radix-ui": [
            "@radix-ui/react-accordion",
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-aspect-ratio",
            "@radix-ui/react-avatar",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-collapsible",
            "@radix-ui/react-context-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-hover-card",
            "@radix-ui/react-label",
            "@radix-ui/react-menubar",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-progress",
            "@radix-ui/react-radio-group",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slider",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toggle",
            "@radix-ui/react-toggle-group",
            "@radix-ui/react-tooltip",
          ],
          "framer-motion": ["framer-motion"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit for better chunking
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: "esnext",
    // Minify options - using esbuild (faster than terser)
    minify: "esbuild",
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router",
    ],
  },
  // Performance hints
  server: {
    hmr: false,
  },
});
