import React from "react";
import type { Metadata } from "next";
import { ImageGrid } from "app/components/image-grid";

export const metadata: Metadata = {
  title: "Photos",
  description: "My Photos",
};

export default function Photos() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-medium">hotos</h1>
      <p className="mb-8">
        A collection of my favorite photos, showcasing moments from my life.
      </p>

      
    </section>
  );
}
