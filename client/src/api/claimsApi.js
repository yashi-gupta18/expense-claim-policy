import http from './http';

export const getClaims = (params) => http.get('/claims', { params }).then((res) => res.data);
export const getClaim = (id) => http.get(`/claims/${id}`).then((res) => res.data);
export const createClaim = (payload) => http.post('/claims', payload).then((res) => res.data);
export const reviewClaimAi = (id) => http.post(`/claims/${id}/review-ai`).then((res) => res.data);
export const decideClaim = (id, payload) => http.patch(`/claims/${id}/decision`, payload).then((res) => res.data);
export const getClaimAudit = (id) => http.get(`/claims/${id}/audit`).then((res) => res.data);
