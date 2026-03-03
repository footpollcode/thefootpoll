import SurveyForm from './SurveyForm';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const C = {
  pitch1:   "#2D7A3A",
  pitch2:   "#276E34",
  line:     "rgba(255,255,255,0.25)",
  white:    "#FFFFFF",
  card:     "rgba(0,0,0,0.55)",
  text:     "#FFFFFF",
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
      <circle cx={600} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      <rect x={60} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={60} y={330} width={55} height={140} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={170} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      <path d="M 225 340 A 90 90 0 0 1 225 460" fill="none" stroke={C.line} strokeWidth={2} />
      <rect x={975} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      <rect x={1085} y={330} width={55} height={140} fill="none" stroke={C.line} strokeWidth={2} />
      <circle cx={1030} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      <path d="M 975 340 A 90 90 0 0 0 975 460" fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 60 68 A 22 22 0 0 1 82 40" fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 1118 40 A 22 22 0 0 1 1140 68" fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 60 732 A 22 22 0 0 0 82 760" fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 1118 760 A 22 22 0 0 0 1140 732" fill="none" stroke={C.line} strokeWidth={2} />
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

function Card({ children, title, style = {} }) {
  return (
    <div style={{
      background: C.card, backdropFilter: "blur(12px)",
      borderRadius: 20, padding: 24,
      border: "1px solid rgba(255,255,255,0.12)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      ...style
    }}>
      {title && (
        <div style={{ fontFamily: "Bebas Neue, Impact, sans-serif", fontSize: 18, letterSpacing: "0.05em", color: C.white, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: C.accent, borderRadius: 2, flexShrink: 0 }} />
          <span>{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

// Individual question chart card
function QuestionCard({ question, index, isMobile }) {
  const chartData = question.results.map((r, i) => ({
    name: r.option,
    value: r.percentage,
    count: r.count,
    color: COLORS[i % COLORS.length],
  }));

  const topAnswer = [...question.results].sort((a, b) => b.count - a.count)[0];

  return (
    <Card title={`Q${index + 1}. ${question.question_text}`}>
      {/* Top answer badge */}
      {topAnswer && topAnswer.count > 0 && (
        <div style={{
          background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)",
          borderRadius: 10, padding: "8px 14px", marginBottom: 18,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 13, color: C.muted }}>Top answer:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{topAnswer.option}</span>
          <span style={{ fontSize: 12, color: C.muted, marginLeft: "auto" }}>{topAnswer.count} votes</span>
        </div>
      )}

      {question.total_answers === 0 ? (
        <div style={{ textAlign: "center", color: C.muted, fontSize: 14, padding: "20px 0" }}>
          No responses yet
        </div>
      ) : (
        <>
          {/* Bar chart */}
          <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
            <BarChart data={chartData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Percentage breakdown */}
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {question.results.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.muted, flex: 1 }}>{r.option}</span>
                <div style={{ width: 80, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                  <div style={{ width: `${r.percentage}%`, height: "100%", background: COLORS[i % COLORS.length], borderRadius: 99, transition: "width 1s ease" }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS[i % COLORS.length], minWidth: 36, textAlign: "right" }}>
                  {r.percentage}%
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>
            {question.total_answers} total responses
          </div>
        </>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const [active, setActive]       = useState("Overview");
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [kpiVisible, setKpiVisible] = useState(false);
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(null);
  const [surveyOpen, setSurveyOpen] = useState(true);
  const [menuOpen, setMenuOpen]     = useState(false);

  // Fetch live results from /api/results
  useEffect(() => {
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Results API error:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setTimeout(() => setKpiVisible(true), 200);
  }, []);

  // Countdown timer — updates every second
  useEffect(() => {
    if (!results?.survey?.closes_at) return;

    const tick = () => {
      const now = new Date();
      const closes = new Date(results.survey.closes_at);
      const opens = new Date(results.survey.opens_at);
      const diff = closes - now;

      if (now < opens) {
        setSurveyOpen(false);
        setTimeLeft(null);
        return;
      }

      if (diff <= 0) {
        setSurveyOpen(false);
        setTimeLeft(null);
        return;
      }

      setSurveyOpen(true);
      const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [results]);

      if (window.location.pathname === '/survey') {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
      <SurveyForm />
    </GoogleReCaptchaProvider>
  );
}

  // Survey title shown in nav
  const surveyTitle = results?.survey
    ? `${results.survey.month} ${results.survey.year}`
    : "Dashboard";

  const navItems = isMobile ? ["Overview"] : ["Overview", ...( results?.questions?.map((q, i) => `Q${i + 1}`) || [] )];

  // Build pie data for overview from Q3 (happiness question - index 2)
  const sentimentQuestion = results?.questions?.[2];
  const pieData = sentimentQuestion?.results?.map((r, i) => ({
    name: r.option,
    value: r.percentage,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-btn { transition: all 0.2s; cursor: pointer; border: none; background: none; }
        .nav-btn:hover { color: ${C.accent} !important; }
      `}</style>

      <PitchBackground />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Top Nav */}
        <div style={{
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          {isMobile ? (
            /* ── MOBILE NAVBAR ── */
            <div>
              <div style={{ padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

                {/* Left — Hamburger menu */}
                <button onClick={() => setMenuOpen(o => !o)} style={{
                  background: "none", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8, padding: "8px 10px", cursor: "pointer",
                  display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
                }}>
                  <div style={{ width: 18, height: 2, background: menuOpen ? C.accent : C.white, borderRadius: 2, transition: "all 0.2s" }} />
                  <div style={{ width: 18, height: 2, background: menuOpen ? C.accent : C.white, borderRadius: 2, transition: "all 0.2s" }} />
                  <div style={{ width: 18, height: 2, background: menuOpen ? C.accent : C.white, borderRadius: 2, transition: "all 0.2s" }} />
                </button>

                {/* Center — Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                  <span style={{ fontSize: 22 }}>⚽</span>
                  <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, letterSpacing: "0.1em", color: C.white }}>
                    THE<span style={{ color: C.accent }}>FOOTPOLL</span>
                  </span>
                </div>

                {/* Right — Survey button */}
                {surveyOpen ? (
                  <a href="/survey" style={{
                    background: C.accent, borderRadius: 20,
                    padding: "8px 14px", fontSize: 13, fontWeight: 700,
                    color: "#000", textDecoration: "none",
                    display: "inline-flex", alignItems: "center",
                  }}>⚽</a>
                ) : (
                  <div style={{
                    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 20, padding: "8px 14px", fontSize: 13,
                    color: C.muted, cursor: "not-allowed",
                  }}>🔒</div>
                )}
              </div>

              {/* Dropdown menu */}
              {menuOpen && (
                <div style={{
                  background: "rgba(0,0,0,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)",
                  padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4,
                }}>
                  <button onClick={() => { setActive("Overview"); setMenuOpen(false); }} style={{
                    background: active === "Overview" ? "rgba(245,197,24,0.12)" : "none",
                    border: active === "Overview" ? `1px solid rgba(245,197,24,0.3)` : "1px solid transparent",
                    borderRadius: 10, padding: "12px 16px", color: active === "Overview" ? C.accent : C.white,
                    fontSize: 14, fontWeight: 500, textAlign: "left", cursor: "pointer",
                  }}>
                    🏠 Overview
                  </button>
                  {results?.questions?.map((q, i) => (
                    <button key={q.id} onClick={() => { setActive(`Q${i + 1}`); setMenuOpen(false); }} style={{
                      background: active === `Q${i + 1}` ? "rgba(245,197,24,0.12)" : "none",
                      border: active === `Q${i + 1}` ? `1px solid rgba(245,197,24,0.3)` : "1px solid transparent",
                      borderRadius: 10, padding: "12px 16px",
                      color: active === `Q${i + 1}` ? C.accent : C.muted,
                      fontSize: 13, fontWeight: 500, textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", background: active === `Q${i+1}` ? C.accent : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: active === `Q${i+1}` ? "#000" : C.muted, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      {q.question_text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── DESKTOP NAVBAR ── */
            <div style={{ padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>⚽</span>
                <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, letterSpacing: "0.1em", color: C.white }}>
                  THE<span style={{ color: C.accent }}>FOOTPOLL</span>
                </span>
              </div>

              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {navItems.map(item => (
                  <button key={item} className="nav-btn" onClick={() => setActive(item)} style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500,
                    color: active === item ? C.accent : C.muted,
                    background: active === item ? "rgba(245,197,24,0.12)" : "none",
                    border: active === item ? `1px solid rgba(245,197,24,0.3)` : "1px solid transparent",
                  }}>
                    {item}
                  </button>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
                  {timeLeft && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 20, padding: "7px 14px",
                    }}>
                      <span style={{ fontSize: 13, color: C.muted }}>🕐</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.white, fontFamily: "Bebas Neue, sans-serif", letterSpacing: "0.05em" }}>
                        {timeLeft.days}d {String(timeLeft.hours).padStart(2,"0")}h {String(timeLeft.minutes).padStart(2,"0")}m {String(timeLeft.seconds).padStart(2,"0")}s
                      </span>
                      <span style={{ fontSize: 11, color: C.muted }}>left</span>
                    </div>
                  )}
                  {surveyOpen ? (
                    <a href="/survey" style={{
                      background: C.accent, borderRadius: 20,
                      padding: "8px 20px", fontSize: 14, fontWeight: 700,
                      color: "#000", textDecoration: "none",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}>⚽ Take Survey</a>
                  ) : (
                    <div style={{
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 20, padding: "8px 20px", fontSize: 13, fontWeight: 600,
                      color: C.muted, cursor: "not-allowed",
                      display: "inline-flex", alignItems: "center", gap: 6,
                    }}>🔒 Survey Closed</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div style={{ padding: isMobile ? "20px 16px" : "32px 40px", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* Page title - centered */}
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: isMobile ? 20 : 28, letterSpacing: "0.08em", color: C.white }}>
              {active === "Overview" && "FOOTBALL STATUS OVERVIEW"}
              {active !== "Overview" && `QUESTION ${active.replace("Q", "")} RESULTS`}
            </h2>
            <p style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>
              {results?.survey?.title || "Loading..."} · {results?.totalResponses || 0} total responses
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              paddingTop: "150px",
            }}>
              <style>{`
                @keyframes bounce {
                  from { transform: translateY(0px); }
                  to   { transform: translateY(-12px); }
                }
              `}</style>
              <div style={{ fontSize: 36, animation: "bounce 0.9s infinite alternate", marginBottom: 48 }}>⚽</div>
              <span style={{ fontSize: 14, color: C.muted, fontWeight: 500 }}>Loading results...</span>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {!loading && active === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>

              {/* Total Responses KPI */}
              <div style={{
                background: C.card, backdropFilter: "blur(12px)",
                borderRadius: 20, padding: "32px 24px",
                border: `1px solid rgba(245,197,24,0.3)`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
                opacity: kpiVisible ? 1 : 0,
                transform: kpiVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
                width: "100%", maxWidth: 480,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
                  Total Responses
                </div>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: isMobile ? 56 : 72, color: C.accent, lineHeight: 1, letterSpacing: "0.03em" }}>
                  {results ? results.totalResponses.toLocaleString() : "..."}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
                  {surveyTitle} Survey
                </div>
              </div>

              {/* Sentiment pie — uses Q3 happiness question */}
              {sentimentQuestion && (
                <Card
                  title={sentimentQuestion.question_text}
                  style={{ width: "100%", maxWidth: 480 }}
                >
                  {pieData.every(d => d.value === 0) ? (
                    <div style={{ textAlign: "center", color: C.muted, fontSize: 14, padding: "20px 0" }}>No responses yet</div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                            {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "center", marginTop: 12 }}>
                        {pieData.map((s, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                            <span style={{ fontSize: 12, color: C.muted }}>{s.name} <strong style={{ color: C.white }}>{s.value}%</strong></span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Mobile Q selector — shown only on mobile */}
          {!loading && isMobile && active === "Overview" && results?.questions && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>Tap a question to see results:</p>
              {results.questions.map((q, i) => (
                <button key={q.id} onClick={() => setActive(`Q${i + 1}`)} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, padding: "14px 16px", color: C.white,
                  fontSize: 13, fontWeight: 500, textAlign: "left", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#000", flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  {q.question_text}
                </button>
              ))}
            </div>
          )}

          {/* Back button on mobile question view */}
          {isMobile && active !== "Overview" && (
            <button onClick={() => setActive("Overview")} style={{
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "10px 16px", color: C.white,
              fontSize: 13, fontWeight: 600, cursor: "pointer", alignSelf: "flex-start",
            }}>
              ← Back
            </button>
          )}

          {/* INDIVIDUAL QUESTION TABS */}
          {!loading && active !== "Overview" && results?.questions && (() => {
            const qIndex = parseInt(active.replace("Q", "")) - 1;
            const question = results.questions[qIndex];
            if (!question) return null;
            return (
              <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
                <QuestionCard question={question} index={qIndex} isMobile={isMobile} />
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}