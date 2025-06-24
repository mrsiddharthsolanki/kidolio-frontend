import api from './api';

export interface RegisterParentData {
  fatherName: string;
  motherName: string;
  email: string;
  phone: string;
  aadhaar: string;
  address: string;
  occupation: string;
  emergencyContact: string;
  password: string;
  // New fields
  country: string;
  state: string;
  district: string;
  city: string;
  fatherEducation: string;
  motherEducation: string;
  yearlyIncome: string;
}

export interface RegisterOfficialData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  institution: string;
  title: string;
  licenseNumber: string;
  password: string;
  // Add legacy fields for backend compatibility
  company?: string;
  designation?: string;
  officialId?: string;
  name?: string;
}

export async function login(email: string, password: string, role: string) {
  const res = await api.post('/auth/login', { email, password, role });
  return res.data;
}

export async function registerParent(data: RegisterParentData) {
  const res = await api.post('/auth/register', { ...data, role: 'parent' });
  return res.data;
}

export async function registerOfficial(data: RegisterOfficialData) {
  const res = await api.post('/auth/register', { ...data, role: 'official' });
  return res.data;
}
