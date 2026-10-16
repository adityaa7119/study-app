// lib/data/simulations.ts
import type { SimulationModel } from "@/lib/types/simulator";

export const SIMULATION_MODELS: SimulationModel[] = [
  // =========================================================================
  // 1. PROJECTILE MOTION WITH GRAVITY & DRAG
  // =========================================================================
  {
    id: "projectile-motion",
    title: "Ballistic Projectile Motion",
    subtitle: "Kinematics under gravity, elevation angle, and aerodynamic drag",
    category: "Physics",
    formula: "y(t) = v₀·sin(θ)·t - ½·g·t²  |  x(t) = v₀·cos(θ)·t",
    description:
      "Simulate classical 2D kinematics. Observe how launch angle and gravitational acceleration alter maximum apogee height, total range, and time of flight. Compare ideal parabolic paths with air resistance damping.",
    parameters: [
      {
        id: "velocity",
        label: "Initial Velocity (v₀)",
        min: 5,
        max: 80,
        step: 1,
        defaultValue: 35,
        unit: "m/s",
        description: "Muzzle launch speed of the projectile",
      },
      {
        id: "angle",
        label: "Launch Angle (θ)",
        min: 5,
        max: 85,
        step: 1,
        defaultValue: 45,
        unit: "°",
        description: "Elevation angle above horizontal ground",
      },
      {
        id: "gravity",
        label: "Gravity (g)",
        min: 1.6,
        max: 25.0,
        step: 0.1,
        defaultValue: 9.8,
        unit: "m/s²",
        description: "Gravitational acceleration (Earth: 9.8, Moon: 1.62, Mars: 3.72)",
      },
      {
        id: "drag",
        label: "Drag Coeff (k)",
        min: 0,
        max: 0.1,
        step: 0.005,
        defaultValue: 0.015,
        unit: "s⁻¹",
        description: "Linear aerodynamic air resistance factor",
      },
    ],
    calculate: (p) => {
      const v0 = p.velocity;
      const angleRad = (p.angle * Math.PI) / 180;
      const g = p.gravity;
      const k = p.drag;

      // Ideal metrics
      const idealFlightTime = (2 * v0 * Math.sin(angleRad)) / g;
      const idealMaxHeight = (Math.pow(v0 * Math.sin(angleRad), 2)) / (2 * g);
      const idealRange = (Math.pow(v0, 2) * Math.sin(2 * angleRad)) / g;

      // Numerical integration points (Euler integration step)
      const dt = 0.04;
      let x = 0;
      let y = 0;
      let vx = v0 * Math.cos(angleRad);
      let vy = v0 * Math.sin(angleRad);

      const points: { x: number; y: number }[] = [{ x: 0, y: 0 }];
      const idealPoints: { x: number; y: number }[] = [{ x: 0, y: 0 }];

      let simTime = 0;
      let actualMaxHeight = 0;

      while (y >= 0 && simTime < 25) {
        // Drag acceleration
        const ax = -k * vx;
        const ay = -g - k * vy;

        vx += ax * dt;
        vy += ay * dt;
        x += vx * dt;
        y += vy * dt;
        simTime += dt;

        if (y > actualMaxHeight) actualMaxHeight = y;
        if (y >= 0) {
          points.push({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
        }
      }

      // Generate ideal comparison trajectory points
      for (let t = 0; t <= idealFlightTime; t += idealFlightTime / 60) {
        const ix = v0 * Math.cos(angleRad) * t;
        const iy = v0 * Math.sin(angleRad) * t - 0.5 * g * t * t;
        if (iy >= 0) idealPoints.push({ x: Math.round(ix * 10) / 10, y: Math.round(iy * 10) / 10 });
      }

      const actualRange = points[points.length - 1]?.x || 0;

      return {
        metrics: [
          { label: "Max Height (Apogee)", value: actualMaxHeight.toFixed(1), unit: "m", highlight: true },
          { label: "Total Range", value: actualRange.toFixed(1), unit: "m", highlight: true },
          { label: "Flight Time", value: simTime.toFixed(2), unit: "s" },
          { label: "Vacuum Range (No Drag)", value: idealRange.toFixed(1), unit: "m" },
        ],
        points,
        secondaryPoints: idealPoints,
        infoText: `With launch angle ${p.angle}° at ${v0} m/s, drag reduced total downrange distance by ${Math.max(0, idealRange - actualRange).toFixed(1)}m compared to vacuum conditions.`,
      };
    },
    pythonCode: (p) => `# Python Kinematics Simulator (NumPy & SciPy)
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp

# Parameters from StudyBuddy Simulator
v0 = ${p.velocity}          # Initial launch speed (m/s)
angle_deg = ${p.angle}     # Launch angle (degrees)
g = ${p.gravity}           # Gravity (m/s^2)
k = ${p.drag}              # Air resistance coefficient (s^-1)

theta = np.radians(angle_deg)
vx0 = v0 * np.cos(theta)
vy0 = v0 * np.sin(theta)

def equations(t, state):
    x, y, vx, vy = state
    dxdt = vx
    dydt = vy
    dvxdt = -k * vx
    dvydt = -g - k * vy
    return [dxdt, dydt, dvxdt, dvydt]

def hit_ground(t, state):
    return state[1]  # Stop when y <= 0
hit_ground.terminal = True
hit_ground.direction = -1

# Solve initial value problem
sol = solve_ivp(equations, (0, 30), [0, 0, vx0, vy0], events=hit_ground, max_step=0.05)

plt.figure(figsize=(9, 4.5))
plt.plot(sol.y[0], sol.y[1], 'b-', lw=2, label=f"With Drag (k={k})")
plt.title(f"Projectile Trajectory: v0={v0}m/s, θ={angle_deg}°, g={g}m/s²")
plt.xlabel("Horizontal Distance (m)")
plt.ylabel("Vertical Height (m)")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()
`,
    matlabCode: (p) => `% MATLAB Ballistic Trajectory Simulator
v0 = ${p.velocity};          % Initial velocity (m/s)
theta = ${p.angle} * pi/180; % Angle in radians
g = ${p.gravity};           % Gravity (m/s^2)
k = ${p.drag};              % Drag coefficient

% State vector: [x, y, vx, vy]
y0 = [0; 0; v0*cos(theta); v0*sin(theta)];

ode = @(t, Y) [Y(3); Y(4); -k*Y(3); -g - k*Y(4)];
options = odeset('Events', @(t, Y) deal(Y(2), 1, -1)); % Stop on ground hit

[t, Y] = ode45(ode, [0, 30], y0, options);

plot(Y(:,1), Y(:,2), 'LineWidth', 2, 'Color', [0.85, 0.49, 0.16]);
grid on;
title(sprintf('Projectile Motion (v0=%d m/s, \\theta=%d^\\circ)', v0, ${p.angle}));
xlabel('Distance (m)'); ylabel('Height (m)');
`,
  },

  // =========================================================================
  // 2. DAMPED HARMONIC OSCILLATOR & RESONANCE
  // =========================================================================
  {
    id: "harmonic-oscillator",
    title: "Damped Harmonic Oscillator",
    subtitle: "Mass-spring-damper dynamics, transient decay & resonance",
    category: "Physics",
    formula: "m·ẍ + c·ẋ + k·x = 0  |  ω₀ = √(k/m),  ζ = c / (2√(mk))",
    description:
      "Vary mass, spring stiffness, and damping coefficient to transition between underdamped oscillations, critical damping (fastest return to equilibrium), and overdamped sluggish decay.",
    parameters: [
      {
        id: "mass",
        label: "Mass (m)",
        min: 0.5,
        max: 10,
        step: 0.5,
        defaultValue: 2.0,
        unit: "kg",
      },
      {
        id: "stiffness",
        label: "Spring Constant (k)",
        min: 5,
        max: 150,
        step: 5,
        defaultValue: 50,
        unit: "N/m",
      },
      {
        id: "damping",
        label: "Damping Coeff (c)",
        min: 0.1,
        max: 30,
        step: 0.2,
        defaultValue: 2.5,
        unit: "N·s/m",
      },
      {
        id: "x0",
        label: "Initial Displacement (x₀)",
        min: 0.2,
        max: 2.0,
        step: 0.1,
        defaultValue: 1.0,
        unit: "m",
      },
    ],
    calculate: (p) => {
      const m = p.mass;
      const k = p.stiffness;
      const c = p.damping;
      const x0 = p.x0;

      const w0 = Math.sqrt(k / m);
      const zeta = c / (2 * Math.sqrt(m * k));
      const period = (2 * Math.PI) / w0;

      let regime = "Underdamped (Oscillating)";
      if (Math.abs(zeta - 1.0) < 0.05) {
        regime = "Critically Damped (Fastest Decay)";
      } else if (zeta > 1.0) {
        regime = "Overdamped (No Oscillation)";
      }

      const points: { x: number; y: number }[] = [];
      const envelope: { x: number; y: number }[] = [];
      const tMax = 10;
      const dt = 0.05;

      for (let t = 0; t <= tMax; t += dt) {
        let x = 0;
        if (zeta < 1.0) {
          // Underdamped
          const wd = w0 * Math.sqrt(1 - zeta * zeta);
          x = x0 * Math.exp(-zeta * w0 * t) * Math.cos(wd * t);
          const env = x0 * Math.exp(-zeta * w0 * t);
          envelope.push({ x: Math.round(t * 10) / 10, y: Math.round(env * 100) / 100 });
        } else if (Math.abs(zeta - 1.0) < 0.05) {
          // Critically damped
          x = x0 * (1 + w0 * t) * Math.exp(-w0 * t);
        } else {
          // Overdamped
          const r1 = -w0 * (zeta - Math.sqrt(zeta * zeta - 1));
          const r2 = -w0 * (zeta + Math.sqrt(zeta * zeta - 1));
          x = (x0 / 2) * (Math.exp(r1 * t) + Math.exp(r2 * t));
        }

        points.push({ x: Math.round(t * 10) / 10, y: Math.round(x * 100) / 100 });
      }

      return {
        metrics: [
          { label: "Damping Ratio (ζ)", value: zeta.toFixed(2), highlight: true },
          { label: "Natural Frequency (ω₀)", value: `${w0.toFixed(2)} rad/s (${(w0 / (2 * Math.PI)).toFixed(2)} Hz)` },
          { label: "Oscillation Regime", value: regime, highlight: true },
          { label: "Natural Period (T₀)", value: `${period.toFixed(2)} s` },
        ],
        points,
        secondaryPoints: envelope,
        infoText: `System is in ${regime} with damping ratio ζ = ${zeta.toFixed(2)}. ${zeta < 1 ? "Amplitudes decay exponentially with envelope e^(-ζω₀t)." : "Motion decays exponentially without crossing equilibrium."}`,
      };
    },
    pythonCode: (p) => `# Python Damped Harmonic Oscillator Simulator
import numpy as np
import matplotlib.pyplot as plt

m = ${p.mass}       # Mass (kg)
k = ${p.stiffness}  # Spring constant (N/m)
c = ${p.damping}    # Damping coefficient (N*s/m)
x0 = ${p.x0}        # Initial position (m)

w0 = np.sqrt(k / m)
zeta = c / (2 * np.sqrt(m * k))

t = np.linspace(0, 10, 1000)

if zeta < 1.0: # Underdamped
    wd = w0 * np.sqrt(1 - zeta**2)
    x = x0 * np.exp(-zeta * w0 * t) * np.cos(wd * t)
    env = x0 * np.exp(-zeta * w0 * t)
else: # Overdamped / Critical
    r1 = -w0 * (zeta - np.sqrt(max(0, zeta**2 - 1)))
    r2 = -w0 * (zeta + np.sqrt(max(0, zeta**2 - 1)))
    x = 0.5 * x0 * (np.exp(r1 * t) + np.exp(r2 * t))

plt.figure(figsize=(9, 4))
plt.plot(t, x, 'orange', lw=2, label="Position x(t)")
if zeta < 1.0:
    plt.plot(t, env, 'k--', alpha=0.4, label="Decay Envelope")
plt.title(f"Oscillator Response: ζ={zeta:.2f}, ω₀={w0:.2f} rad/s")
plt.xlabel("Time (seconds)")
plt.ylabel("Displacement (m)")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()
`,
    matlabCode: (p) => `% MATLAB Damped Harmonic Oscillator
m = ${p.mass}; k = ${p.stiffness}; c = ${p.damping}; x0 = ${p.x0};

w0 = sqrt(k / m);
zeta = c / (2 * sqrt(m * k));
t = linspace(0, 10, 500);

if zeta < 1.0
    wd = w0 * sqrt(1 - zeta^2);
    x = x0 * exp(-zeta * w0 * t) .* cos(wd * t);
else
    r1 = -w0 * (zeta - sqrt(zeta^2 - 1));
    r2 = -w0 * (zeta + sqrt(zeta^2 - 1));
    x = 0.5 * x0 * (exp(r1*t) + exp(r2*t));
end

plot(t, x, 'Color', [0.85, 0.49, 0.16], 'LineWidth', 2);
grid on;
title(sprintf('Damped Oscillator (\\zeta = %.2f, \\omega_0 = %.2f rad/s)', zeta, w0));
xlabel('Time (s)'); ylabel('Displacement (m)');
`,
  },

  // =========================================================================
  // 3. FOURIER SERIES SYNTHESIS & HARMONICS
  // =========================================================================
  {
    id: "fourier-synthesis",
    title: "Fourier Series Waveform Synthesizer",
    subtitle: "Harmonic summation, Gibbs phenomenon & frequency decomposition",
    category: "Mathematics",
    formula: "Square: f(t) = (4/π) ∑ [sin((2n-1)ωt) / (2n-1)]",
    description:
      "Construct complex periodic discontinuous waves by superimposing pure sine and cosine harmonics. Adjust harmonic count N to watch Gibbs phenomenon ripples form at step transitions.",
    parameters: [
      {
        id: "harmonics",
        label: "Number of Harmonics (N)",
        min: 1,
        max: 35,
        step: 1,
        defaultValue: 7,
        unit: "terms",
        description: "Number of odd sinusoidal frequency components",
      },
      {
        id: "frequency",
        label: "Fundamental Frequency (f₀)",
        min: 0.5,
        max: 5,
        step: 0.5,
        defaultValue: 1.0,
        unit: "Hz",
      },
      {
        id: "amplitude",
        label: "Amplitude (A)",
        min: 0.5,
        max: 3.0,
        step: 0.25,
        defaultValue: 1.5,
        unit: "V",
      },
    ],
    calculate: (p) => {
      const N = Math.round(p.harmonics);
      const f0 = p.frequency;
      const A = p.amplitude;
      const w0 = 2 * Math.PI * f0;

      const points: { x: number; y: number }[] = [];
      const idealSquare: { x: number; y: number }[] = [];
      const tMax = 2.0;
      const dt = 0.005;

      for (let t = 0; t <= tMax; t += dt) {
        // Fourier sum for square wave
        let sum = 0;
        for (let n = 1; n <= N; n++) {
          const k = 2 * n - 1; // 1, 3, 5, 7...
          sum += (1 / k) * Math.sin(k * w0 * t);
        }
        const val = A * (4 / Math.PI) * sum;
        points.push({ x: Math.round(t * 100) / 100, y: Math.round(val * 100) / 100 });

        // Ideal square wave
        const ideal = Math.sin(w0 * t) >= 0 ? A : -A;
        idealSquare.push({ x: Math.round(t * 100) / 100, y: ideal });
      }

      // Gibbs overshoot is ~8.95%
      const peakOvershoot = A * 1.0895;

      return {
        metrics: [
          { label: "Harmonics Summed", value: `${N} terms (up to ${2 * N - 1}f₀)`, highlight: true },
          { label: "Gibbs Overshoot Peak", value: `${peakOvershoot.toFixed(2)} V (~8.9%)` },
          { label: "Period (T = 1/f₀)", value: `${(1 / f0).toFixed(2)} s` },
          { label: "Highest Harmonic Freq", value: `${((2 * N - 1) * f0).toFixed(1)} Hz` },
        ],
        points,
        secondaryPoints: idealSquare,
        infoText: `Summing ${N} odd harmonics approximates the square wave. Notice the high-frequency ringing at the sharp edges—this is the famous Gibbs Phenomenon.`,
      };
    },
    pythonCode: (p) => `# Python Fourier Series Waveform Synthesizer
import numpy as np
import matplotlib.pyplot as plt

N = ${Math.round(p.harmonics)}      # Number of odd harmonics
f0 = ${p.frequency}     # Fundamental frequency (Hz)
A = ${p.amplitude}      # Peak amplitude

w0 = 2 * np.pi * f0
t = np.linspace(0, 2, 1000)

# Vectorized harmonic summation
harmonics = np.arange(1, 2 * N, 2)  # 1, 3, 5...
fourier_sum = np.zeros_like(t)

for k in harmonics:
    fourier_sum += (1.0 / k) * np.sin(k * w0 * t)

fourier_wave = A * (4 / np.pi) * fourier_sum
ideal_square = A * np.sign(np.sin(w0 * t))

plt.figure(figsize=(9, 4))
plt.plot(t, ideal_square, 'k--', alpha=0.3, label="Ideal Square Wave")
plt.plot(t, fourier_wave, color="#D97D29", lw=2, label=f"Fourier Sum (N={N} harmonics)")
plt.title(f"Fourier Series Synthesis: N={N} Harmonics, f0={f0}Hz")
plt.xlabel("Time (s)")
plt.ylabel("Signal Amplitude")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()
`,
    matlabCode: (p) => `% MATLAB Fourier Series Synthesis
N = ${Math.round(p.harmonics)}; f0 = ${p.frequency}; A = ${p.amplitude};
w0 = 2 * pi * f0;
t = linspace(0, 2, 1000);

fourier_sum = zeros(size(t));
for n = 1:N
    k = 2 * n - 1;
    fourier_sum = fourier_sum + (1 / k) * sin(k * w0 * t);
end
signal = A * (4 / pi) * fourier_sum;

plot(t, signal, 'LineWidth', 2, 'Color', [0.85, 0.49, 0.16]);
grid on;
title(sprintf('Fourier Synthesis with N=%d Odd Harmonics', N));
xlabel('Time (s)'); ylabel('Amplitude (V)');
`,
  },

  // =========================================================================
  // 4. RLC RESONANT CIRCUIT & FREQUENCY RESPONSE
  // =========================================================================
  {
    id: "rlc-resonance",
    title: "Series RLC Circuit & Resonance",
    subtitle: "Impedance minimum, phase shift & quality factor Q",
    category: "Electrical & Signals",
    formula: "f₀ = 1 / (2π√LC)  |  Q = (1/R)·√(L/C)  |  Z = R + j(ωL - 1/ωC)",
    description:
      "Study electrical resonance in radio receivers and power transmission filters. At the resonant frequency f₀, inductive and capacitive reactances cancel out, leaving minimal pure resistive impedance and maximal current throughput.",
    parameters: [
      {
        id: "resistance",
        label: "Resistance (R)",
        min: 5,
        max: 200,
        step: 5,
        defaultValue: 25,
        unit: "Ω",
      },
      {
        id: "inductance",
        label: "Inductance (L)",
        min: 1,
        max: 100,
        step: 1,
        defaultValue: 20,
        unit: "mH",
      },
      {
        id: "capacitance",
        label: "Capacitance (C)",
        min: 0.1,
        max: 10,
        step: 0.1,
        defaultValue: 2.2,
        unit: "µF",
      },
      {
        id: "voltage",
        label: "Input AC Voltage (V_rms)",
        min: 1,
        max: 24,
        step: 1,
        defaultValue: 10,
        unit: "V",
      },
    ],
    calculate: (p) => {
      const R = p.resistance;
      const L = p.inductance * 1e-3; // Henry
      const C = p.capacitance * 1e-6; // Farad
      const V = p.voltage;

      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const Q = (1 / R) * Math.sqrt(L / C);
      const bandwidth = f0 / Q;

      const points: { x: number; y: number }[] = [];
      const fMin = Math.max(10, f0 * 0.2);
      const fMax = f0 * 2.5;
      const fStep = (fMax - fMin) / 80;

      for (let f = fMin; f <= fMax; f += fStep) {
        const w = 2 * Math.PI * f;
        const XL = w * L;
        const XC = 1 / (w * C);
        const Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));
        const currentI = V / Z; // Amperes
        points.push({ x: Math.round(f), y: Math.round(currentI * 1000) / 1000 });
      }

      const peakCurrent = V / R;

      return {
        metrics: [
          { label: "Resonant Frequency (f₀)", value: `${f0.toFixed(1)} Hz`, highlight: true },
          { label: "Quality Factor (Q)", value: Q.toFixed(2), highlight: true },
          { label: "Bandwidth (Δf)", value: `${bandwidth.toFixed(1)} Hz` },
          { label: "Peak Current (at f₀)", value: `${peakCurrent.toFixed(3)} A` },
        ],
        points,
        infoText: `At resonance f₀ = ${f0.toFixed(1)} Hz, impedance collapses to pure resistance R = ${R} Ω, allowing maximum current of ${peakCurrent.toFixed(2)} A. Quality Factor Q = ${Q.toFixed(2)} defines filter sharpness.`,
      };
    },
    pythonCode: (p) => `# Python Series RLC Circuit Frequency Response
import numpy as np
import matplotlib.pyplot as plt

R = ${p.resistance}         # Ohms
L = ${p.inductance} * 1e-3  # Henries
C = ${p.capacitance} * 1e-6 # Farads
V = ${p.voltage}            # Volts RMS

f0 = 1 / (2 * np.pi * np.sqrt(L * C))
Q = (1 / R) * np.sqrt(L / C)
bw = f0 / Q

frequencies = np.linspace(f0 * 0.2, f0 * 2.2, 500)
omega = 2 * np.pi * frequencies

XL = omega * L
XC = 1 / (omega * C)
Z = np.sqrt(R**2 + (XL - XC)**2)
current = V / Z

plt.figure(figsize=(9, 4))
plt.plot(frequencies, current, 'b-', lw=2)
plt.axvline(f0, color='r', linestyle='--', label=f'Resonance f0={f0:.1f}Hz')
plt.title(f"RLC Frequency Response: Q={Q:.2f}, Bandwidth={bw:.1f}Hz")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Current Response (Amps)")
plt.grid(True, alpha=0.3)
plt.legend()
plt.show()
`,
    matlabCode: (p) => `% MATLAB Series RLC Resonance
R = ${p.resistance}; L = ${p.inductance}*1e-3; C = ${p.capacitance}*1e-6; V = ${p.voltage};
f0 = 1 / (2 * pi * sqrt(L * C));
Q = (1 / R) * sqrt(L / C);

f = linspace(f0*0.2, f0*2.2, 500);
w = 2 * pi * f;
Z = sqrt(R^2 + (w*L - 1./(w*C)).^2);
I = V ./ Z;

plot(f, I, 'LineWidth', 2, 'Color', [0.85, 0.49, 0.16]);
xline(f0, '--r', sprintf('f_0 = %.1f Hz', f0));
grid on;
title(sprintf('RLC Resonance (Q = %.2f)', Q));
xlabel('Frequency (Hz)'); ylabel('Current (A)');
`,
  },
];
