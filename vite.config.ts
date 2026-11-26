import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const packageJson = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
    version: string;
};

// Short commit hash for the "about" part of the settings. Render gives it as an environment
// variable while building; locally git knows it.
function commitHash(): string {
    if (process.env.RENDER_GIT_COMMIT) return process.env.RENDER_GIT_COMMIT.slice(0, 7);
    try {
        return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
            .toString()
            .trim();
    } catch {
        return 'lokaal';
    }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
        __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __GIT_COMMIT__: JSON.stringify(commitHash()),
    },
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
