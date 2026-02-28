import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const C = {
  pitch1:   "#2D7A3A",
  pitch2:   "#276E34",
  line:     "rgba(255,255,255,0.25)",
  white:    "#FFFFFF",
  card:     "rgba(0,0,0,0.55)",
  cardHover:"rgba(0,0,0,0.65)",
  text:     "#FFFFFF",
  muted:    "rgba(255,255,255,0.55)",
  accent:   "#F5C518",
  coral:    "#FF6B6B",
  mint:     "#6BCB77",
  sky:      "#4ECDC4",
  lavender: "#C77DFF",
  peach:    "#FF9A3C",
};

const mockData = {
  kpi: { label: "Total Responses", value: "2,481", color: C.accent },
  satisfaction: [
    { name: "Very Happy",   value: 38, color: C.mint },
    { name: "Happy",        value: 34, color: C.sky },
    { name: "Neutral",      value: 16, color: C.accent },
    { name: "Unhappy",      value: 8,  color: C.peach },
    { name: "Very Unhappy", value: 4,  color: C.coral },
  ],
  monthly: [
    { month: "Aug", score: 72 }, { month: "Sep", score: 76 },
    { month: "Oct", score: 73 }, { month: "Nov", score: 79 },
    { month: "Dec", score: 83 }, { month: "Jan", score: 85 },
    { month: "Feb", score: 87 },
  ],
  categories: [
    { name: "Attack",    score: 88, color: C.coral },
    { name: "Defence",   score: 79, color: C.sky },
    { name: "Midfield",  score: 65, color: C.accent },
    { name: "Stamina",   score: 92, color: C.mint },
    { name: "Teamwork",  score: 84, color: C.lavender },
    { name: "Tactics",   score: 71, color: C.peach },
  ],
};

