const API_BASE_URL = "http://localhost:4000";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no json body
  }

  if (!res.ok) {
    // IMPORTANT: message, not messsage
    const msg = data?.message || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export async function login(username, password) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
}

export async function getApplications(token) {
  return request("/api/applications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createApplication(token, app) {
  return request("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(app),
  });
}

export async function updateApplication(token, id, app) {
  return request(`/api/applications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(app),
  });
}

export async function deleteApplication(token, id) {
  return request(`/api/applications/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
