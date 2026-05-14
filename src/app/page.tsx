import type { Metadata } from "next"
import { RiceCalculator } from "@/components/rice-calculator"

export const metadata: Metadata = {
  title: "מחשבון RICE | PriorityMaster",
  description: "חישוב ציון RICE ושמירה לרשימת תעדוף",
}

export default function HomePage() {
  return <RiceCalculator />
}
