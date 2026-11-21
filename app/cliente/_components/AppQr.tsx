"use client";

import { QRCodeSVG } from "qrcode.react";

/** QR code da build do EAS: aponte a câmara do telemóvel para instalar. */
export function AppQr({ url }: { url: string }) {
  return (
    <div className="rounded-2xl bg-white p-3">
      <QRCodeSVG value={url} size={168} level="M" bgColor="#ffffff" fgColor="#120d26" title="QR code para instalar a app" />
    </div>
  );
}
