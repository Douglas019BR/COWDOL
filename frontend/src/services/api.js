const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function calculateProfit(holdings) {
  const response = await fetch(`${API_URL}/profit-calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: holdings }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export default { calculateProfit };
