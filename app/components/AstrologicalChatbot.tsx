"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Stars, User, Bot, Sparkles, MessageCircle } from 'lucide-react'
import type { ChartData } from "../types/astrology"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface AstrologicalChatbotProps {
  chartData: ChartData | null
  isVisible: boolean
  onToggle: () => void
}

export function AstrologicalChatbot({ chartData, isVisible, onToggle }: AstrologicalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Inicializar conversa quando chartData estiver disponível
  useEffect(() => {
    if (chartData && !isInitialized) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✨ Olá, ${chartData.name}! Sou seu assistente astrológico pessoal. Analisei seu mapa natal e estou aqui para conversar sobre suas características astrológicas, responder suas dúvidas e oferecer insights personalizados.

🌟 Posso te ajudar com:
• Interpretação das posições dos seus planetas
• Significado dos signos no seu mapa
• Análise dos aspectos planetários
• Características da sua personalidade astrológica
• Dicas baseadas no seu perfil astral

O que você gostaria de saber sobre seu mapa astral?`,
        timestamp: new Date()
      }
      setMessages([welcomeMessage])
      setIsInitialized(true)
    }
  }, [chartData, isInitialized])

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !chartData) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Adicionar indicador de digitação
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      const response = await fetch('/api/astrology-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          chartData,
          conversationHistory: messages.slice(-10) // Últimas 10 mensagens para contexto
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao processar mensagem')
      }

      const data = await response.json()

      // Remover indicador de digitação e adicionar resposta
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing')
        return [...withoutTyping, {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }]
      })

    } catch (error) {
      console.error('Erro no chat:', error)
      
      // Remover indicador de digitação e mostrar erro
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing')
        return [...withoutTyping, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '😔 Desculpe, tive um problema para processar sua mensagem. Pode tentar novamente?',
          timestamp: new Date()
        }]
      })

      toast({
        title: "Erro no chat",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedQuestions = [
    "Qual é o meu signo ascendente e o que isso significa?",
    "Como os planetas no meu mapa influenciam minha personalidade?",
    "Quais são os aspectos mais importantes no meu mapa?",
    "O que minha Lua revela sobre minhas emoções?",
    "Como posso usar meu mapa astral para crescimento pessoal?"
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question)
  }

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl border-2 border-purple-200 bg-gradient-to-b from-white to-purple-50">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stars className="w-5 h-5" />
            <div>
              <CardTitle className="text-lg">Assistente Astrológico</CardTitle>
              <CardDescription className="text-purple-100">
                {chartData ? `Conversando sobre o mapa de ${chartData.name}` : 'Aguardando mapa astral...'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-white hover:bg-white/20"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(600px-120px)]">
        {!chartData ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="space-y-3">
              <Sparkles className="w-12 h-12 mx-auto text-purple-400" />
              <p className="text-gray-600">
                Gere seu mapa astral primeiro para começar nossa conversa astrológica!
              </p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500">
                        <AvatarFallback>
                          <Bot className="w-4 h-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      {message.isTyping ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-500">Analisando seu mapa...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      )}
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-purple-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 bg-gray-300">
                        <AvatarFallback>
                          <User className="w-4 h-4 text-gray-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-sm text-gray-600 mb-3">💡 Perguntas sugeridas:</p>
                <div className="space-y-2">
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-2 text-xs"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Pergunte sobre seu mapa astral..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
