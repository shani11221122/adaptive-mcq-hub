import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell,
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(var(--warning, 45 93% 47%))",
  "hsl(142 76% 36%)",
  "hsl(262 83% 58%)",
];

interface Props {
  subjectAccuracyData: { name: string; accuracy: number; attempts: number }[];
  dailyTrendData: { date: string; attempts: number; avgAccuracy: number }[];
  difficultyDistData: { name: string; value: number }[];
}

const AdminAnalyticsCharts = ({ subjectAccuracyData, dailyTrendData, difficultyDistData }: Props) => (
  <div className="space-y-5">
    <h2 className="text-base font-bold text-foreground">Analytics</h2>

    <div className="border border-border rounded-2xl p-4 bg-card">
      <h3 className="text-sm font-bold text-foreground mb-3">Accuracy by Subject</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={subjectAccuracyData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
              formatter={(value: number) => [`${value}%`, "Accuracy"]}
            />
            <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
              {subjectAccuracyData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {dailyTrendData.length > 1 && (
      <div className="border border-border rounded-2xl p-4 bg-card">
        <h3 className="text-sm font-bold text-foreground mb-3">Performance Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="avgAccuracy" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} name="Accuracy %" />
              <Line type="monotone" dataKey="attempts" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Attempts" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}

    <div className="border border-border rounded-2xl p-4 bg-card">
      <h3 className="text-sm font-bold text-foreground mb-3">Quiz Difficulty Distribution</h3>
      <div className="h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={difficultyDistData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              <Cell fill="hsl(142 76% 36%)" />
              <Cell fill="hsl(var(--warning, 45 93% 47%))" />
              <Cell fill="hsl(var(--destructive))" />
            </Pie>
            <Tooltip
              contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              formatter={(value: number) => [value, "Quizzes"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default AdminAnalyticsCharts;
