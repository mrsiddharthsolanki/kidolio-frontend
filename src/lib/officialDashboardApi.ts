import api from './api';

export async function fetchOfficialDashboardStats() {
  const res = await api.get('/stats');
  return res.data;
}

export async function fetchRecentActivity() {
  const res = await api.get('/activity/recent');
  return res.data;
}
