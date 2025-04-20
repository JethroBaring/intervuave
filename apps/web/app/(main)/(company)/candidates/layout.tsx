import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidates | Intervuave",
};

export default function CandidatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 