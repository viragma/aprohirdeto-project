import axios from 'axios';

// Az API Load Balancered címe
const API_BASE_URL = 'http://beadando-lb-555305300.eu-central-1.elb.amazonaws.com/api';

// Az S3 bucketod címe
export const S3_BUCKET_URL = 'https://beadando-kepek-w4pp9o.s3.eu-central-1.amazonaws.com/';

// Központi axios példány
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// === API HÍVÁSOK ===
// Ezek az APId 'server.js' fájlja alapján készültek

// GET /api/ads
export const getAds = () => apiClient.get('/ads');

// GET /api/ads/:id
export const getAdById = (id) => apiClient.get(`/ads/${id}`);

// POST /api/ads (FormData-t vár a képfeltöltés miatt)
export const createAd = (formData) => apiClient.post('/ads', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// PUT /api/ads/:id (FormData-t vár a képfeltöltés miatt)
export const updateAd = (id, formData) => apiClient.put(`/ads/${id}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// DELETE /api/ads/:id
export const deleteAd = (id) => apiClient.delete(`/ads/${id}`);