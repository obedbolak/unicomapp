// components/pdf/PdfQrCode.tsx
//
// A QR code for react-pdf documents, drawn as vector shapes (not an image), so
// it stays sharp at any zoom and scans reliably from print. Reusable in any
// PDF: pass the link to encode and the printed size in points.

import React from "react";
import { Svg, Path, Rect } from "@react-pdf/renderer";
import { qrMatrix } from "@/lib/qr";

type Props = {
  /** What the code opens when scanned — normally a verify link from lib/qr. */
  value: string;
  /** Printed width/height in points (72 pt = 1 inch). ~60 pt scans easily. */
  size?: number;
  /** Colour of the dark modules. Keep it dark on a light background. */
  color?: string;
};

export function PdfQrCode({ value, size = 60, color = "#0A1545" }: Props) {
  const { size: n, path } = qrMatrix(value);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>
      <Rect x={0} y={0} width={n} height={n} fill="#FFFFFF" />
      <Path d={path} fill={color} />
    </Svg>
  );
}

export default PdfQrCode;
