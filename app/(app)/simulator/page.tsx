// app/(app)/simulator/page.tsx
import type { Metadata } from "next";
import SimulatorClient from "@/components/simulator/SimulatorClient";

export const metadata: Metadata = {
  title: "Concept to Code Simulator | Interactive STEM Workbench",
  description:
    "Interactive physics, math, and signal simulations. Adjust real-time parameters, visualize dynamic trajectories, and export synchronized Python & MATLAB code.",
};

export default function SimulatorPage() {
  return <SimulatorClient />;
}
