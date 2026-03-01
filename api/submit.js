import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Rate limiting store
const submissions = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxSubmissions = 3;         // max 3 per hour

  if (!submissions.has(ip)) {
    submissions.set(ip, []);
  }

  const timestamps = submissions.get(ip).filter(t => now - t < windowMs);
  submissions.set(ip, timestamps);

  if (timestamps.length >= maxSubmissions) {
    return true;
  }

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
    // Layer 2 — Rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({
        error: 'Too many submissions. Please try again later.'
      });
    }

    const { fan_name, team, rating, satisfaction, comments, honeypot, recaptchaToken } = req.body;

    // Layer 1 — Honeypot check
    if (honeypot) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    // Layer 3 — reCAPTCHA check
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'Missing security token.' });
    }
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return res.status(400).json({ error: 'Security check failed. Please try again.' });
    }

    // Basic validation
    if (!team || !rating || !satisfaction) {
      return res.status(400).json({ error: 'Please fill in all required fields.' });
    }

    // Validate rating is between 1-10
    if (rating < 1 || rating > 10) {
      return res.status(400).json({ error: 'Invalid rating value.' });
    }

    // Validate satisfaction value
    const validSatisfaction = ['Very Happy', 'Happy', 'Neutral', 'Unhappy', 'Very Unhappy'];
    if (!validSatisfaction.includes(satisfaction)) {
      return res.status(400).json({ error: 'Invalid satisfaction value.' });
    }

    // Sanitize text fields
    const sanitize = (str) => str ? str.replace(/<[^>]*>/g, '').trim().slice(0, 500) : '';

    const { error } = await supabase
      .from('survey_responses')
      .insert([{
        fan_name:     sanitize(fan_name),
        team:         sanitize(team),
        rating:       parseInt(rating),
        satisfaction,
        comments:     sanitize(comments),
      }]);

    if (error) throw error;

    res.status(200).json({ success: true, message: 'Response saved!' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}