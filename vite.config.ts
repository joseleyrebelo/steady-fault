import path from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [dts({ rollupTypes: true })],
  build: {
    minify: false,
		target: "modules",
    reportCompressedSize: true,
    lib: {
      name: "ts-util",
      entry: path.resolve(__dirname, "src/index.ts"),
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"],
    },
  },
});