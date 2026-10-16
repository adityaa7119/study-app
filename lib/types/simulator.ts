// lib/types/simulator.ts

export type SimulationCategory = "Physics" | "Mathematics" | "Electrical & Signals";

export interface SimulationParam {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
  description?: string;
}

export interface SimulationModel {
  id: string;
  title: string;
  subtitle: string;
  category: SimulationCategory;
  formula: string;
  description: string;
  parameters: SimulationParam[];
  calculate: (params: Record<string, number>) => {
    metrics: { label: string; value: string; unit?: string; highlight?: boolean }[];
    points: { x: number; y: number }[];
    secondaryPoints?: { x: number; y: number }[];
    infoText?: string;
  };
  pythonCode: (params: Record<string, number>) => string;
  matlabCode: (params: Record<string, number>) => string;
}
