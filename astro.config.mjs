import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
    site: 'https://www.limpiezastorrenueva.com',
    output: 'static',
    integrations: [
        sitemap({
            filter: (page) => !page.includes('/admin') && !page.includes('/api'),
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: new Date(),
        }),
    ],
    srcDir: './src',
    publicDir: './public',
    outDir: './dist',
    server: {
        host: true
    }
});
