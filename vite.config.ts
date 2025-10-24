import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['wouter'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['@radix-ui/react-tabs', '@radix-ui/react-dialog', '@radix-ui/react-select'],
          
          // Profile page chunks
          'profile-core': [
            './client/src/components/profile/ProfileHeader.tsx',
            './client/src/components/profile/ProfileTabs.tsx',
            './client/src/components/profile/OverviewTab.tsx'
          ],
          'profile-stats': [
            './client/src/components/profile/StatisticsTab.tsx',
            './client/src/components/profile/WritingStatsChart.tsx'
          ],
          'profile-achievements': ['./client/src/components/profile/AchievementsTab.tsx'],
          'profile-subscription': ['./client/src/components/profile/SubscriptionTab.tsx'],
          'profile-settings': ['./client/src/components/profile/SettingsTab.tsx'],
          
          // Chart libraries (if installed)
          // 'chart-vendor': ['chart.js', 'react-chartjs-2']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
});
