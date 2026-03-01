export default function handler(req, res) {
  res.status(200).json({
    totalResponses: 2481,
    avgSatisfaction: 87,
    completionRate: 91,
    avgResponseTime: "4.2m",
    lastUpdated: "March 2026"
  });
}