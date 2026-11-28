const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function post(path, holdings) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: holdings }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export function calculateProfit(holdings) {
  return post('/profit-calculate', holdings);
}

export function calculateRisk(holdings) {
  return post('/risk-metrics', holdings);
}

export default { calculateProfit, calculateRisk };
