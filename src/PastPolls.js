import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const C = {
  pitch1:   "#2D7A3A",
  pitch2:   "#276E34",
  line:     "rgba(255,255,255,0.25)",
  white:    "#FFFFFF",
  card:     "rgba(0,0,0,0.55)",
  muted:    "rgba(255,255,255,0.55)",
  accent:   "#F5C518",
  coral:    "#FF6B6B",
  mint:     "#6BCB77",
  sky:      "#4ECDC4",
  lavender: "#C77DFF",
  peach:    "#FF9A3C",
};

const COLORS = [C.mint, C.sky, C.accent, C.peach, C.coral, C.lavender];

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
      <circle cx={600} cy={400} r={5} fill={C.line} />
      <rect x={60} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={975} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={28} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      <rect x={1140} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      <rect x={0} y={0} width={1200} height={800} fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", fontSize: 13 }}>
      <div style={{ color: C.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color: C.accent }}>{payload[0].value}%</div>
    </div>
  );
  return null;
};

function Navbar({ isMobile }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      padding: isMobile ? "0 16px" : "0 40px",
      display: "flex", alignItems: "center",
      justifyContent: "space-between", height: 64,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <span style={{ fontSize: 28 }}>⚽</span>
        <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, letterSpacing: "0.1em", color: C.white }}>
          THE<span style={{ color: C.accent }}>FOOTPOLL</span>
        </span>
      </a>
      <a href="/" style={{
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 600,
        color: C.white, textDecoration: "none",
      }}>
        ← Back to Dashboard
      </a>
    </div>
  );
}

// Read-only question result card
function QuestionResult({ question, index, isMobile }) {
  const chartData = question.results.map((r, i) => ({
    name: r.option,
    value: r.percentage,
    color: COLORS[i % COLORS.length],
  }));

  const topAnswer = [...question.results].sort((a, b) => b.count - a.count)[0];

  return (
    <div style={{
      background: C.card, backdropFilter: "blur(12px)",
      borderRadius: 16, padding: isMobile ? "16px" : "24px",
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      marginBottom: 16,
    }}>
      {/* Question title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16 }}>
        <div style={{
          minWidth: 24, height: 24, borderRadius: "50%",
          background: C.accent, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 700,
          color: "#000", flexShrink: 0, marginTop: 1,
        }}>
          {index + 1}
        </div>
        <span style={{ fontSize: isMobile ? 13 : 15, color: C.white, fontWeight: 600, lineHeight: 1.5 }}>
          {question.question_text}
        </span>
      </div>

      {/* Top answer badge */}
      {topAnswer && topAnswer.count > 0 && (
        <div style={{
          background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)",
          borderRadius: 10, padding: "8px 14px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 12, color: C.muted }}>Top answer:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{topAnswer.option}</span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: "auto" }}>{topAnswer.count} votes</span>
        </div>
      )}

      {question.total_answers === 0 ? (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "12px 0" }}>No responses</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={isMobile ? 130 : 160}>
            <BarChart data={chartData} barSize={24} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {question.results.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{r.option}</span>
                <div style={{ width: 60, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                  <div style={{ width: `${r.percentage}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: COLORS[i % COLORS.length], minWidth: 32, textAlign: "right" }}>
                  {r.percentage}%
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>
            {question.total_answers} total responses
          </div>
        </>
      )}
    </div>
  );
}

export default function PastPolls() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [surveys, setSurveys]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load all past surveys on mount
  useEffect(() => {
    fetch('/api/past-polls')
      .then(res => res.json())
      .then(data => {
        setSurveys(data.surveys || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load results when a survey is selected
  const selectSurvey = (surveyId) => {
    setSelected(surveyId);
    setLoadingResults(true);
    setResults(null);
    fetch(`/api/past-polls?surveyId=${surveyId}`)
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoadingResults(false);
      })
      .catch(() => setLoadingResults(false));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .survey-card:hover { border-color: rgba(245,197,24,0.4) !important; transform: translateY(-2px); }
      `}</style>

      <PitchBackground />

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Navbar isMobile={isMobile} />

        <div style={{ padding: isMobile ? "24px 16px" : "32px 40px", maxWidth: 800, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: isMobile ? 24 : 32, letterSpacing: "0.08em", color: C.white }}>
              📊 PAST POLLS
            </h2>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
              Browse results from previous surveys
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", color: C.muted, padding: "60px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⚽</div>
              Loading past polls...
            </div>
          )}

          {/* No past surveys */}
          {!loading && surveys.length === 0 && !selected && (
            <div style={{
              background: C.card, backdropFilter: "blur(12px)",
              borderRadius: 16, padding: "40px", textAlign: "center",
              border: "1px solid rgba(255,255,255,0.12)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p style={{ color: C.muted, fontSize: 15 }}>No past polls yet — check back after the current survey closes!</p>
            </div>
          )}

          {/* Survey list */}
          {!loading && !selected && surveys.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {surveys.map(s => (
                <button key={s.id} className="survey-card" onClick={() => selectSurvey(s.id)} style={{
                  background: C.card, backdropFilter: "blur(12px)",
                  borderRadius: 16, padding: "20px 24px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "rgba(245,197,24,0.12)",
                      border: "1px solid rgba(245,197,24,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 22, flexShrink: 0,
                    }}>📋</div>
                    <div>
                      <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: C.white, marginBottom: 4 }}>
                        {s.title}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>
                        {s.month} {s.year} · {s.totalResponses} responses
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 18, color: C.accent }}>→</span>
                </button>
              ))}
            </div>
          )}

          {/* Selected survey results */}
          {selected && (
            <div>
              {/* Back button */}
              <button onClick={() => { setSelected(null); setResults(null); }} style={{
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10, padding: "10px 16px", color: C.white,
                fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 24,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                ← Back to Past Polls
              </button>

              {/* Loading results */}
              {loadingResults && (
                <div style={{ textAlign: "center", color: C.muted, padding: "60px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>⚽</div>
                  Loading results...
                </div>
              )}

              {/* Results */}
              {!loadingResults && results && (
                <>
                  {/* Survey header */}
                  <div style={{
                    background: C.card, backdropFilter: "blur(12px)",
                    borderRadius: 16, padding: "20px 24px", marginBottom: 20,
                    border: "1px solid rgba(245,197,24,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexWrap: "wrap", gap: 12,
                  }}>
                    <div>
                      <h3 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: isMobile ? 18 : 22, letterSpacing: "0.05em", color: C.white }}>
                        {results.survey.title}
                      </h3>
                      <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                        {results.survey.month} {results.survey.year}
                      </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, color: C.accent, lineHeight: 1 }}>
                        {results.totalResponses}
                      </div>
                      <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Total Responses
                      </div>
                    </div>
                  </div>

                  {/* Question results */}
                  {results.questions.map((q, i) => (
                    <QuestionResult key={q.id} question={q} index={i} isMobile={isMobile} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}