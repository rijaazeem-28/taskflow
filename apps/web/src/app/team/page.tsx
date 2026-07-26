import type { Metadata } from "next";
import { PlaceholderPage } from "@/lib/placeholder-page";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <PlaceholderPage
      title="Team"
      subtitle="Invite teammates and collaborate on shared work."
    />
  );
}
