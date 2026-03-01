import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useState } from "react";

const C = {
  pitch1:   "#2D7A3A",
  pitch2:   "#276E34",
  line:     "rgba(255,255,255,0.25)",
  white:    "#FFFFFF",
  card:     "rgba(0,0,0,0.60)",
  text:     "#FFFFFF",
  muted:    "rgba(255,255,255,0.55)",
  accent:   "#F5C518",
  mint:     "#6BCB77",
  coral:    "#FF6B6B",
  sky:      "#4ECDC4",
  peach:    "#FF9A3C",
};

const teams = [
  "Arsenal", "Aston Villa", "Barcelona", "Bayern Munich",
  "Chelsea", "Inter Milan", "Juventus", "Liverpool",
  "Manchester City", "Manchester United", "PSG", "Real Madrid",
  "Tottenham", "AC Milan", "Atletico Madrid", "Other"
];

const happinessOptions = [
  { label: "😄 Very Happy",   value: "Very Happy",   color: C.mint },
  { label: "🙂 Happy",        value: "Happy",        color: C.sky },
  { label: "😐 Neutral",      value: "Neutral",      color: C.accent },
  { label: "😕 Unhappy",      value: "Unhappy",      color: C.peach },
  { label: "😞 Very Unhappy", value: "Very Unhappy", color: C.coral },
];

function PitchBackground() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
      viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      {[...Array(12)].map((_, i) => (
        <rect key={i} x={i * 100} y={0} width={100} height={800}
          fill={i % 2 === 0 ? C.pitch1 : C.pitch2} />
      ))}
      <rect x={60} y={40} width={1080} height={720} fill="none" stroke={C.line} strokeWidth={3} />
      <line x1={600} y1={40} x2={600} y2={760} stroke={C.line} strokeWidth={2.5} />
      <circle cx={600} cy={400} r={90} fill="none" stroke={C.line} strokeWidth={2.5} />
      <circle cx={600} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      <rect x={60} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={975} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={28} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      <rect x={1140} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      <rect x={0} y={0} width={1200} height={800} fill="rgba(0,0,0,0.45)" />
    </svg>
  );
}

