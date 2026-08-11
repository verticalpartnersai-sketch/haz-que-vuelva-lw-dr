import { MetaPixelBridge } from "@/features/analytics/meta-pixel-bridge";
import {
  isMetaPixelId,
  metaPixelBootstrap,
} from "@/features/analytics/meta-pixel-events";

export function MetaPixelLoader({ pixelId }: { pixelId?: string }) {
  if (!isMetaPixelId(pixelId)) return null;
  const normalizedPixelId = pixelId.trim();

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: metaPixelBootstrap(normalizedPixelId),
        }}
        id="meta-pixel-bootstrap"
      />
      <MetaPixelBridge pixelId={normalizedPixelId} />
    </>
  );
}
