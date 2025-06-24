import { useEffect, useState } from 'react';

export interface RegistrationTrendPoint {
  date: string;
  [state: string]: number | string;
}

export function useRegistrationTrends(selectedStates: string[]) {
  const [data, setData] = useState<RegistrationTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 'https://kidolio.onrender.com';
    // Always add /api if not present at the end of API_URL
    const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
    fetch(`${baseUrl}/stats/registration-trends`)
      .then(res => res.json())
      .then(res => {
        const trends = res.trends || {};
        // Get all dates sorted
        const allDates = Object.keys(trends).sort();
        // Build chart data: one object per date, with state counts
        const chartData: RegistrationTrendPoint[] = allDates.map(date => {
          const entry: RegistrationTrendPoint = { date };
          for (const state in trends[date]) {
            entry[state] = trends[date][state];
          }
          return entry;
        });
        setData(chartData);
        setLoading(false);
      });
  }, []);

  // Filter data by selected states
  const filteredData = data.map(row => {
    const filtered: RegistrationTrendPoint = { date: row.date };
    (selectedStates.length > 0 ? selectedStates : Object.keys(row).filter(k => k !== 'date')).forEach(state => {
      if (row[state] !== undefined) filtered[state] = row[state];
    });
    return filtered;
  });

  return { data: filteredData, loading };
}
