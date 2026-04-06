import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsApi } from '../services/jobsApi';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const result = await jobsApi.getAnalytics();
        setData(result);
      } catch (error) {
        console.error("Failed to load analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const CHART_COLORS: Record<string, string> = {
    wishlist: '#e9a820',
    applied: '#264653',
    interviewing: '#7c5cbf',
    offer: '#2a9d8f',
    rejected: '#e8634a',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--color-coral)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const statusData = data?.status_counts ? Object.entries(data.status_counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    originalName: name
  })) : [];

  const weeklyData = data?.applications_over_time ? data.applications_over_time.map((item: any) => ({
    week: `Week of ${new Date(item.week).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    count: item.count
  })) : [];

  const stats = [
    { label: 'Total Applications', value: data?.total || 0, accent: 'var(--color-coral)' },
    { label: 'Active Interviews', value: data?.status_counts?.interviewing || 0, accent: 'var(--color-violet)' },
    { label: 'Offers Received', value: data?.status_counts?.offer || 0, accent: 'var(--color-teal)' },
    { label: 'Avg Match Score', value: `${data?.average_match_score ? Math.round(data.average_match_score) : 0}%`, accent: 'var(--color-navy)' },
  ];

  // Upcoming interviews
  const upcomingInterviews = data?.upcoming_interviews || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-black" style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
            Welcome back, <span style={{ color: 'var(--color-coral)' }}>{user?.first_name}</span> 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-slate)' }}>
            Here's your job search overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/jobs" className="studio-btn primary text-sm">
            <span>+</span> Add Job
          </Link>
          <Link to="/kanban" className="studio-btn secondary text-sm">
            Kanban Board →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.06}s` }}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value mt-2">{stat.value}</div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: stat.accent }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="data-panel">
          <div className="panel-header">Application Pipeline</div>
          <div className="p-6">
            {statusData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" labelLine={false}
                      outerRadius={95} innerRadius={55} dataKey="value" stroke="#fff" strokeWidth={2}
                      label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[entry.originalName] || '#8a8578'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} jobs`, 'Count']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-sand)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm" style={{ color: 'var(--color-stone)' }}>
                Not enough data yet
              </div>
            )}
          </div>
        </div>

        <div className="data-panel">
          <div className="panel-header">Application Velocity</div>
          <div className="p-6">
            {weeklyData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-sand)" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate)', fontSize: 12 }} dy={10} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-slate)', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: 'rgba(232,99,74,0.06)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-sand)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    <Bar dataKey="count" name="Applications" fill="var(--color-coral)" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-sm" style={{ color: 'var(--color-stone)' }}>
                Not enough data yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="data-panel">
        <div className="panel-header flex items-center justify-between">
          <span>Upcoming Interviews</span>
          <Link to="/kanban" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-coral)' }}>View Kanban →</Link>
        </div>
        <div className="p-6">
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {upcomingInterviews.map((interview: any) => (
                <div key={interview.id} className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--color-cream)', border: '1px solid var(--color-sand)' }}>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-ink)' }}>{interview.position}</p>
                    <p className="text-xs" style={{ color: 'var(--color-slate)' }}>{interview.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-violet)' }}>
                      {new Date(interview.interview_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-slate)' }}>
                      {new Date(interview.interview_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm" style={{ color: 'var(--color-stone)' }}>No upcoming interviews scheduled</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-stone)' }}>Drag a job to "Interviewing" on the Kanban board to schedule one</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
