const BASE_URL = 'http://localhost:5000';

// Log listeners setup for Request Log component
let logListeners = [];
let logs = [];

export function subscribeLogs(listener) {
  logListeners.push(listener);
  // Send existing logs initially
  listener([...logs]);
  return () => {
    logListeners = logListeners.filter((l) => l !== listener);
  };
}

export function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const newLog = {
    id: Date.now() + Math.random(),
    timestamp,
    text: `[${timestamp}] ${message}`,
    type
  };
  logs = [newLog, ...logs].slice(0, 50); // Keep last 50 logs
  logListeners.forEach((listener) => listener([...logs]));
}

export function clearLogs() {
  logs = [];
  logListeners.forEach((listener) => listener([]));
}

// Auth Token Helper
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Helper: parses response, logs API interaction, and throws on error
async function handleResponse(res, endpointName) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    // No JSON body
  }

  if (res.status === 401) {
    addLog(`${endpointName} -> ERROR: Unauthorized (401)`, 'error');
    window.dispatchEvent(new Event('unauthorized'));
    const message = (body && body.error) || 'Unauthorized - Please login again';
    throw new Error(message);
  }

  if (!res.ok) {
    const message = (body && body.error) || `Request failed with status ${res.status}`;
    addLog(`${endpointName} -> ERROR: ${message} (${res.status})`, 'error');
    throw new Error(message);
  }

  addLog(`${endpointName} -> ${res.status}`, 'success');
  return body;
}

// Auth API Calls
export async function registerUser({ email, password }) {
  addLog(`POST /auth/register for ${email}`);
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res, 'POST /auth/register');
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function loginUser({ email, password }) {
  addLog(`POST /auth/login for ${email}`);
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res, 'POST /auth/login');
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  return data;
}

export async function getCurrentUser() {
  addLog('GET /auth/me');
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res, 'GET /auth/me');
}

export function logoutUser() {
  localStorage.removeItem('token');
  addLog('User logged out');
}

// Task API Calls
export async function getTasks() {
  addLog('GET /tasks');
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res, 'GET /tasks');
}

export async function getTask(id) {
  addLog(`GET /tasks/${id}`);
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(res, `GET /tasks/${id}`);
}

export async function createTask(task) {
  addLog(`POST /tasks with title="${task.title}"`);
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(task)
  });
  return handleResponse(res, 'POST /tasks');
}

export async function updateTask(id, updates) {
  addLog(`PUT /tasks/${id}`);
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(res, `PUT /tasks/${id}`);
}

export async function deleteTask(id) {
  addLog(`DELETE /tasks/${id}`);
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res, `DELETE /tasks/${id}`);
}
