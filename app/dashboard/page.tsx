'use client';

import { useEffect, useRef } from 'react';
import { BarChart3, BookOpen, FileText, Video, TrendingUp } from 'lucide-react';
import Chart from 'chart.js/auto';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

const stats = [
  { label: 'Total Soal', value: '1,243', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { label: 'Total Modul', value: '48', icon: FileText, color: 'bg-green-100 text-green-600' },
  { label: 'Total Artikel', value: '156', icon: BarChart3, color: 'bg-purple-100 text-purple-600' },
  { label: 'Total Video', value: '89', icon: Video, color: 'bg-orange-100 text-orange-600' },
];

const LineChartComponent = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Users',
              data: [450, 680, 920, 1150, 1420, 1680],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1f2937',
                bodyColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.parsed.y} users`
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#f3f4f6'
                },
                ticks: {
                  color: '#9ca3af'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#9ca3af'
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef}></canvas>;
};

const BarChartComponent = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Soal TOEFL', 'Soal TOAFL', 'Vocabulary', 'Grammar', 'Reading'],
            datasets: [{
              label: 'Content',
              data: [745, 498, 312, 289, 234],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#8b5cf6',
                '#f59e0b',
                '#ef4444'
              ],
              borderRadius: 8,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1f2937',
                bodyColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#f3f4f6'
                },
                ticks: {
                  color: '#9ca3af'
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  color: '#9ca3af',
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef}></canvas>;
};

const DoughnutChartComponent = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Reading', 'Listening', 'Structure', 'Vocabulary'],
            datasets: [{
              data: [35, 28, 22, 15],
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#8b5cf6',
                '#f59e0b'
              ],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 15,
                  font: {
                    size: 12
                  },
                  color: '#4b5563',
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                backgroundColor: '#fff',
                titleColor: '#1f2937',
                bodyColor: '#6b7280',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.label}: ${context.parsed}%`
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return <canvas ref={chartRef}></canvas>;
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your learning platform overview.</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">User Growth</h2>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp size={16} />
              <span>+23.5%</span>
            </div>
          </div>
          <div className="h-[300px]">
            <LineChartComponent />
          </div>
        </div>

        {/* Content Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Content Distribution</h2>
          <div className="h-[300px]">
            <BarChartComponent />
          </div>
        </div>

        {/* Category Distribution Doughnut Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h2>
          <div className="h-[300px]">
            <DoughnutChartComponent />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { title: 'New question added', desc: 'TOEFL - Reading Comprehension', time: '2 hours ago' },
              { title: 'Article published', desc: 'Grammar Tips for Beginners', time: '5 hours ago' },
              { title: 'Video uploaded', desc: 'Listening Practice - Part 1', time: '1 day ago' },
              { title: 'Module updated', desc: 'TOAFL Structure Guide', time: '2 days ago' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.desc}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}