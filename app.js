function showBanner(message, type = "info", duration = 3000) {
    const bannerContainer = document.getElementById("bannerContainer");

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible fade show mx-auto mb-2 text-center`;
    alert.setAttribute("role", "alert");
    alert.style.transition = "opacity 0.5s ease-in-out";
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    bannerContainer.appendChild(alert);

    // Automatically remove after timeout
    setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => {
            alert.remove();
        }, 500);
    }, duration);
}