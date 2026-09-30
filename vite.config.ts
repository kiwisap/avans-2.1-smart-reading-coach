import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    css: {
        preprocessorOptions: {
            scss: {
                // Bootstrap 5 still uses Sass @import, which newer Sass versions warn about.
                silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
                quietDeps: true,
            },
        },
    },
});
