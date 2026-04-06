import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5001/api',
    timeout: 10000,
});

// Add 1 second delay to all requests to show off skeleton loaders
API.interceptors.request.use(async (config) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return config;
});

// Dashboard
export const fetchDashboard = () => API.get('/dashboard');

// Events
export const fetchEvents = (params) => API.get('/events', { params });
export const fetchEvent = (id) => API.get(`/events/${id}`);
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Workers
export const fetchWorkers = (params) => API.get('/workers', { params });
export const fetchWorker = (id) => API.get(`/workers/${id}`);
export const createWorker = (data) => API.post('/workers', data);
export const updateWorker = (id, data) => API.put(`/workers/${id}`, data);
export const deleteWorker = (id) => API.delete(`/workers/${id}`);

// Event Workers
export const fetchEventWorkers = (params) => API.get('/event-workers', { params });
export const createEventWorker = (data) => API.post('/event-workers', data);
export const updateEventWorker = (id, data) => API.put(`/event-workers/${id}`, data);
export const deleteEventWorker = (id) => API.delete(`/event-workers/${id}`);

// Expenses
export const fetchExpenses = (params) => API.get('/expenses', { params });
export const createExpense = (data) => API.post('/expenses', data);
export const updateExpense = (id, data) => API.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);

// Payments
export const fetchPayments = (params) => API.get('/payments', { params });
export const createPayment = (data) => API.post('/payments', data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);

// Packages
export const fetchPackages = () => API.get('/packages');
export const createPackage = (data) => API.post('/packages', data);
export const updatePackage = (id, data) => API.put(`/packages/${id}`, data);
export const deletePackage = (id) => API.delete(`/packages/${id}`);

// Equipment
export const fetchEquipment = (params) => API.get('/equipment', { params });
export const createEquipment = (data) => API.post('/equipment', data);
export const updateEquipment = (id, data) => API.put(`/equipment/${id}`, data);
export const deleteEquipment = (id) => API.delete(`/equipment/${id}`);

// Leads
export const fetchLeads = (params) => API.get('/leads', { params });
export const createLead = (data) => API.post('/leads', data);
export const updateLead = (id, data) => API.put(`/leads/${id}`, data);
export const deleteLead = (id) => API.delete(`/leads/${id}`);

// Documents
export const fetchDocuments = (params) => API.get('/documents', { params });
export const createDocument = (data) => API.post('/documents', data);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);

// Settings
export const fetchSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);

// Reports
export const fetchReport = (params) => API.get('/reports', { params });

export default API;
