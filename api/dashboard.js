import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { count } = await supabase
      .from('survey_responses')
      .select('*', { count: 'exact', head: true });

    const { data } = await supabase
      .from('survey_responses')
      .select('rating, satisfaction');

    const avgRating = data && data.length > 0
      ? data.reduce((sum, row) => sum + row.rating, 0) / data.length
      : 0;

    res.status(200).json({
      totalResponses: count || 0,
      avgSatisfaction: Math.round(avgRating * 10),
      lastUpdated: new Date().toLocaleDateString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}