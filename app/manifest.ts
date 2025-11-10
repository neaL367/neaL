import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Neal367',
    short_name: 'Neal367',
    description: 'Lazy coding | Gamer | PixelArt | Rockstar Games fan',
    start_url: 'https://neal367.site',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '192x192',
        type: 'image/jpg',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpg',
      },
    ],
  }
}