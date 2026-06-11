async function loadProfile() {
  try {
    const data = await API.request("/api/auth/me", {
      headers: API.headers(),
    });

    const user = data.user;

    if (!user) {
      window.location.href = "/login.html";
      return;
    }

    const used = user.creditUsed || 0;
    const limit = user.creditLimit || 30;
    const remaining = Math.max(limit - used, 0);

    document.getElementById("profileName").textContent = user.name;
    document.getElementById("profileEmail").textContent = user.email;

    document.getElementById("profileInitial").textContent =
      user.name?.charAt(0)?.toUpperCase() || "U";

    document.getElementById("profilePlan").textContent = (user.plan || "free")
      .replace("_", " ")
      .toUpperCase();

    document.getElementById("profileCredits").textContent =
      `${used} / ${limit}`;

    document.getElementById("profileRemaining").textContent = remaining;
  } catch (error) {
    console.error(error);
    alert(error.message || "Failed to load profile");
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

function logout() {
  localStorage.removeItem("token");

  window.location.href = "/login.html";
}
