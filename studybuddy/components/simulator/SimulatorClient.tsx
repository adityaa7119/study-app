// components/simulator/SimulatorClient.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sliders,
  Play,
  RotateCcw,
  Copy,
  Check,
  Code2,
  Terminal,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Info,
  Maximize2,
  Download,
  Share2,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import { SIMULATION_MODELS } from "@/lib/data/simulations";
import type { SimulationModel } from "@/lib/types/simulator";

export default function SimulatorClient() {
  const { openBot } = useAppStore();

  const [selectedModelId, setSelectedModelId] = useState<string>(SIMULATION_MODELS[0].id);
  const activeModel = useMemo(
    () => SIMULATION_MODELS.find((m) => m.id === selectedModelId) || SIMULATION_MODELS[0],
    [selectedModelId]
  );

  // Parameter State Map
  const [params, setParams] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SIMULATION_MODELS[0].parameters.forEach((p) => {
      initial[p.id] = p.defaultValue;
    });
    return initial;
  });

  // Code Tab: Python vs MATLAB
  const [codeLang, setCodeLang] = useState<"python" | "matlab">("python");
  const [codeCopied, setCodeCopied] = useState(false);

  // Switch Model Handler
  const handleSelectModel = (model: SimulationModel) => {
    setSelectedModelId(model.id);
    const newParams: Record<string, number> = {};
    model.parameters.forEach((p) => {
      newParams[p.id] = p.defaultValue;
    });
    setParams(newParams);
  };

  // Slider change handler
  const handleParamChange = (id: string, val: number) => {
    setParams((prev) => ({ ...prev, [id]: val }));
  };

  // Reset to model defaults
  const handleResetDefaults = () => {
    const defaultParams: Record<string, number> = {};
    activeModel.parameters.forEach((p) => {
      defaultParams[p.id] = p.defaultValue;
    });
    setParams(defaultParams);
    toast.info("Parameters reset to model defaults.");
  };

  // Compute live points & metrics
  const simResults = useMemo(() => {
    try {
      return activeModel.calculate(params);
    } catch {
      return { metrics: [], points: [] };
    }
  }, [activeModel, params]);

  // Copy synchronized code
  const activeCodeString =
    codeLang === "python" ? activeModel.pythonCode(params) : activeModel.matlabCode(params);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeCodeString);
      setCodeCopied(true);
      toast.success(`${codeLang.toUpperCase()} simulation script copied!`);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Dynamic SVG Path Generator for Points
  const svgPathData = useMemo(() => {
    const pts = simResults.points;
    if (!pts || pts.length === 0) return { primary: "", secondary: "", bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1 } };

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    pts.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    if (simResults.secondaryPoints) {
      simResults.secondaryPoints.forEach((p) => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    }

    // Add 10% breathing room to bounds
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const padY = rangeY * 0.15;
    const effMinY = Math.min(0, minY - padY);
    const effMaxY = maxY + padY;
    const effRangeY = effMaxY - effMinY;

    // ViewBox is 600 x 300
    const W = 600;
    const H = 280;

    const toSvg = (x: number, y: number) => {
      const px = ((x - minX) / rangeX) * (W - 40) + 20;
      const py = H - 20 - ((y - effMinY) / effRangeY) * (H - 40);
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    };

    const primaryPath = pts.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${toSvg(p.x, p.y)}`, "");

    let secondaryPath = "";
    if (simResults.secondaryPoints && simResults.secondaryPoints.length > 0) {
      secondaryPath = simResults.secondaryPoints.reduce(
        (acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${toSvg(p.x, p.y)}`,
        ""
      );
    }

    return { primary: primaryPath, secondary: secondaryPath, bounds: { minX, maxX, minY: effMinY, maxY: effMaxY } };
  }, [simResults]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto font-poppins text-white">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & MODEL SELECTOR */}
      {/* ========================================================================= */}
      <div className="apple-glass-card p-6 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97D29]/20 border border-[#D97D29]/30 text-[#E3A354] text-xs font-semibold mb-2">
              <Activity className="h-3.5 w-3.5" />
              <span>Concept to Code Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-poppins">
              Physics & Mathematics Simulator
            </h1>
            <p className="text-xs sm:text-sm text-[#E8D6C4]/85 mt-1 max-w-2xl">
              Tweak parameters to watch physical systems and mathematical laws evolve on the live canvas.
              Synchronized Python and MATLAB numerical code updates in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openBot()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition active:scale-95 shadow-md"
            >
              <Bot className="h-4 w-4 text-[#E3A354]" />
              <span>Explain with StudyBot</span>
            </button>
          </div>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar">
          {SIMULATION_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition shrink-0 border",
                selectedModelId === model.id
                  ? "bg-gradient-to-r from-[#D97D29] to-[#E3A354] text-white border-[#E3A354] shadow-md shadow-[#D97D29]/30"
                  : "bg-white/5 text-[#E8D6C4] border-white/10 hover:bg-white/15 hover:text-white"
              )}
            >
              <span>{model.title}</span>
              <span className="text-[10px] opacity-75">({model.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SIMULATOR WORKBENCH (GRID: PARAMETERS + LIVE CANVAS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parameters Sliders (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="apple-glass-card p-5 rounded-3xl border border-white/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[#E3A354]" />
                <h3 className="text-sm font-bold text-white">Simulation Parameters</h3>
              </div>
              <button
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] text-[#E8D6C4]/70 hover:text-white transition"
                title="Reset to default values"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Sliders */}
            <div className="space-y-4">
              {activeModel.parameters.map((param) => {
                const val = params[param.id] ?? param.defaultValue;
                return (
                  <div key={param.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-white/90">
                        {param.label}
                      </label>
                      <span className="font-mono text-[11px] font-bold text-[#E3A354] bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                        {val} {param.unit}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      value={val}
                      onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D97D29]"
                    />

                    {param.description && (
                      <p className="text-[10px] text-[#E8D6C4]/60">{param.description}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Presets for Current Model */}
            {activeModel.id === "projectile-motion" && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase font-bold text-white/50 block mb-1.5">
                  Planetary Gravity Presets:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { name: "Earth (9.8)", g: 9.8 },
                    { name: "Moon (1.6)", g: 1.62 },
                    { name: "Mars (3.7)", g: 3.72 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleParamChange("gravity", preset.g)}
                      className={cn(
                        "py-1 rounded-lg border text-center transition",
                        params["gravity"] === preset.g
                          ? "bg-[#D97D29] border-[#E3A354] text-white font-bold"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                      )}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Governing Formula Card */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#E3A354] block mb-1">
                Governing Equation
              </span>
              <div className="font-mono text-xs text-amber-200/95 leading-relaxed">
                {activeModel.formula}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live SVG Simulation Canvas & Metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="apple-glass-card p-6 rounded-3xl border border-white/15 space-y-5">
            {/* Visualizer Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h2 className="text-base font-bold text-white">{activeModel.title}</h2>
                <p className="text-xs text-[#E8D6C4]/80">{activeModel.subtitle}</p>
              </div>

              {/* Metric Highlights */}
              <div className="flex flex-wrap items-center gap-2">
                {simResults.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "px-3 py-1.5 rounded-xl border text-xs",
                      m.highlight
                        ? "bg-[#D97D29]/20 border-[#E3A354]/40 text-[#E3A354] font-bold"
                        : "bg-black/40 border-white/10 text-white/90"
                    )}
                  >
                    <span className="text-white/60 text-[10px] block">{m.label}</span>
                    <span>
                      {m.value} {m.unit || ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Interactive SVG Canvas */}
            <div className="relative w-full h-[320px] bg-black/70 rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between p-3 select-none shadow-inner">
              {/* Background Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 pointer-events-none opacity-15">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-r border-b border-white" />
                ))}
              </div>

              {/* Dynamic SVG Curves */}
              <svg className="w-full h-full" viewBox="0 0 600 280">
                {/* Secondary Reference Curve (e.g. ideal vacuum parabola or envelope) */}
                {svgPathData.secondary && (
                  <path
                    d={svgPathData.secondary}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.35"
                  />
                )}

                {/* Primary Simulation Response Curve */}
                {svgPathData.primary && (
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    d={svgPathData.primary}
                    fill="none"
                    stroke="#E3A354"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}

                {/* Ground axis baseline */}
                <line x1="20" y1="260" x2="580" y2="260" stroke="#ffffff" strokeWidth="1" opacity="0.25" />
              </svg>

              {/* Overlay Bottom Legend & Dynamic Info */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-full bg-[#E3A354]" />
                    <span>Calculated Simulation</span>
                  </span>
                  {svgPathData.secondary && (
                    <span className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 border-b border-dashed border-white/60" />
                      <span>Reference Curve</span>
                    </span>
                  )}
                </div>

                <span className="font-mono text-[10px] text-white/50">
                  Real-time ODE / Analytical Engine
                </span>
              </div>
            </div>

            {/* Dynamic Physical Insight Callout */}
            {simResults.infoText && (
              <div className="p-3.5 rounded-2xl bg-[#D97D29]/15 border border-[#D97D29]/30 flex items-start gap-2.5 text-xs text-[#E8D6C4] leading-relaxed">
                <Info className="h-4 w-4 text-[#E3A354] shrink-0 mt-0.5" />
                <span>{simResults.infoText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SYNCHRONIZED CONCEPT-TO-CODE WORKBENCH (PYTHON & MATLAB) */}
      {/* ========================================================================= */}
      <div className="apple-glass-card p-6 rounded-3xl border border-white/15 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#D97D29]/20 border border-[#D97D29]/40 flex items-center justify-center text-[#E3A354]">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Synchronized Code Generator</h3>
              <p className="text-[11px] text-[#E8D6C4]/80">
                Executable simulation scripts reflecting your live slider parameters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Python / MATLAB Tabs */}
            <div className="flex rounded-xl bg-black/40 border border-white/15 p-1">
              <button
                onClick={() => setCodeLang("python")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition",
                  codeLang === "python" ? "bg-[#D97D29] text-white" : "text-white/60 hover:text-white"
                )}
              >
                Python (SciPy)
              </button>
              <button
                onClick={() => setCodeLang("matlab")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold transition",
                  codeLang === "matlab" ? "bg-[#D97D29] text-white" : "text-white/60 hover:text-white"
                )}
              >
                MATLAB (ode45)
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition active:scale-95"
            >
              {codeCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{codeCopied ? "Copied!" : "Copy Script"}</span>
            </button>
          </div>
        </div>

        {/* Code display */}
        <div className="relative">
          <pre className="p-4 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed shadow-inner max-h-[420px]">
            <code>{activeCodeString}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
