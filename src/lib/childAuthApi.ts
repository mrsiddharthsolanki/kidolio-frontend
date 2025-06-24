import api from './api';

export async function childLogin(userId: string, password: string) {
  const res = await api.post('/auth/child-login', { userId, password });
  return res.data;
}
