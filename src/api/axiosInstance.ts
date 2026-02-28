// src/api/axiosInstance.ts
import axios from 'axios';
import { updateSessionUserStatus } from '../utils/authSession';

const api = axios.create({
  baseURL: "http://localhost:8080/lms",
  withCredentials: true, // Crucial for sending/receiving cookies
});

const redirectToAccountStatusPage = (status: 'PENDING' | 'DEACTIVE') => {
  updateSessionUserStatus(status);
  if (window.location.pathname !== '/account/pending') {
    window.location.assign('/account/pending');
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseStatus = error?.response?.status;
    const apiMessage = String(error?.response?.data?.message ?? '').toLowerCase();

    if (responseStatus === 403) {
      if (apiMessage.includes('awaiting admin approval')) {
        redirectToAccountStatusPage('PENDING');
      } else if (apiMessage.includes('deactivated')) {
        redirectToAccountStatusPage('DEACTIVE');
      }
    }

    return Promise.reject(error);
  },
);

export default api;
