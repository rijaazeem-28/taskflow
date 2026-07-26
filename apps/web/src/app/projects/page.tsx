import type { Metadata } from "next";
import { PlaceholderPage } from "@/lib/placeholder-page";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <PlaceholderPage
      title="Projects"
      subtitle="Group related tasks into focused project boards."
    />
  );
}
