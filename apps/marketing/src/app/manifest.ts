import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Haz Que Vuelva",
    short_name: "Haz Que Vuelva",
    description: "Diagnóstico privado de reconexión.",
    start_url: "/quiz",
    display: "standalone",
    background_color: "#050506",
    theme_color: "#050506",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
