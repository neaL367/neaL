import { TextLoop } from './ui/text-loop'
import { ThemeSwitch } from './ui/theme-switch'
import { AccessibleLink } from './ui/accessible-link'

export function Footer() {
  return (
    <footer className="px-4 md:px-6 py-4 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <AccessibleLink href="https://github.com/neaL367" external>
          <TextLoop className="text-xs text-zinc-800 dark:text-zinc-200">
            <span>© {new Date().getFullYear()} neaL367.</span>
            <span>Atichat Thongnak</span>
          </TextLoop>
        </AccessibleLink>
        <div className="text-xs text-zinc-800 dark:text-zinc-200">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
