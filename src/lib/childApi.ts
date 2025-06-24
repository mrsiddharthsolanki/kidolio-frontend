import api from './api';

export async function generateChildLogin(childId: string) {
  const res = await api.post(`/child/${childId}/generate-login`);
  return res.data;
}

export async function deactivateChild(childId: string) {
  const res = await api.post(`/child/${childId}/deactivate`);
  return res.data;
}
