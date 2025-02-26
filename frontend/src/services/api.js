const API_BASE_URL = import.meta.env.PROD 
  ? '/api' // In production, use relative URL that Nginx will proxy
  : 'http://localhost:4000/api'; // In development

// Example API call function
export const generateShader = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-shader`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating shader:', error);
    throw error;
  }
};