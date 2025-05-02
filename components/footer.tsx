import { TextLoop } from './ui/text-loop'
import { ThemeSwitch } from './ui/theme-switch'
import { AccessibleLink } from './ui/accessible-link'
import { HorizontalRule } from './ui/horizontal-rule'

export function Footer() {
  return (
    <footer className="dark:border-zinc-800">
      <HorizontalRule />
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <AccessibleLink href="https://github.com/neaL367" external>
          <TextLoop className="text-xs text-zinc-800 dark:text-zinc-200">
            <span>© {new Date().getFullYear()} neaL367.</span>
            <span>Atichat Thongnak</span>
          </TextLoop>
        </AccessibleLink>
        <div className=" text-zinc-800">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
