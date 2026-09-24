const API_URL = 'http://localhost:3000/api';

export async function apiRequest(path, method = 'GET', data = null, token = '') {
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(API_URL + path, options);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.messsage || 'Request failed');
  }

  return result;
}