export default function SurveyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    fan_name:     "",
    team:         "",
    rating:       0,
    satisfaction: "",
    comments:     "",
    honeypot:     "",
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const canSubmit = form.team && form.rating > 0 && form.satisfaction && !form.honeypot;

  const getRatingLabel = (r) => {
    if (r === 0)  return "";
    if (r <= 2)   return "😞 Terrible";
    if (r <= 4)   return "😕 Poor";
    if (r <= 6)   return "😐 Average";
    if (r <= 8)   return "🙂 Good";
    if (r <= 9)   return "😄 Great";
    return             "🏆 Outstanding!";
  };

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  try {
    // Get reCAPTCHA token
    const token = await executeRecaptcha('survey_submit');

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, recaptchaToken: token }),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);
    } else {
      setError(data.error || 'Something went wrong. Please try again.');
    }
  } catch (err) {
    setError('Could not connect. Please try again.');
  }
  setLoading(false);
};

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { outline: none; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.25); }
        input:focus, textarea:focus { border-color: rgba(245,197,24,0.6) !important; }
        .team-btn { transition: all 0.2s; cursor: pointer; }
        .team-btn:hover { border-color: rgba(245,197,24,0.5) !important; color: rgba(245,197,24,0.8) !important; }
        .rating-btn { transition: all 0.15s; cursor: pointer; }
        .rating-btn:hover { transform: scale(1.15); }
        .happy-btn { transition: all 0.2s; cursor: pointer; }
        .happy-btn:hover { transform: translateX(4px); }
        .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <PitchBackground />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Navbar */}
        <div style={{
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 64,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>⚽</span>
            <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, letterSpacing: "0.1em", color: C.white }}>
              FOOT<span style={{ color: C.accent }}>POLL</span>
            </span>
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>Fan Survey · 2026</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 580 }}>

            {/* SUCCESS SCREEN */}
            {submitted ? (
              <div style={{
                background: C.card, backdropFilter: "blur(12px)",
                borderRadius: 24, padding: "52px 40px", textAlign: "center",
                border: "1px solid rgba(107,203,119,0.3)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              }}>
                <div style={{ fontSize: 72, marginBottom: 20 }}>🏆</div>
                <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 40, letterSpacing: "0.05em", color: C.accent, marginBottom: 12 }}>
                  Thanks for voting!
                </h2>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                  Your response has been recorded and will<br />appear on the Footpoll dashboard!
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => {
                    setSubmitted(false);
                    setForm({ fan_name: "", team: "", rating: 0, satisfaction: "", comments: "" });
                  }} style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12, padding: "12px 24px", color: C.white,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                  }}>
                    Submit Another
                  </button>
                  <a href="/" style={{
                    background: C.accent, borderRadius: 12, padding: "12px 28px",
                    color: "#000", fontSize: 14, fontWeight: 700,
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    View Dashboard →
                  </a>
                </div>
              </div>
            ) : (

              /* SURVEY FORM */
              <div style={{
                background: C.card, backdropFilter: "blur(12px)",
                borderRadius: 24, padding: "40px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              }}>
                {/* Header */}
                <div style={{ marginBottom: 36, textAlign: "center" }}>
                  <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, letterSpacing: "0.05em", color: C.white, marginBottom: 6 }}>
                    Fan Survey ⚽
                  </h1>
                  <p style={{ color: C.muted, fontSize: 14 }}>
                    Share your thoughts about your team!
                  </p>
                </div>

                {/* Q1 — Name (Optional) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>What's your name?</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", fontSize: 11 }}>Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={form.fan_name}
                    onChange={e => update('fan_name', e.target.value)}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
                      padding: "13px 16px", color: C.white, fontSize: 15,
                      transition: "border 0.2s",
                    }}
                  />
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Q2 — Team (Required) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>Football team you support</span>
                    <span style={{ color: C.coral, fontWeight: 600, fontSize: 11 }}>Required</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {teams.map(t => (
                      <button key={t} className="team-btn" onClick={() => update('team', t)} style={{
                        background: form.team === t ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.05)",
                        border: form.team === t ? `1px solid ${C.accent}` : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20, padding: "7px 15px",
                        color: form.team === t ? C.accent : C.muted,
                        fontSize: 13, fontWeight: form.team === t ? 600 : 400,
                      }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Q3 — Rating 1-10 (Required) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>How do you feel about your team's current status?</span>
                    <span style={{ color: C.coral, fontWeight: 600, fontSize: 11 }}>Required</span>
                  </label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                      <button key={n} className="rating-btn" onClick={() => update('rating', n)} style={{
                        flex: 1, height: 44, borderRadius: 8, border: "none",
                        background: form.rating >= n ? C.accent : "rgba(255,255,255,0.08)",
                        color: form.rating >= n ? "#000" : C.muted,
                        fontSize: 14, fontWeight: 700,
                      }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>1 = Very bad</span>
                    {form.rating > 0 && (
                      <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>
                        {getRatingLabel(form.rating)}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>10 = Excellent</span>
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Q4 — Happiness (Required) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>Are you happy with your team's performance?</span>
                    <span style={{ color: C.coral, fontWeight: 600, fontSize: 11 }}>Required</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {happinessOptions.map(opt => (
                      <button key={opt.value} className="happy-btn" onClick={() => update('satisfaction', opt.value)} style={{
                        background: form.satisfaction === opt.value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                        border: form.satisfaction === opt.value ? `1px solid ${opt.color}` : "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12, padding: "13px 16px",
                        color: form.satisfaction === opt.value ? opt.color : C.muted,
                        fontSize: 14, fontWeight: form.satisfaction === opt.value ? 600 : 400,
                        textAlign: "left",
                      }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Q5 — Comments (Optional) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>Extra comments</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", fontSize: 11 }}>Optional</span>
                  </label>
                  <textarea
                    placeholder="Anything else you'd like to share about your team?"
                    value={form.comments}
                    onChange={e => update('comments', e.target.value)}
                    rows={4}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
                      padding: "13px 16px", color: C.white, fontSize: 15,
                      resize: "vertical", fontFamily: "'DM Sans', sans-serif",
                      transition: "border 0.2s",
                    }}
                  />
                </div>

                {/* Honeypot - invisible to humans, bots fill this in */}
                <input
                  type="text"
                  name="honeypot"
                  value={form.honeypot || ""}
                  onChange={e => update('honeypot', e.target.value)}
                  style={{ display: "none" }}
                  tabIndex="-1"
                  autoComplete="off"
                />

                {/* Error */}
                {error && (
                  <div style={{
                    background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: 10, padding: "12px 16px", marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 13, color: C.coral }}>⚠️ {error}</span>
                  </div>
                )}

                {/* Submit */}
                <button className="submit-btn" onClick={handleSubmit} disabled={!canSubmit || loading} style={{
                  width: "100%",
                  background: canSubmit && !loading ? C.accent : "rgba(255,255,255,0.08)",
                  border: "none", borderRadius: 14, padding: "16px",
                  color: canSubmit && !loading ? "#000" : C.muted,
                  fontSize: 16, fontWeight: 700,
                  cursor: canSubmit && !loading ? "pointer" : "not-allowed",
                  transition: "all 0.2s", letterSpacing: "0.03em",
                }}>
                  {loading ? "Submitting..." : "Submit Your Vote ⚽"}
                </button>

                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 14 }}>
                  * Team, rating and happiness are required to submit
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}