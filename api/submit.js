import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fan_name, team, rating, satisfaction, comments } = req.body;

    const { error } = await supabase
      .from('survey_responses')
      .insert([{ fan_name, team, rating, satisfaction, comments }]);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Response saved!' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}