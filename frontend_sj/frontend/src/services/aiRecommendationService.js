import api from './api';

export const getLatestRecommendation = (assetId) => api.get(`/assets/${assetId}/recommendation`);
export const generateRecommendation  = (assetId) => api.post(`/assets/${assetId}/recommendation`);
export const getRecommendationSummary = () => api.get('/ai-recommendations/summary');
