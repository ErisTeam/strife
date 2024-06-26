import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import autoprefixer from 'autoprefixer';
import postcss_nested from 'postcss-nested';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
	plugins: [tsconfigPaths(), solidPlugin()],
	css: {
		postcss: {
			plugins: [autoprefixer, postcss_nested],
		},
	},

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	// prevent vite from obscuring rust errors
	clearScreen: false,
	// tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: '0.0.0.0',
	},
	// to make use of `TAURI_DEBUG` and other env variables
	// https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
	envPrefix: ['VITE_', 'TAURI_'],
	build: {
		// Tauri supports es2021
		target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		// don't minify for debug builds
		minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_DEBUG,
	},
});
