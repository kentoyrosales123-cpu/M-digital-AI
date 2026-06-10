async function handleRegister(e) {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const data = await API.request("/api/auth/register", {
      method: "POST",
      headers: API.headers(),
      body: JSON.stringify(body),
    });
    localStorage.setItem("token", data.token);
    location.href = "/chat.html";
  } catch (err) {
    alert(err.message);
  }
}
async function handleLogin(e) {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  try {
    const data = await API.request("/api/auth/login", {
      method: "POST",
      headers: API.headers(),
      body: JSON.stringify(body),
    });
    localStorage.setItem("token", data.token);
    location.href =
      data.user.role === "admin" ? "/admin-dashboard.html" : "/chat.html";
  } catch (err) {
    alert(err.message);
  }
}
async function loadProfile() {
  requireAuth();
  const data = await API.request("/api/auth/me", { headers: API.headers() });
  document.getElementById("profileBox").innerHTML =
    `<h3>${data.user.name}</h3><p>${data.user.email}</p><p>Role: ${data.user.role}</p><p>Plan: ${data.subscription?.plan || "free"}</p><p>Status: ${data.subscription?.status || "active"}</p>`;
}
