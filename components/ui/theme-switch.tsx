'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'

const THEMES_OPTIONS = [
  {
    label: 'Light',
    id: 'light',
    icon: (
      <SunIcon className="h-4 w-4 " />
    ),
  },
  {
    label: 'Dark',
    id: 'dark',
    icon: (
      <MoonIcon className="h-4 w-4 " />
    ),
  },
  {
    label: 'System',
    id: 'system',
    icon: (
      <MonitorIcon className="h-4 w-4 " />
    ),
  },
]

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme: currentTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="opacity-0">
        {THEMES_OPTIONS.map((theme) => (
          <button
            key={theme.id}
            className="inline-flex h-7 w-7 items-center justify-center"
            aria-hidden="true"
          >
            {theme.icon}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-1">
      {THEMES_OPTIONS.map((theme) => {
        const isActive = theme.id === currentTheme
        return (
          <button
            key={theme.id}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
              isActive 
                ? 'text-zinc-900 dark:text-zinc-50' 
                : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300'
            }`}
            type="button"
            aria-label={`Switch to ${theme.label} theme`}
            onClick={() => setTheme(theme.id)}
            aria-pressed={isActive}
          >
            {theme.icon}
          </button>
        )
      })}
    </div>
  )
}

