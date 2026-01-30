import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Neal367",
    short_name: "Neal367",
    description: "Lazy coding | Gamer | PixelArt | Rockstar Games fan",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon.jpg", sizes: "192x192", type: "image/jpeg" },
      { src: "/icon.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
  };
}
