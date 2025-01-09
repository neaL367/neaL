"use client";

import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function Snow() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    await console.log(container);
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        className="h-full"
        options={{
          fullScreen: { enable: false },
          fpsLimit: 120,
          detectRetina: true,
          background: {
            color: {
              value: "transparent",
            },
          },
          particles: {
            color: { value: "#000000" },
            move: {
              direction: "bottom",
              enable: true,
              outModes: "out",
              speed: 0.66,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 166,
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 3,
            },
            wobble: {
              enable: true,
              distance: 10,
              speed: 2,
            },
            zIndex: {
              value: { min: 0, max: 50 },
            },
          },
        }}
      />
    </div>
  );
}
