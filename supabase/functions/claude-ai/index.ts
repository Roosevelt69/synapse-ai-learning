// Deploy: supabase functions deploy claude-ai
// Secret:  supabase secrets set ANTHROPIC_API_KEY=<your-key>

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MODEL = 'claude-sonnet-4-6';

async function callClaude(system: string, userContent: string, maxTokens = 1024): Promise<string> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY secret not set on this Supabase project.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, payload, user_id } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    let content = '';

    // ── SANDBOX ──────────────────────────────────────────────────────────────
    if (type === 'sandbox') {
      const { prompt, temperature } = payload;
      const creativityLabel =
        temperature <= 0.3 ? 'precise and factual'
        : temperature <= 0.6 ? 'balanced and professional'
        : temperature <= 0.85 ? 'creative and exploratory'
        : 'wild and highly creative';

      const system = `You are a helpful AI assistant inside a developer learning sandbox. Be educational, clear, and appropriately detailed. The user has set temperature to ${temperature} (${creativityLabel}), so calibrate your response style accordingly. Keep responses under 400 words unless the task genuinely requires more.`;

      content = await callClaude(system, prompt, 800);

      if (user_id) {
        await supabase.from('ai_sandbox_history').insert({
          user_id, prompt, response: content, temperature, model: MODEL,
        }).throwOnError();
      }
    }

    // ── PROJECT GENERATOR ────────────────────────────────────────────────────
    else if (type === 'generate_project') {
      const { completed_courses, xp, level, level_label } = payload;
      const courseList = completed_courses.length > 0
        ? completed_courses.join(', ')
        : 'none yet — this student is just getting started';

      const system = 'You are an AI learning coach that generates practical, portfolio-worthy coding projects. Always respond with valid JSON only — no markdown fences, no explanation outside the JSON object.';

      const userContent = `Generate exactly 3 coding project ideas for a ${level_label} developer (Level ${level}, ${xp} XP total).
Completed courses: ${courseList}.

Rules:
- Projects must build on what they have actually learned
- Mix of difficulties (beginner → intermediate → advanced relative to their level)
- Each should be practical and portfolio-worthy
- Estimated time should be realistic (1–8 hours)

Return ONLY this exact JSON structure (no extra text, no markdown):
{
  "projects": [
    {
      "title": "Project Name",
      "emoji": "🔧",
      "description": "What the project does and why it's valuable (2 sentences max)",
      "difficulty": "Beginner",
      "skills": ["skill1", "skill2", "skill3"],
      "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
      "estimated_time": "2-3 hours"
    }
  ]
}`;

      content = await callClaude(system, userContent, 1200);

      if (user_id) {
        try {
          const parsed = JSON.parse(content);
          for (const project of parsed.projects) {
            await supabase.from('generated_projects').insert({
              user_id,
              title: project.title,
              emoji: project.emoji,
              description: project.description,
              difficulty: project.difficulty,
              skills: project.skills,
              steps: project.steps,
              estimated_time: project.estimated_time,
              course_context: completed_courses.join(', ') || 'beginner',
            });
          }
        } catch (_) { /* non-fatal — return response even if DB insert fails */ }
      }
    }

    // ── SMART COACHING ───────────────────────────────────────────────────────
    else if (type === 'coaching') {
      const { streak, xp, level, level_label, streak_status, completed_lessons, completed_courses } = payload;

      const statusDesc: Record<string, string> = {
        active: 'completed a lesson today — great momentum',
        at_risk: "hasn't studied today yet — streak at risk tonight",
        broken: 'missed some days and their streak just reset',
        new: 'just getting started on their learning journey',
      };

      const system = 'You are an enthusiastic but grounded AI learning coach. Keep messages warm, specific, and actionable. Always respond with valid JSON only — no markdown, no text outside the JSON.';

      const userContent = `Write a personalized coaching message for this learner:
- Streak: ${streak} days (${statusDesc[streak_status] ?? 'learning actively'})
- Total XP: ${xp} | Level ${level} (${level_label})
- Lessons completed: ${completed_lessons}
- Courses completed: ${completed_courses.length > 0 ? completed_courses.join(', ') : 'none yet'}

Return ONLY this JSON (no extra text):
{
  "message": "Warm, personal 2-3 sentence message addressing their exact situation",
  "tip": "One specific, immediately actionable study tip for today",
  "challenge": "One small challenge they can complete in under 15 minutes right now",
  "emoji": "🎯"
}`;

      content = await callClaude(system, userContent, 400);

      if (user_id) {
        try {
          const parsed = JSON.parse(content);
          await supabase.from('coaching_messages').insert({
            user_id, message: parsed.message, type: streak_status,
          });
        } catch (_) { /* non-fatal */ }
      }
    }

    // ── REFLECTION ───────────────────────────────────────────────────────────
    else if (type === 'reflection') {
      const { period, stats } = payload;

      const system = 'You are an insightful AI learning analyst. Generate encouraging, data-driven learning reflections. Always respond with valid JSON only — no markdown, no text outside the JSON.';

      const userContent = `Generate a ${period} learning reflection for this student.

Learning stats:
${JSON.stringify(stats, null, 2)}

Return ONLY this JSON (no extra text):
{
  "summary": "2-3 sentences celebrating their progress and noting the most meaningful achievement",
  "insights": [
    "Specific, data-driven insight about their learning pattern",
    "Encouraging observation about their consistency or growth trajectory",
    "One concrete, actionable suggestion for the next ${period === 'weekly' ? 'week' : 'month'}"
  ],
  "highlight": "The single most impressive thing they did this ${period === 'weekly' ? 'week' : 'month'} in one sentence"
}`;

      content = await callClaude(system, userContent, 600);

      if (user_id) {
        try {
          const parsed = JSON.parse(content);
          await supabase.from('reflections').insert({
            user_id, period,
            summary: parsed.summary,
            insights: parsed.insights,
            stats,
          });
        } catch (_) { /* non-fatal */ }
      }
    }

    else {
      return new Response(JSON.stringify({ error: `Unknown request type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[claude-ai] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
