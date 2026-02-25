import { Suspense } from "react";
import TAMVisualizer from "@/components/TAMVisualizer";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-gray-500 text-lg">Loading...</div>
        </div>
      }
    >
      <TAMVisualizer />
    </Suspense>
  );
}
