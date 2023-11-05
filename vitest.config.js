import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import solidPlugin from 'vite-plugin-solid';
export default defineConfig({
	plugins: [solidPlugin(), tsconfigPaths()],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
	test: {
		environment: 'jsdom',
		globals: true,
		testTransformMode: { web: ['/.[jt]sx?$/'] },
	},
});
