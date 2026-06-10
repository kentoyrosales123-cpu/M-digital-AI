let adminChecked = false;

async function adminInit() {
  if (adminChecked) return;

  requireAuth();

  try {
    const me = await API.request("/api/auth/me", {
      headers: API.headers(),
    });

    if (me.user.role !== "admin") {
      location.href = "/chat.html";
      return;
    }

    adminChecked = true;
  } catch (err) {
    console.error(err);
    location.href = "/login.html";
  }
}

async function loadDashboard() {
  try {
    await adminInit();

    // show loading state
    document.getElementById("stats").innerHTML = "<p>Loading dashboard...</p>";

    const d = await API.request("/api/admin/dashboard", {
      headers: API.headers(),
    });

    document.getElementById("stats").innerHTML = Object.entries(d)
      .map(
        ([k, v]) => `
        <div class="card">
          <h3>${v}</h3>
          <p>${formatKey(k)}</p>
        </div>
      `,
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

async function loadUsers() {
  await adminInit();

  document.getElementById("usersTable").innerHTML =
    "<tr><td colspan='6'>Loading users...</td></tr>";

  const users = await API.request("/api/admin/users", {
    headers: API.headers(),
  });

  document.getElementById("usersTable").innerHTML =
    `
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Subscription</th>
        <th>Countdown</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    ` +
    users
      .map(
        (u) => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <span class="badge ${u.plan === "free" ? "free" : "premium"}">
            ${u.plan || "free"}
          </span>
        </td>
        <td>
          <span
            class="countdown"
            data-reset="${u.creditResetAt || ""}"
            data-user="${u._id}"
          >
            Calculating...
          </span>
        </td>
        <td>${u.status}</td>
        <td>
          <button onclick="setUserStatus(
            '${u._id}',
            '${u.status === "active" ? "inactive" : "active"}'
          )">
            ${u.status === "active" ? "Deactivate" : "Activate"}
          </button>
        </td>
      </tr>
    `,
      )
      .join("");

  startCountdowns();
}

function startCountdowns() {
  const countdowns = document.querySelectorAll(".countdown");

  countdowns.forEach((el) => {
    const resetDate = el.dataset.reset;

    if (!resetDate) {
      el.textContent = "No expiry";
      return;
    }

    const timer = setInterval(() => {
      const end = new Date(resetDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timer);
        el.textContent = "Expired";
        location.reload();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  });
}

async function setUserStatus(id, status) {
  await API.request(`/api/admin/users/${id}/status`, {
    method: "PATCH",
    headers: API.headers(),
    body: JSON.stringify({ status }),
  });

  loadUsers();
}

async function loadPayments() {
  await adminInit();

  document.getElementById("payments").innerHTML = `
    <div class="card">
      <h3>Loading payments...</h3>
      <p>Please wait.</p>
    </div>
  `;

  const payments = await API.request("/api/admin/payments", {
    headers: API.headers(),
  });

  if (!payments.length) {
    document.getElementById("payments").innerHTML = `
      <div class="card">
        <h3>No payment proofs yet</h3>
        <p>Uploaded payment proofs will appear here.</p>
      </div>
    `;
    return;
  }

  document.getElementById("payments").innerHTML = payments
    .map(
      (p) => `
      <div class="card payment-card">
        <h3>${p.user?.name || "User"}</h3>

        <p class="payment-meta">${p.user?.email || ""}</p>

        <p><strong>Amount:</strong> ₱${p.amount}</p>
        <p><strong>Reference:</strong> ${p.referenceNumber || "-"}</p>
        <p><strong>Status:</strong> 
          <span class="badge ${p.status}">
            ${p.status}
          </span>
        </p>

        <a class="btn secondary" href="${p.screenshotPath}" target="_blank">
          View Screenshot
        </a>

        ${
          p.status === "pending"
            ? `
            <div class="payment-actions">
              <button onclick="approvePayment('${p._id}')">
                Approve
              </button>
              <button onclick="rejectPayment('${p._id}')">
                Reject
              </button>
            </div>
          `
            : ""
        }
      </div>
    `,
    )
    .join("");
}

async function approvePayment(id) {
  await API.request(`/api/admin/payments/${id}/approve`, {
    method: "PATCH",
    headers: API.headers(),
    body: "{}",
  });

  loadPayments();
}

async function rejectPayment(id) {
  await API.request(`/api/admin/payments/${id}/reject`, {
    method: "PATCH",
    headers: API.headers(),
    body: "{}",
  });

  loadPayments();
}
