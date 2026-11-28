const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

async function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function calculateProfit(holdings) {
  return post('/profit-calculate', { data: holdings });
}

export function calculateRisk(holdings) {
  return post('/risk-metrics', { data: holdings });
}

export function savePortfolio(payload) {
  return post('/portfolios', payload);
}

export function listPortfolios() {
  return request('/portfolios');
}

export function loadPortfolio(id) {
  return request(`/portfolios/${id}`);
}

export function deletePortfolio(id) {
  return request(`/portfolios/${id}`, { method: 'DELETE' });
}

export default {
  calculateProfit,
  calculateRisk,
  savePortfolio,
  listPortfolios,
  loadPortfolio,
  deletePortfolio,
};
