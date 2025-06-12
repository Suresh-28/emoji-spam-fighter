
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, Smile, BarChart3 } from 'lucide-react';
import { PredictionResult } from '@/types/prediction';

interface DashboardProps {
  predictions: PredictionResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ predictions }) => {
  const dashboardData = useMemo(() => {
    if (predictions.length === 0) {
      return {
        totalPredictions: 0,
        spamCount: 0,
        notSpamCount: 0,
        averageConfidence: 0,
        topEmojis: [],
        confidenceDistribution: [],
        hourlyStats: []
      };
    }

    const spamCount = predictions.filter(p => p.isSpam).length;
    const notSpamCount = predictions.length - spamCount;
    const averageConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    // Emoji analysis
    const emojiMap = new Map<string, number>();
    predictions.forEach(p => {
      p.features.emojiTypes.forEach(emoji => {
        emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1);
      });
    });

    const topEmojis = Array.from(emojiMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([emoji, count]) => ({ emoji, count }));

    // Confidence distribution
    const confidenceRanges = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const confidenceDistribution = confidenceRanges.map(range => {
      const [min, max] = range.split('-').map(s => parseInt(s.replace('%', '')) / 100);
      const count = predictions.filter(p => {
        const conf = p.confidence;
        return conf >= min && (max === 1 ? conf <= max : conf < max);
      }).length;
      return { range, count };
    });

    return {
      totalPredictions: predictions.length,
      spamCount,
      notSpamCount,
      averageConfidence,
      topEmojis,
      confidenceDistribution
    };
  }, [predictions]);

  const spamVsNotSpamData = [
    { name: 'Not Spam', value: dashboardData.notSpamCount, color: '#10b981' },
    { name: 'Spam', value: dashboardData.spamCount, color: '#ef4444' }
  ];

  const COLORS = ['#10b981', '#ef4444'];

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-100 rounded-full">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Yet</h3>
        <p className="text-gray-500">
          Start analyzing post-comment pairs to see dashboard insights here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Analyzed</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardData.totalPredictions}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Spam Detected</p>
                <p className="text-2xl font-bold text-red-900">{dashboardData.spamCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Not Spam</p>
                <p className="text-2xl font-bold text-green-900">{dashboardData.notSpamCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Confidence</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(dashboardData.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spam vs Not Spam Pie Chart */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Detection Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spamVsNotSpamData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spamVsNotSpamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Confidence Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Emoji Analysis */}
      {dashboardData.topEmojis.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-yellow-500" />
              Top Emojis Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {dashboardData.topEmojis.map(({ emoji, count }, index) => (
                <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">{emoji}</div>
                  <Badge variant="secondary">{count} times</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
