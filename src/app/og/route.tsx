/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
// @ts-check

import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

export const runtime = "edge";

export async function GET() {
  const imageData = await fetch(
    new URL("../../../public/og.png", import.meta.url)
  ).then((res) => res.arrayBuffer());

  const base64ImageData = Buffer.from(imageData).toString("base64");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          background: "#f6f6f6",
          width: "100%",
          height: "100%",
          padding: "0px",
        }}
      >
        <img
          width="1200"
          height="630"
          src={`data:image/png;base64,${base64ImageData}`}
          style={{
            objectFit: "cover",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
