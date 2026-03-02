import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    // Get active survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('active', true)
      .single();

    if (surveyError) throw surveyError;
    if (!survey) return res.status(404).json({ error: 'No active survey found' });

    // Get all questions for this survey
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', survey.id)
      .order('question_order', { ascending: true });

    if (questionsError) throw questionsError;

    // Get all responses for this survey
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('question_id, answer')
      .eq('survey_id', survey.id);

    if (responsesError) throw responsesError;

    // Get total unique respondents (count distinct fan submissions)
    const { count: totalResponses } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('survey_id', survey.id)
      .eq('question_id', questions[0]?.id);

    // Build results per question
    const questionResults = questions.map(q => {
      const questionResponses = responses.filter(r => r.question_id === q.id);
      const total = questionResponses.length;

      // Count each option
      const optionCounts = q.options.map(option => {
        const count = questionResponses.filter(r => r.answer === option).length;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        return { option, count, percentage };
      });

      return {
        id:            q.id,
        question_text: q.question_text,
        question_order:q.question_order,
        total_answers: total,
        results:       optionCounts,
      };
    });

    res.status(200).json({
      survey,
      totalResponses: totalResponses || 0,
      questions: questionResults,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}