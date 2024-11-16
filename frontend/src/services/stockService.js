const API_URL = 'http://localhost:8000';

export const calculateProfit = async (data) => {
  try {
    const response = await fetch(`${API_URL}/profit-calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error calculating profit:', error);
    throw error;
  }
};