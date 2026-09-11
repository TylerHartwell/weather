import { Card } from "@/components/ui/card"
import LoadingOverlay from "./loading-overlay"

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <Card className="relative w-full flex-1 bg-gray-900 border-gray-800 text-white py-2 px-4">
        <LoadingOverlay />
      </Card>
    </div>
  )
}
