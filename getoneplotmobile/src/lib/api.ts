import axios from 'axios';
import Constants from 'expo-constants';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'http://localhost:3000';

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

export async function checkApprovalStatus(
  getToken: () => Promise<string | null>
): Promise<{
  isApproved: boolean;
  role?: string;
  area?: string;
  lastChecked?: string;
}> {
  const token = await getToken();
  const { data } = await api.get('/api/approval-status', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return data;
}

export async function sendContactEmail(payload: {
  fullname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const { data } = await api.post('/api/receive-email', {
    ...payload,
    from: payload.email,
  });
  return data;
}

export async function notifyPropertyInterest(payload: {
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  const { data } = await api.post('/api/properties/notify-interest', payload);
  return data;
}
