'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'

const THEMES_OPTIONS = [
  {
    label: 'Light',
    id: 'light',
    icon: <SunIcon className="h-4 w-4 transition-all" />,
  },
  {
    label: 'Dark',
    id: 'dark',
    icon: <MoonIcon className="h-4 w-4 transition-all" />,
  },
  {
    label: 'System',
    id: 'system',
    icon: <MonitorIcon className="h-4 w-4 transition-all" />,
  },
]

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme: currentTheme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="flex gap-1" aria-hidden="true">
      {THEMES_OPTIONS.map(theme => (
        <div key={theme.id} className="h-7 w-7" />
      ))}
    </div>
  }

  return (
    <div className="flex gap-1 rounded-md bg-zinc-100 p-1 dark:bg-zinc-800">
      {THEMES_OPTIONS.map((theme) => {
        const isActive = theme.id === currentTheme
        return (
          <button
            key={theme.id}
            className={`
              inline-flex h-7 w-7 items-center justify-center rounded-md
              transition-colors duration-200 
              ${isActive 
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50' 
                : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50'}
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2
            `}
            type="button"
            aria-label={`Switch to ${theme.label} theme`}
            aria-pressed={isActive}
            onClick={() => setTheme(theme.id)}
          >
            {theme.icon}
          </button>
        )
      })}
    </div>
  )
}