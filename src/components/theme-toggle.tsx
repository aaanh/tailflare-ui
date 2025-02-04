"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering anything until mounted
  if (!mounted) {
    return <Button variant="outline" size="icon">
      <Sun className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Loading theme</span>
    </Button>
  }

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      size={"icon"}
      title={`Current theme: ${theme}`}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'}`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
      <Monitor className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