// ── Football Pitch SVG Background ──────────────────────────────
function PitchBackground() {
  return (
    <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
      {/* Alternating grass stripes */}
      {[...Array(12)].map((_, i) => (
        <rect key={i} x={i * 100} y={0} width={100} height={800}
          fill={i % 2 === 0 ? C.pitch1 : C.pitch2} />
      ))}

      {/* Outer boundary */}
      <rect x={60} y={40} width={1080} height={720} fill="none" stroke={C.line} strokeWidth={3} />

      {/* Halfway line */}
      <line x1={600} y1={40} x2={600} y2={760} stroke={C.line} strokeWidth={2.5} />

      {/* Centre circle */}
      <circle cx={600} cy={400} r={90} fill="none" stroke={C.line} strokeWidth={2.5} />
      <circle cx={600} cy={400} r={5} fill={C.line} />

      {/* Centre spot */}
      <circle cx={600} cy={400} r={4} fill="rgba(255,255,255,0.4)" />

      {/* Left penalty box */}
      <rect x={60} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      {/* Left 6-yard box */}
      <rect x={60} y={330} width={55} height={140} fill="none" stroke={C.line} strokeWidth={2} />
      {/* Left penalty spot */}
      <circle cx={170} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      {/* Left penalty arc */}
      <path d="M 225 340 A 90 90 0 0 1 225 460" fill="none" stroke={C.line} strokeWidth={2} />

      {/* Right penalty box */}
      <rect x={975} y={240} width={165} height={320} fill="none" stroke={C.line} strokeWidth={2.5} />
      {/* Right 6-yard box */}
      <rect x={1085} y={330} width={55} height={140} fill="none" stroke={C.line} strokeWidth={2} />
      {/* Right penalty spot */}
      <circle cx={1030} cy={400} r={4} fill="rgba(255,255,255,0.4)" />
      {/* Right penalty arc */}
      <path d="M 975 340 A 90 90 0 0 0 975 460" fill="none" stroke={C.line} strokeWidth={2} />

      {/* Corner arcs */}
      <path d="M 60 68 A 22 22 0 0 1 82 40"   fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 1118 40 A 22 22 0 0 1 1140 68" fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 60 732 A 22 22 0 0 0 82 760"  fill="none" stroke={C.line} strokeWidth={2} />
      <path d="M 1118 760 A 22 22 0 0 0 1140 732" fill="none" stroke={C.line} strokeWidth={2} />

      {/* Goals */}
      <rect x={28} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      <rect x={1140} y={352} width={32} height={96} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />

      {/* Dark overlay for readability */}
      <rect x={0} y={0} width={1200} height={800} fill="rgba(0,0,0,0.35)" />
    </svg>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", fontSize: 13 }}>
      <div style={{ color: C.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, color: C.accent }}>{payload[0].value}{typeof payload[0].value === "number" && payload[0].value < 200 ? "%" : ""}</div>
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
        <div style={{ fontFamily: "Bebas Neue, Impact, sans-serif", fontSize: 20, letterSpacing: "0.05em", color: C.white, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 18, background: C.accent, borderRadius: 2 }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

const navItems = ["Overview", "Satisfaction", "Trends", "Categories"];

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [kpiVisible, setKpiVisible] = useState(false);
  useEffect(() => { setTimeout(() => setKpiVisible(true), 200); }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-btn { transition: all 0.2s; cursor: pointer; border: none; background: none; }
        .nav-btn:hover { color: ${C.accent} !important; }
        .cat-row { transition: transform 0.15s; }
        .cat-row:hover { transform: translateX(4px); }
      `}</style>

      <PitchBackground />

      {/* Everything above pitch */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Top Nav */}
        <div style={{
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          padding: "0 40px", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 64,
          position: "sticky", top: 0, zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>⚽</span>
            <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 24, letterSpacing: "0.1em", color: C.white }}>
              FOOT<span style={{ color: C.accent }}>POLL</span>
            </span>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: 4 }}>
            {navItems.map(item => (
              <button key={item} className="nav-btn" onClick={() => setActive(item)} style={{
                padding: "8px 20px", borderRadius: 20, fontSize: 14, fontWeight: 500,
                color: active === item ? C.accent : C.muted,
                background: active === item ? "rgba(245,197,24,0.12)" : "none",
                border: active === item ? `1px solid rgba(245,197,24,0.3)` : "1px solid transparent",
              }}>
                {item}
              </button>
            ))}
          </div>

          {/* Live badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.mint, boxShadow: `0 0 8px ${C.mint}`, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 13, color: C.muted }}>Live · Feb 2026</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

          {/* Page heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 52, letterSpacing: "0.05em", color: C.white, lineHeight: 1, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
              {active === "Overview"     && "MATCH OVERVIEW"}
              {active === "Satisfaction" && "FAN SATISFACTION"}
              {active === "Trends"       && "SEASON TRENDS"}
              {active === "Categories"   && "PERFORMANCE RATINGS"}
            </h1>
            <p style={{ color: C.muted, marginTop: 6, fontSize: 14 }}>Football Survey Dashboard · Mock Data 2026</p>
          </div>

          {/* OVERVIEW */}
          {active === "Overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* KPI Card */}
              <div style={{ display: "flex" }}>
                <div style={{
                  background: C.card, backdropFilter: "blur(12px)",
                  borderRadius: 20, padding: "24px 36px",
                  border: `1px solid rgba(245,197,24,0.3)`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(245,197,24,0.1)`,
                  opacity: kpiVisible ? 1 : 0,
                  transform: kpiVisible ? "translateY(0)" : "translateY(20px)",
                  transition: "opacity 0.6s ease, transform 0.6s ease",
                }}>
                  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                    {mockData.kpi.label}
                  </div>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 56, color: C.accent, lineHeight: 1, letterSpacing: "0.03em" }}>
                    {mockData.kpi.value}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
                {/* Line chart */}
                <Card title="Season Satisfaction Score">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={mockData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="score" stroke={C.accent} strokeWidth={3}
                        dot={{ fill: C.accent, r: 5, strokeWidth: 0 }}
                        activeDot={{ r: 7, fill: C.accent, stroke: "#000", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {/* Pie chart */}
                <Card title="Fan Sentiment">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={mockData.satisfaction} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                        {mockData.satisfaction.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", marginTop: 8 }}>
                    {mockData.satisfaction.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                        <span style={{ fontSize: 11, color: C.muted }}>{s.name} <strong style={{ color: C.white }}>{s.value}%</strong></span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* SATISFACTION */}
          {active === "Satisfaction" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card title="Sentiment Distribution">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={mockData.satisfaction} dataKey="value" cx="50%" cy="50%" outerRadius={110} paddingAngle={4}
                      label={({ name, value }) => `${value}%`} labelLine={{ stroke: "rgba(255,255,255,0.3)" }}>
                      {mockData.satisfaction.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Score Breakdown">
                {mockData.satisfaction.map((s, i) => (
                  <div key={i} style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{s.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}%</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                      <div style={{ width: `${s.value * 2}%`, height: "100%", background: s.color, borderRadius: 99, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* TRENDS */}
          {active === "Trends" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Card title="Monthly Satisfaction Score">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 13 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: C.muted, fontSize: 13 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke={C.accent} strokeWidth={4}
                      dot={{ fill: C.accent, r: 6, strokeWidth: 0 }}
                      activeDot={{ r: 9, fill: C.accent, stroke: "#000", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Best Month",  value: "Feb · 87%", color: C.mint },
                  { label: "Worst Month", value: "Aug · 72%", color: C.coral },
                  { label: "Total Growth",value: "+15 pts",   color: C.sky },
                  { label: "Avg Score",   value: "79.3%",     color: C.lavender },
                ].map((s, i) => (
                  <div key={i} style={{
                    flex: 1, background: C.card, backdropFilter: "blur(12px)",
                    borderRadius: 16, padding: "18px 20px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderLeft: `4px solid ${s.color}`,
                  }}>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 28, letterSpacing: "0.05em", color: C.white }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {active === "Categories" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
              <Card title="Performance by Category">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={mockData.categories} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {mockData.categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Rankings">
                {[...mockData.categories].sort((a, b) => b.score - a.score).map((c, i) => (
                  <div key={i} className="cat-row" style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "11px 0", borderBottom: i < mockData.categories.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: "rgba(255,255,255,0.15)", minWidth: 28 }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color }} />
                      <span style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{c.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 60, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                        <div style={{ width: `${c.score}%`, height: "100%", background: c.color, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: c.color, minWidth: 36, textAlign: "right" }}>{c.score}%</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}