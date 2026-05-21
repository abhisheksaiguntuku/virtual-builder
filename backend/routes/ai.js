import express from 'express';
import { getNextStageTip, getCostOptimizations, answerQuestion } from '../services/aiService.js';

const router = express.Router();

/**
 * POST /api/ai/next-stage-tip
 * Generates a tip for the next construction milestone
 */
router.post('/next-stage-tip', async (req, res) => {
  try {
    const { projectContext, completedStage, nextStage } = req.body;
    const tip = await getNextStageTip(projectContext, completedStage, nextStage);
    res.json({ success: true, tip });
  } catch (error) {
    console.error('[AI] next-stage-tip error:', error.message);
    res.status(500).json({ success: false, error: 'AI service unavailable. Check your GROQ_API_KEY.' });
  }
});

/**
 * POST /api/ai/cost-optimize
 * Returns 3 specific cost-saving suggestions
 */
router.post('/cost-optimize', async (req, res) => {
  try {
    const { projectContext, costData } = req.body;
    const suggestions = await getCostOptimizations(projectContext, costData);
    res.json({ success: true, suggestions });
  } catch (error) {
    console.error('[AI] cost-optimize error:', error.message);
    res.status(500).json({ success: false, error: 'AI service unavailable.' });
  }
});

/**
 * POST /api/ai/ask
 * Free-form Q&A with project context
 */
router.post('/ask', async (req, res) => {
  try {
    const { projectContext, question } = req.body;
    if (!question?.trim()) return res.status(400).json({ success: false, error: 'Question is required.' });
    const answer = await answerQuestion(projectContext, question);
    res.json({ success: true, answer });
  } catch (error) {
    console.error('[AI] ask error:', error.message);
    res.status(500).json({ success: false, error: 'AI service unavailable.' });
  }
});

export default router;
