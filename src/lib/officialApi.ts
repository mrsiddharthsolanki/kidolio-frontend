import api from './api';

export async function fetchOfficialProfile() {
  const res = await api.get('/user/me');
  return res.data;
}
