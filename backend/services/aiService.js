import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Build a system prompt that gives Llama full project context
 */
function buildSystemPrompt(projectContext = {}) {
  const ctx = projectContext || {};
  return `You are "GharBanao AI Advisor", an expert Indian civil engineer and construction consultant.
You specialize in residential house construction across Indian cities, Vastu Shastra, local material sourcing, and budget optimization.

Current User Project:
- City: ${ctx.city || 'India'}
- Plot Size: ${ctx.plotLength || '?'}×${ctx.plotWidth || '?'} feet
- Budget: ₹${ctx.budget || '?'} Lakhs
- Quality Tier: ${ctx.qualityTier || 'Standard'}
- Facing Direction: ${ctx.plotFacing || 'East'}

Rules:
- Always give practical, actionable advice relevant to this specific city and budget.
- Be concise. Max 3-4 sentences unless asked for more.
- Use Indian construction terms (RCC, PCC, TMT bars, OPC cement, etc.) naturally.
- Always mention local brands or markets relevant to the city when possible.
- Format responses in plain text, no markdown.`;
}

/**
 * Generate a "next stage tip" when a milestone is completed
 */
export async function getNextStageTip(projectContext, completedStage, nextStage) {
  const chat = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(projectContext) },
      {
        role: 'user',
        content: `The user just completed "${completedStage}". The next stage is "${nextStage}". 
Give one focused expert tip (2-3 sentences) for what to watch out for or do well during "${nextStage}" for a house in ${projectContext.city || 'India'}.`
      }
    ],
    max_tokens: 150,
    temperature: 0.7
  });
  return chat.choices[0]?.message?.content || 'Stay focused on quality materials for this stage!';
}

/**
 * Generate cost optimization suggestions from BOM data
 */
export async function getCostOptimizations(projectContext, costData) {
  const totalCost = costData?.costBreakdown?.total || 0;
  const chat = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(projectContext) },
      {
        role: 'user',
        content: `The estimated construction cost is ₹${(totalCost / 100000).toFixed(1)} Lakhs against a budget of ₹${projectContext.budget} Lakhs in ${projectContext.city}.
Give exactly 3 specific, numbered cost-saving suggestions that can realistically reduce this without compromising structural quality. Be specific to the city and tier.`
      }
    ],
    max_tokens: 300,
    temperature: 0.6
  });
  return chat.choices[0]?.message?.content || 'Consider bulk purchasing materials to save 8-12% overall.';
}

/**
 * Answer a free-form question from the user
 */
export async function answerQuestion(projectContext, question) {
  const chat = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: buildSystemPrompt(projectContext) },
      { role: 'user', content: question }
    ],
    max_tokens: 400,
    temperature: 0.75
  });
  return chat.choices[0]?.message?.content || 'I could not process that. Please try again.';
}
