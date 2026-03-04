import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  try {
    const { surveyId } = req.query;

    // If a specific survey ID is requested → return full results
    if (surveyId) {
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;
      if (!survey) return res.status(404).json({ error: 'Survey not found' });

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('question_order', { ascending: true });

      if (questionsError) throw questionsError;

      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('question_id, answer')
        .eq('survey_id', surveyId);

      if (responsesError) throw responsesError;

      const { count: totalResponses } = await supabase
        .from('responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', surveyId)
        .eq('question_id', questions[0]?.id);

      const questionResults = questions.map(q => {
        const questionResponses = responses.filter(r => r.question_id === q.id);
        const total = questionResponses.length;
        const optionCounts = q.options.map(option => {
          const count = questionResponses.filter(r => r.answer === option).length;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          return { option, count, percentage };
        });
        return {
          id: q.id,
          question_text: q.question_text,
          question_order: q.question_order,
          total_answers: total,
          results: optionCounts,
        };
      });

      return res.status(200).json({
        survey,
        totalResponses: totalResponses || 0,
        questions: questionResults,
      });
    }

    // Otherwise → return list of all inactive surveys
    const { data: surveys, error } = await supabase
      .from('surveys')
      .select('id, title, month, year, opens_at, closes_at')
      .eq('active', false)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;

    // Get response count for each survey
    const surveysWithCounts = await Promise.all(
      surveys.map(async s => {
        const { count } = await supabase
          .from('responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', s.id);
        return { ...s, totalResponses: count || 0 };
      })
    );

    res.status(200).json({ surveys: surveysWithCounts });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}