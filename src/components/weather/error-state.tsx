"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-3xl bg-gray-900 border-gray-800 text-white p-8">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Error Loading Weather Data</h3>
          <p className="mb-4">{message}</p>
          <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </Card>
    </div>
  )
}
