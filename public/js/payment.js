function selectPlan(plan, amount) {
  document.getElementById("selectedPlanText").textContent = plan;
  document.getElementById("selectedPlanInput").value = plan;
  document.getElementById("amountInput").value = amount;
}

async function submitPaymentProof(event) {
  event.preventDefault();

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      window.location.href = "/login.html";
      return;
    }

    const form = event.target;
    const file = form.proofImage.files[0];

    if (!file) {
      alert("Please upload payment screenshot.");
      return;
    }

    const formData = new FormData();

    formData.append("plan", document.getElementById("selectedPlanInput").value);
    formData.append("amount", document.getElementById("amountInput").value);
    formData.append("referenceNumber", form.referenceNumber.value);

    // IMPORTANT: backend expects "screenshot"
    formData.append("screenshot", file);

    const response = await fetch("/api/subscription/payment-proof", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment submission failed");
    }

    alert(data.message || "Payment proof submitted successfully.");

    form.reset();
    selectPlan("Premium", 249);
  } catch (error) {
    console.error(error);
    alert(error.message || "Upload failed.");
  }
}

window.addEventListener("load", () => {
  selectPlan("Premium", 249);
});
