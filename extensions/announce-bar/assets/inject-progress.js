document.addEventListener("DOMContentLoaded", () => {
  let amount = 0;
  let progressBar = 0;
  let progressText = "";

  const observer = new MutationObserver(() => {
    const cartDrawerHeader = document.querySelector(
      "#CartDrawer .drawer__footer",
    );
    if (cartDrawerHeader && !document.querySelector("#my-progressbar")) {
      const wrapper = document.createElement("div");
      wrapper.id = "my-progressbar";
      wrapper.innerHTML = `
        <div class="progress-text">Add <span class="skeleton-loader" style="display: inline-block;">₹${amount}</span> more for FREE shipping</div>
        <div class="progress-track" style="background:#eee; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 8px;">
          <div class="progress-fill" style="background:#4caf50; height: 100%; width: ${progressBar}; display: block; transition: width 0.3s ease;"></div>
        </div>
      `;

      // Insert before .drawer__footer element (as sibling)
      cartDrawerHeader.insertAdjacentElement("beforebegin", wrapper);

      updateProgressBar();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  async function updateProgressBar() {
    const cart = await fetch("/cart.js").then((res) => res.json());
    const threshold = 2000;
    const cartTotal = cart.total_price / 100;
    const progress = Math.min((cartTotal / threshold) * 100, 100);

    const progressText = document.querySelector(
      "#my-progressbar .progress-text",
    );
    const moneyText = document.querySelector(
      "#my-progressbar .progress-text span",
    );
    const progressFill = document.querySelector(
      "#my-progressbar .progress-fill",
    );

    if (!progressText || !progressFill) return;

    if (cartTotal >= threshold) {
      progressText.textContent = "🎉 You’ve unlocked FREE shipping!";
      if (document.querySelector("cart-drawer").classList.contains("active")) {
        // Create a full-screen canvas with high z-index
        const confettiCanvas = document.createElement("canvas");
        confettiCanvas.style.position = "fixed";
        confettiCanvas.style.top = 0;
        confettiCanvas.style.left = 0;
        confettiCanvas.style.width = "100%";
        confettiCanvas.style.height = "100%";
        confettiCanvas.style.pointerEvents = "none"; // So it doesn't block clicks
        confettiCanvas.style.zIndex = 9999; // High value to be on top
        document.body.appendChild(confettiCanvas);

        // Use confetti with this canvas as the target
        const myConfetti = confetti.create(confettiCanvas, {
          resize: true,
          useWorker: true,
        });

        myConfetti({
          particleCount: 100,
          spread: 70,
          startVelocity: 30,
          angle: 90,
          origin: { x: 0.9, y: 0.9 },
        });
      }
    } else {
      const remaining = (threshold - cartTotal).toFixed(2);
      moneyText.classList.remove("skeleton-loader");
      moneyText.textContent = `₹${remaining}`;
      amount = remaining;
    }

    progressFill.style.width = `${progress}%`;
    progressBar = progress;
  }

  document.addEventListener("cart:updated", updateProgressBar);
});
