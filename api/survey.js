import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Get the active survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('active', true)
      .single();

    if (surveyError) throw surveyError;
    if (!survey) return res.status(404).json({ error: 'No active survey found' });

    // Get all questions for this survey ordered by question_order
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', survey.id)
      .order('question_order', { ascending: true });

    if (questionsError) throw questionsError;

    res.status(200).json({ survey, questions });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}