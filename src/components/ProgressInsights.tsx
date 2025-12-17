'use client'

import { useState, useEffect } from 'react'
import { ProgressAnalysis } from '@/services/ai-config'

interface ProgressInsightsProps {
  goalId: number
}

export function ProgressInsights({ goalId }: ProgressInsightsProps) {
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null)
  const [advice, setAdvice] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasValidGoalId = goalId && goalId > 0;

  useEffect(() => {
    if (!hasValidGoalId) {
      setError('Invalid goal ID');
      setLoading(false);
      return;
    }

    loadInsights();
  }, [goalId])

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analysisResponse, adviceResponse] = await Promise.all([
        fetch(`/api/analysis/${goalId}`),
        fetch(`/api/advice/${goalId}`)
      ]);

      const hasValidResponses = analysisResponse.ok && adviceResponse.ok;
      if (!hasValidResponses) {
        throw new Error('Failed to load insights');
      }

      const [analysisData, adviceData] = await Promise.all([
        analysisResponse.json(),
        adviceResponse.json()
      ]);

      setAnalysis(analysisData);
      setAdvice(adviceData.map((item: any) => item.content));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Unable to load insights</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">No Analysis Available</h3>
        <p className="text-gray-600">Start logging progress to see insights.</p>
      </div>
    );
  }

  const progressColor = analysis.percentage >= 70 ? 'text-green-600' :
                       analysis.percentage >= 40 ? 'text-yellow-600' : 'text-red-600';

  const trendColor = analysis.trend === 'improving' || analysis.trend === 'stable' ? 'text-green-600' :
              analysis.trend === 'declining' ? 'text-red-600' : 'text-gray-600';

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Progress Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className={`text-2xl font-bold ${progressColor}`}>
              {analysis.percentage}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${trendColor}`}>
              {analysis.trend}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysis.consistency}%
            </div>
            <div className="text-sm text-gray-600">Consistency</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Key Insights</h4>
        <ul className="space-y-1">
          {analysis.insights.map((insight, index) => (
            <li key={index} className="text-gray-700 flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>

      {analysis.recommendations.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}

      {advice.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">AI Coach Advice</h4>
          <ul className="space-y-1">
            {advice.map((tip, index) => (
              <li key={index} className="text-gray-700 flex items-start">
                <span className="text-purple-500 mr-2">💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}