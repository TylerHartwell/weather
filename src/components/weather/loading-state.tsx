import { Card } from "@/components/ui/card"

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-3xl bg-gray-900 border-gray-800 text-white p-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading weather data...</p>
        </div>
      </Card>
    </div>
  )
}
