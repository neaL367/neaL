"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
// import { loadAll } from "@tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.

export default function Snow() {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 120,
      detectRetina: true,
      background: {
        color: {
          value: "transparent",
        },
      },
      // interactivity: {
      //   events: {
      //     onHover: {
      //       enable: true,
      //       mode: "repulse",
      //     },
      //   },
      //   modes: {
      //     push: {
      //       quantity: 4,
      //     },
      //     repulse: {
      //       distance: 66,
      //       duration: 0.66,
      //     },
      //   },
      // },
      particles: {
        color: { value: "#000000" },
        move: {
          direction: MoveDirection.bottom,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          speed: 0.66,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 266,
        },
        opacity: {
          value: 0.8,
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
          speed: 1.66,
        },
        zIndex: {
          value: { min: 0, max: 50 },
        },
      },
    }),
    []
  );

  if (init) {
    return (
      <div className="absolute top-0 left-0 w-full h-full">
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
        className="w-full h-full"
      />
      </div>
    );
  }

  return <></>;
}
