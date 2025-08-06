"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Stars, Settings } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Stars className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-lg">Mapa Astral</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/">Gerador</Link>
            </Button>
            
            <Button
              variant={pathname === "/test-api" ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/test-api">
                <Settings className="w-4 h-4 mr-2" />
                Teste API
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
