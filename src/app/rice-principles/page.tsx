import type { Metadata } from "next"
import { RicePrinciplesContent } from "@/components/rice-principles-content"

export const metadata: Metadata = {
  title: "כללי ה-RICE | PriorityMaster",
  description: "הסבר על מרכיבי RICE, שאלות מנחות ונוסחת הציון",
}

export default function RicePrinciplesPage() {
  return <RicePrinciplesContent />
}
