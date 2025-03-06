import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          background: "#f6f6f6",
          width: "100%",
          height: "100%",
          padding: "0px",
          backgroundImage: "url(https://neal367.vercel.app/og.png)",
        }}
      ></div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
