import http from './http';

export const getPolicies = () => http.get('/policies').then((res) => res.data);
export const createPolicy = (payload) => http.post('/policies', payload).then((res) => res.data);
export const updatePolicy = (id, payload) => http.patch(`/policies/${id}`, payload).then((res) => res.data);
export const deletePolicy = (id) => http.delete(`/policies/${id}`).then((res) => res.data);
