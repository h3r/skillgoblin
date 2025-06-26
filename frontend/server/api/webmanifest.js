import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/manifest+json')
  
  const logoPath = resolve('/app/data', 'logo.png'); // Server-only logo file
  const logoExists = existsSync(logoPath);
  console.log('Web Manifest: Logo exists:', logoExists, logoPath);

  return {
    name: process.env.APP_NAME || 'My App',
    short_name: process.env.APP_SHORT_NAME || 'App',
    start_url: '/',
    display: 'standalone',
    background_color: process.env.BACKGROUND_COLOR || '#ffffff',
    theme_color: process.env.THEME_COLOR || '#000000',
    icons: logoExists
    ? [
        {
          src: '/api/logo', // See next section
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    : [
        {
          "src": "/web-app-manifest-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "maskable"
        },
        {
          "src": "/web-app-manifest-512x512.png",
          "sizes": "512x512",
          "type": "image/png",
          "purpose": "maskable"
        }
      ]
  }
})