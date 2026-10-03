import http from './http';

export const getClaimReviews = (id) => http.get(`/claims/${id}/reviews`).then((res) => res.data);
