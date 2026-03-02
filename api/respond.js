import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Rate limiting
const submissions = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxSubmissions = 3;
  if (!submissions.has(ip)) submissions.set(ip, []);
  const timestamps = submissions.get(ip).filter(t => now - t < windowMs);
  submissions.set(ip, timestamps);
  if (timestamps.length >= maxSubmissions) return true;
  timestamps.push(now);
  return false;
}

// reCAPTCHA verification
async function verifyRecaptcha(token) {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    { method: 'POST' }
  );
  const data = await response.json();
  return data.success && data.score >= 0.5;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }

    const { survey_id, fan_name, team, answers, honeypot, recaptchaToken } = req.body;

    // Honeypot check
    if (honeypot) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    // reCAPTCHA check
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Missing security token.' });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ error: 'Security check failed. Please try again.' });
    }

    // Validate required fields
    if (!survey_id || !team || !answers || answers.length === 0) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Sanitize
    const sanitize = (str) => str ? str.replace(/<[^>]*>/g, '').trim().slice(0, 500) : '';

    // Build rows — one row per question answer
    const rows = answers.map(a => ({
      survey_id,
      question_id: a.question_id,
      fan_name:    sanitize(fan_name),
      team:        sanitize(team),
      answer:      sanitize(a.answer),
    }));

    const { error } = await supabase
      .from('responses')
      .insert(rows);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Response saved!' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}