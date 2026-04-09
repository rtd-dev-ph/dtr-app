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
        { src: "config/*", dest: "config" },
        { src: "js/*", dest: "js" },
      ],
    }),
  ],
});
