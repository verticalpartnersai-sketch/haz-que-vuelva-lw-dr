import Script from "next/script";

const utmifyScriptUrl = "https://cdn.utmify.com.br/scripts/utms/latest.js";

export function UtmifyTrackingScript() {
  return (
    <Script
      data-utmify-prevent-subids=""
      data-utmify-prevent-xcod-sck=""
      id="utmify-utms"
      src={utmifyScriptUrl}
      strategy="afterInteractive"
    />
  );
}
