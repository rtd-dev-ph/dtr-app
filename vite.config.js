import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: "config/auth.js", dest: "config" },
        { src: "js/storage.js", dest: "js" },
        { src: "js/clock.js", dest: "js" },
        { src: "js/punch.js", dest: "js" },
        { src: "js/records.js", dest: "js" },
        { src: "js/dtr-report.js", dest: "js" },
        { src: "js/ui.js", dest: "js" },
        { src: "js/app.js", dest: "js" },
      ],
    }),
  ],
});
