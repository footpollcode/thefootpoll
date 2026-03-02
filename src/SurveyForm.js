import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Survey data from API
  const [survey, setSurvey]       = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Form state
  const [fan_name,  setFanName]      = useState("");
  const [team,      setTeam]         = useState("");
  const [answers,   setAnswers]      = useState({});
  const [honeypot,  setHoneypot]     = useState("");
  const [submitted, setSubmitted]    = useState(false);
  const [loading,   setLoading]      = useState(false);
  const [error,     setError]        = useState(null);

  // Fetch active survey + questions from API
  useEffect(() => {
    fetch('/api/survey')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setLoadError(data.error);
        } else {
          setSurvey(data.survey);
          setQuestions(data.questions);
        }
        setLoadingData(false);
      })
      .catch(() => {
        setLoadError('Could not load survey. Please try again later.');
        setLoadingData(false);
      });
  }, []);

  const selectAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // All questions must be answered + team selected
  const answeredCount = Object.keys(answers).length;
  const canSubmit = team && answeredCount === questions.length && !honeypot;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await executeRecaptcha('survey_submit');

      // Build answers array from state
      const answersArray = Object.entries(answers).map(([question_id, answer]) => ({
        question_id,
        answer,
      }));

      const res = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          survey_id: survey.id,
          fan_name,
          team,
          answers: answersArray,
          honeypot,
          recaptchaToken: token,
        }),
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

  const resetForm = () => {
    setSubmitted(false);
    setFanName("");
    setTeam("");
    setAnswers({});
    setHoneypot("");
    setError(null);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input { outline: none; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(245,197,24,0.6) !important; }
        .team-btn { transition: all 0.2s; cursor: pointer; }
        .team-btn:hover { border-color: rgba(245,197,24,0.5) !important; color: rgba(245,197,24,0.8) !important; }
        .option-btn { transition: all 0.2s; cursor: pointer; }
        .option-btn:hover { transform: translateX(4px); border-color: rgba(245,197,24,0.4) !important; }
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
              THE<span style={{ color: C.accent }}>FOOTPOLL</span>
            </span>
          </div>
          <span style={{ fontSize: 13, color: C.muted }}>
            {survey ? `${survey.month} ${survey.year} Survey` : "Fan Survey"}
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <div style={{ width: "100%", maxWidth: 600 }}>

            {/* LOADING STATE */}
            {loadingData && (
              <div style={{ textAlign: "center", color: C.muted, fontSize: 16 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
                Loading survey...
              </div>
            )}

            {/* LOAD ERROR */}
            {loadError && (
              <div style={{
                background: C.card, backdropFilter: "blur(12px)",
                borderRadius: 24, padding: "40px", textAlign: "center",
                border: "1px solid rgba(255,107,107,0.3)",
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
                <p style={{ color: C.coral, fontSize: 16 }}>{loadError}</p>
              </div>
            )}

            {/* SUCCESS SCREEN */}
            {!loadingData && !loadError && submitted && (
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
                  Your response for the <strong style={{ color: C.white }}>{survey?.title}</strong> has been recorded!
                </p>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={resetForm} style={{
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
            )}

            {/* SURVEY FORM */}
            {!loadingData && !loadError && !submitted && survey && (
              <div style={{
                background: C.card, backdropFilter: "blur(12px)",
                borderRadius: 24, padding: "40px",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
              }}>

                {/* Header */}
                <div style={{ marginBottom: 32, textAlign: "center" }}>
                  <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 32, letterSpacing: "0.05em", color: C.white, marginBottom: 6 }}>
                    {survey.title}
                  </h1>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.mint }} />
                    <span style={{ color: C.muted, fontSize: 13 }}>
                      {answeredCount} of {questions.length} questions answered
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, marginTop: 12 }}>
                    <div style={{
                      width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : "0%",
                      height: "100%", background: C.accent, borderRadius: 99,
                      transition: "width 0.4s ease"
                    }} />
                  </div>
                </div>

                {/* Q0 — Name (Optional) */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span>What's your name?</span>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", fontSize: 11 }}>Optional</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Smith"
                    value={fan_name}
                    onChange={e => setFanName(e.target.value)}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12,
                      padding: "13px 16px", color: C.white, fontSize: 15,
                      transition: "border 0.2s",
                    }}
                  />
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Team selector */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 12, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span>Football team you support</span>
                    <span style={{ color: C.coral, fontWeight: 600, fontSize: 11 }}>Required</span>
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {teams.map(t => (
                      <button key={t} className="team-btn" onClick={() => setTeam(t)} style={{
                        background: team === t ? "rgba(245,197,24,0.15)" : "rgba(255,255,255,0.05)",
                        border: team === t ? `1px solid ${C.accent}` : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 20, padding: "7px 15px",
                        color: team === t ? C.accent : C.muted,
                        fontSize: 13, fontWeight: team === t ? 600 : 400,
                      }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 28 }} />

                {/* Dynamic Questions from Database */}
                {questions.map((q, index) => (
                  <div key={q.id}>
                    <div style={{ marginBottom: 24 }}>
                      {/* Question header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                          <div style={{
                            minWidth: 24, height: 24, borderRadius: "50%",
                            background: answers[q.id] ? C.accent : "rgba(255,255,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700,
                            color: answers[q.id] ? "#000" : C.muted,
                            transition: "all 0.3s", marginTop: 1,
                          }}>
                            {answers[q.id] ? "✓" : index + 1}
                          </div>
                          <label style={{ fontSize: 14, color: C.white, fontWeight: 500, lineHeight: 1.5 }}>
                            {q.question_text}
                          </label>
                        </div>
                        <span style={{ color: C.coral, fontWeight: 600, fontSize: 11, marginLeft: 12, whiteSpace: "nowrap" }}>Required</span>
                      </div>

                      {/* Answer options */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 34 }}>
                        {q.options.map((option, i) => (
                          <button key={i} className="option-btn" onClick={() => selectAnswer(q.id, option)} style={{
                            background: answers[q.id] === option ? "rgba(245,197,24,0.12)" : "rgba(255,255,255,0.03)",
                            border: answers[q.id] === option ? `1px solid ${C.accent}` : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10, padding: "11px 16px",
                            color: answers[q.id] === option ? C.accent : C.muted,
                            fontSize: 14, fontWeight: answers[q.id] === option ? 600 : 400,
                            textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                          }}>
                            <div style={{
                              width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                              border: answers[q.id] === option ? `2px solid ${C.accent}` : "2px solid rgba(255,255,255,0.2)",
                              background: answers[q.id] === option ? C.accent : "transparent",
                              transition: "all 0.2s",
                            }} />
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Divider between questions */}
                    {index < questions.length - 1 && (
                      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 24 }} />
                    )}
                  </div>
                ))}

                {/* Honeypot */}
                <input
                  type="text"
                  name="honeypot"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  style={{ display: "none" }}
                  tabIndex="-1"
                  autoComplete="off"
                />

                {/* Error */}
                {error && (
                  <div style={{
                    background: "rgba(255,107,107,0.12)", border: "1px solid rgba(255,107,107,0.3)",
                    borderRadius: 10, padding: "12px 16px", marginBottom: 16, marginTop: 16,
                  }}>
                    <span style={{ fontSize: 13, color: C.coral }}>⚠️ {error}</span>
                  </div>
                )}

                {/* Submit */}
                <div style={{ marginTop: 28 }}>
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
                  <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>
                    * Team and all questions are required to submit
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}