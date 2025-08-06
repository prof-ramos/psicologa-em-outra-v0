"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, X } from 'lucide-react'

interface ChatbotToggleProps {
  isVisible: boolean
  onToggle: () => void
  hasChartData: boolean
}

export function ChatbotToggle({ isVisible, onToggle, hasChartData }: ChatbotToggleProps) {
  if (isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onToggle}
        className={`rounded-full w-14 h-14 shadow-lg transition-all duration-300 ${
          hasChartData 
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 animate-pulse' 
            : 'bg-gray-400 hover:bg-gray-500'
        }`}
        size="icon"
        disabled={!hasChartData}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      
      {hasChartData && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">!</span>
        </div>
      )}
    </div>
  )
}
