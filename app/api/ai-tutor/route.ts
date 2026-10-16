// app/api/ai-tutor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SYSTEM_INSTRUCTION = `You are StudyBot, an expert AI tutor specializing in Engineering education (First Year to Final Year: CS, IT, Electronics, Electrical, Mechanical, Civil, AI/ML) and semester exam preparation. 

Your personality:
- Friendly, encouraging, and patient
- Use simple language to explain complex concepts
- Provide step-by-step solutions
- Include relevant formulas with LaTeX notation
- End responses with a motivational nudge when appropriate

Your capabilities:
- Explain any Engineering Mathematics, Data Structures, Operating Systems, DBMS, Circuit Theory, Mechanics, or core engineering concept clearly
- Create practice questions with detailed solutions
- List key formulas and algorithms for a topic
- Break down problem-solving strategies

Format your responses using markdown for readability. Keep responses concise but complete. When showing formulas, use LaTeX ($ for inline, $$ for block equations).`;

function generateFallbackResponse(userPrompt: string): string {
  const p = userPrompt.toLowerCase().trim();

  const notice = `> ⚡ **Offline Demo Mode:** StudyBot generated this response locally because \`GEMINI_API_KEY\` is not configured in \`.env.local\`. To enable live Gemini 3.8 Flash answers for any question, add your free API key in \`.env.local\` ([Get free key from Google AI Studio](https://aistudio.google.com/apikey)).\n\n`;

  // Check for practice questions
  if (p.includes("practice question") || p.includes("practice questions") || p.includes("question") || p.includes("problem")) {
    if (p.includes("calculus") || p.includes("integration") || p.includes("derivative")) {
      return (
        notice +
        `### 📚 3 High-Yield Calculus Practice Questions

#### Question 1 (Definite Integration)
**Problem:** Evaluate the integral:
$$I = \\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx$$

**Step-by-step Solution:**
1. Using the property $\\int_a^b f(x)dx = \\int_a^b f(a + b - x)dx$:
   $$I = \\int_0^{\\pi/2} \\frac{\\sqrt{\\sin(\\pi/2 - x)}}{\\sqrt{\\sin(\\pi/2 - x)} + \\sqrt{\\cos(\\pi/2 - x)}} \\, dx = \\int_0^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}} \\, dx$$
2. Add both equations:
   $$2I = \\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x} + \\sqrt{\\cos x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\, dx = \\int_0^{\\pi/2} 1 \\, dx = [x]_0^{\\pi/2} = \\frac{\\pi}{2}$$
3. Therefore:
   $$I = \\frac{\\pi}{4}$$

---

#### Question 2 (Limits & L'Hôpital)
**Problem:** Evaluate $\\lim_{x \\to 0} \\frac{e^x - 1 - x}{x^2}$.

**Step-by-step Solution:**
1. Direct substitution gives $\\frac{1 - 1 - 0}{0} = \\frac{0}{0}$ (indeterminate form).
2. Applying L'Hôpital's Rule (differentiate numerator and denominator):
   $$\\lim_{x \\to 0} \\frac{e^x - 1}{2x}$$
3. Still $\\frac{0}{0}$. Differentiating once more:
   $$\\lim_{x \\to 0} \\frac{e^x}{2} = \\frac{e^0}{2} = \\frac{1}{2}$$

---

#### Question 3 (Maxima & Minima)
**Problem:** Find the maximum value of $f(x) = x(12 - 2x)^2$ on $[0, 6]$.

**Step-by-step Solution:**
1. Differentiate using product rule:
   $$f'(x) = (12 - 2x)^2 + x \\cdot 2(12 - 2x)(-2) = (12 - 2x)(12 - 6x)$$
2. Set $f'(x) = 0 \\implies x = 6$ or $x = 2$.
3. Evaluate values:
   - $f(0) = 0$
   - $f(6) = 0$
   - $f(2) = 2(12 - 4)^2 = 2(64) = 128$
4. **Maximum value:** $128$ at $x = 2$.

💡 *Exam Tip: Always double-check end-point values when dealing with closed intervals!*`
      );
    }

    // Default / Kinematics & Mechanics practice questions
    return (
      notice +
      `### 🎯 3 High-Yield Exam Practice Questions (Mechanics & Physics)

#### Question 1 (Projectile Motion)
**Problem:** A ball is projected from the ground with an initial velocity $u = 20\\text{ m/s}$ at an angle of $\\theta = 30^\\circ$ to the horizontal. Take $g = 10\\text{ m/s}^2$. 
Find:
1. Maximum height attained ($H$)
2. Total time of flight ($T$)
3. Horizontal range ($R$)

**Step-by-step Solution:**
1. **Vertical component:** $u_y = u \\sin 30^\\circ = 20 \\times 0.5 = 10\\text{ m/s}$.
   **Horizontal component:** $u_x = u \\cos 30^\\circ = 20 \\times \\frac{\\sqrt{3}}{2} = 10\\sqrt{3}\\text{ m/s}$.
2. **Maximum Height:**
   $$H = \\frac{u_y^2}{2g} = \\frac{10^2}{2 \\times 10} = 5\\text{ m}$$
3. **Time of Flight:**
   $$T = \\frac{2u_y}{g} = \\frac{2 \\times 10}{10} = 2\\text{ s}$$
4. **Horizontal Range:**
   $$R = u_x \\times T = 10\\sqrt{3} \\times 2 = 20\\sqrt{3} \\approx 34.64\\text{ m}$$

---

#### Question 2 (Newton's Laws & Friction)
**Problem:** A block of mass $m = 4\\text{ kg}$ is on a rough horizontal surface with coefficient of friction $\\mu_k = 0.25$. A horizontal force $F = 25\\text{ N}$ is applied. Find the acceleration. ($g = 10\\text{ m/s}^2$)

**Step-by-step Solution:**
1. **Normal force:** $N = mg = 4 \\times 10 = 40\\text{ N}$.
2. **Frictional force:** $f_k = \\mu_k N = 0.25 \\times 40 = 10\\text{ N}$.
3. **Net force on block:**
   $$F_{\\text{net}} = F - f_k = 25 - 10 = 15\\text{ N}$$
4. **Acceleration:**
   $$a = \\frac{F_{\\text{net}}}{m} = \\frac{15}{4} = 3.75\\text{ m/s}^2$$

---

#### Question 3 (Work-Energy Theorem)
**Problem:** A block of mass $m = 2\\text{ kg}$ sliding on a frictionless surface at $v_0 = 6\\text{ m/s}$ strikes and compresses a horizontal spring with $k = 800\\text{ N/m}$. Find the maximum compression $x_{\\text{max}}$.

**Step-by-step Solution:**
1. By Conservation of Mechanical Energy:
   $$\\frac{1}{2} m v_0^2 = \\frac{1}{2} k x_{\\text{max}}^2$$
2. Substitute the values:
   $$2 \\times 6^2 = 800 \\times x_{\\text{max}}^2 \\implies 72 = 800 x_{\\text{max}}^2$$
3. Solve for $x_{\\text{max}}$:
   $$x_{\\text{max}}^2 = \\frac{72}{800} = 0.09 \\implies x_{\\text{max}} = 0.3\\text{ m} = 30\\text{ cm}$$

💪 *Keep practicing! Consistency turns difficult problems into second nature.*`
    );
  }

  // Check for formulas
  if (p.includes("formula") || p.includes("formulas")) {
    return (
      notice +
      `### 📐 Essential Formula Sheet

#### 1. Kinematics (Uniform Acceleration)
- $v = u + at$
- $s = ut + \\frac{1}{2}at^2$
- $v^2 = u^2 + 2as$
- $s_n = u + \\frac{a}{2}(2n - 1)$

#### 2. Newton's Laws & Dynamics
- $\\vec{F}_{\\text{net}} = m\\vec{a} = \\frac{d\\vec{p}}{dt}$
- Frictional Force: $f_s \\le \\mu_s N$, $f_k = \\mu_k N$
- Centripetal Force: $F_c = \\frac{mv^2}{r} = m\\omega^2 r$

#### 3. Work, Energy & Power
- Work: $W = \\int \\vec{F} \\cdot d\\vec{r} = F d \\cos\\theta$
- Kinetic Energy: $K = \\frac{1}{2}mv^2 = \\frac{p^2}{2m}$
- Spring Potential Energy: $U = \\frac{1}{2}kx^2$
- Power: $P = \\frac{dW}{dt} = \\vec{F} \\cdot \\vec{v}$

#### 4. Calculus Essentials
- Product Rule: $\\frac{d}{dx}(uv) = u'v + uv'$
- Quotient Rule: $\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{u'v - uv'}{v^2}$
- Standard Integral: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)$
- Chain Rule: $\\frac{df(g(x))}{dx} = f'(g(x)) \\cdot g'(x)$`
    );
  }

  // Check for explanation
  if (p.includes("explain") || p.includes("what is") || p.includes("how does")) {
    return (
      notice +
      `### 💡 Concept Explanation

Here is a clear, intuitive breakdown to master this concept:

1. **The Core Intuition:**
   Think of physical and mathematical concepts through universal conservation principles. Energy, mass, and momentum are conserved in closed systems—they only transfer between different states (e.g., potential energy turning into kinetic energy).

2. **The Mathematical Model:**
   Most physical formulas balance driving forces against resistance:
   $$\\text{Effect} = \\frac{\\text{Driving Force}}{\\text{Inertia / Resistance}}$$
   Examples include Ohm's Law ($I = V/R$) and Newton's Second Law ($a = F/m$).

3. **High-Yield Exam Strategy:**
   - **Step 1:** Always sketch a free-body or state diagram.
   - **Step 2:** Identify knowns, unknowns, and conserved quantities.
   - **Step 3:** Perform a dimensional unit check before committing your final answer.

🚀 *Remember: True understanding comes from asking "why" at each step, not just memorizing equations.*`
    );
  }

  // Generic tutor fallback
  return (
    notice +
    `Hello! I'm **StudyBot**, your engineering tutor and academic study partner. 🎓

I can help you with:
- 📝 **Practice Questions:** Step-by-step solved problems for Engineering Semesters & Core subjects
- 📐 **Formula & Algorithm Sheets:** Derivations, circuit formulas, complexity sheets, and quick review cards
- 💡 **Concept Clarification:** Clear step-by-step breakdowns for DSA, Math, Digital Systems, Networks, and Mechanics
- ⏱️ **Semester Exam Strategies:** Marks distribution, step marking techniques, and numerical shortcuts

Try asking:
- *"Create 3 practice questions on Eigenvalues & Cayley-Hamilton"*
- *"Explain Dijkstra's shortest path algorithm step by step"*
- *"List key formulas for Fourier Series and Transforms"*`
  );
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, previousInteractionId } = body as {
      message: string;
      previousInteractionId?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let cleanMessage = message.trim();
    if (
      cleanMessage.endsWith("on:") ||
      cleanMessage.endsWith("on: ") ||
      cleanMessage.endsWith("for:") ||
      cleanMessage.endsWith("for: ")
    ) {
      cleanMessage += " Mechanics and Calculus";
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const isPlaceholder =
      !apiKey ||
      apiKey === "your-gemini-api-key-here" ||
      apiKey.includes("your-gemini-api-key") ||
      apiKey.trim() === "";

    if (isPlaceholder) {
      const fallbackReply = generateFallbackResponse(cleanMessage);
      return NextResponse.json({
        reply: fallbackReply,
        interactionId: `offline-${Date.now()}`,
      });
    }

    try {
      const genai = new GoogleGenAI({ apiKey });
      const interaction = await genai.interactions.create({
        model: "gemini-3.8-flash",
        system_instruction: SYSTEM_INSTRUCTION,
        input: cleanMessage,
        ...(previousInteractionId && !previousInteractionId.startsWith("offline-") && !previousInteractionId.startsWith("fallback-")
          ? { previous_interaction_id: previousInteractionId }
          : {}),
        store: true,
      });

      const responseText = interaction.output_text;
      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      return NextResponse.json({
        reply: responseText,
        interactionId: interaction.id,
      });
    } catch (aiErr) {
      console.warn("[AI Tutor] Gemini API error, using structured fallback response:", aiErr);
      const isKeyError =
        aiErr instanceof Error &&
        (aiErr.message.includes("API key not valid") ||
          aiErr.message.includes("API_KEY_INVALID") ||
          aiErr.message.includes("400"));

      let warningPrefix = "";
      if (isKeyError) {
        warningPrefix = `> ⚠️ **Gemini API Key Notice:** The configured \`GEMINI_API_KEY\` in \`.env.local\` was rejected by Google Gemini (API key invalid). Please check your key at [Google AI Studio](https://aistudio.google.com/apikey) and update \`.env.local\`.\n\n`;
      } else {
        warningPrefix = `> ⚠️ **Gemini Service Notice:** Live generation encountered a temporary issue (${aiErr instanceof Error ? aiErr.message : "Service error"}). Here is a curated solution below:\n\n`;
      }

      const rawFallback = generateFallbackResponse(cleanMessage);
      const cleanedFallback = rawFallback.replace(/^> ⚡ \*\*Offline Demo Mode:\*\*[\s\S]*?\n\n/, "");
      return NextResponse.json({
        reply: warningPrefix + cleanedFallback,
        interactionId: `fallback-${Date.now()}`,
      });
    }
  } catch (err) {
    console.error("[AI Tutor] Error:", err);
    const message = err instanceof Error ? err.message : "AI service error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
