'use client'

import { useEffect, useMemo, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine"
import { loadSlim } from "@tsparticles/slim"

export default function Snow() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container)
  }

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
  )

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
    )
  }

  return <></>
}

