import Image from "next/image";
import WheelSection from "@/app/ui/WheelSection"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-4 py-16 bg-gray-50">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          La Roue des clichés misogynes sur les féministes sénégalaises
        </h1>
        <p className="mt-2 text-gray-500 text-sm max-w-sm mx-auto">
          Tourne la roue et découvre quel cliché il va te sortir de sa cervelle étriquée de misogyne
        </p>
      </div>

      <WheelSection />
    </main>
  );
}

