let amount = 0;
let percentage = 0;
let progressBar = 0;
let confiteeBlasted = false;
// Example HTML structure to be injected
// <div class="p-container bg-transparent">
// <div class="progress-track" style="background:#eee; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 8px;">
//           <div class="progress-fill" style="background:#4caf50; height: 100%; width: ${progressBar}%; display: block; transition: width 0.3s ease;"></div>
//         </div>

document.addEventListener("DOMContentLoaded", () => {
  const thresholdData = document.getElementById("threshold-data");
  const currency = thresholdData.getAttribute("data-currency") || "USD";

  console.log("Final Used Sceme");

  // Parse the JSON array from Liquid
  let goalDiscounts = [];
  try {
    goalDiscounts =
      JSON.parse(thresholdData.getAttribute("data-threshold")) || [];
    console.log("Raw goalDiscounts from metafield:", goalDiscounts);
    if (!Array.isArray(goalDiscounts)) goalDiscounts = [];
  } catch (e) {
    console.error("Error parsing goalDiscounts:", e);
    goalDiscounts = [];
  }
  // Filter out invalid entries and sort by amount ascending
  goalDiscounts = goalDiscounts
    .filter(
      (g) =>
        typeof g.amount === "number" &&
        g.amount > 0 &&
        typeof g.discount === "number" &&
        g.discount > 0,
    )
    .sort((a, b) => a.amount - b.amount);

  console.log("Filtered & sorted goalDiscounts:", goalDiscounts);

  function getCurrentGoal(cartTotal) {
    let nextGoal = null;
    let unlockedDiscount = null;
    for (let i = 0; i < goalDiscounts.length; i++) {
      if (cartTotal < goalDiscounts[i].amount) {
        nextGoal = goalDiscounts[i];
        break;
      }
      unlockedDiscount = goalDiscounts[i];
    }
    console.log("getCurrentGoal:", { cartTotal, nextGoal, unlockedDiscount });
    return { nextGoal, unlockedDiscount };
  }

  const observer = new MutationObserver(() => {
    const cartDrawerFooter = document.querySelector(
      "#CartDrawer .drawer__footer",
    );
    if (cartDrawerFooter && !document.querySelector("#my-progressbar")) {
      const wrapper = document.createElement("div");
      wrapper.id = "my-progressbar";
      wrapper.style.marginBottom = "8px";
      wrapper.innerHTML = `
        <div class="progress-text">Add <span class="amount skeleton-loader" style="display: inline-block;">${currency}${amount}</span> more for <span class="percentage skeleton-loader" style="display: inline-block;">${percentage}%</span> Off in shipping</div>
  <div class="progress-bar">
    <div class="progress progress-fill"  style="width: ${progressBar}%;"> 
      <div class="glow"></div>
    </div>
  </div>
</div>
      `;

      // Insert before .drawer__footer element (as sibling)
      cartDrawerFooter.insertAdjacentElement("beforebegin", wrapper);

      updateProgressBar();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  async function updateProgressBar() {
    const cart = await fetch("/cart.js").then((res) => res.json());
    const cartTotal = cart.total_price;
    const { nextGoal, unlockedDiscount } = getCurrentGoal(cartTotal);
    const threshold = nextGoal ? nextGoal.amount : unlockedDiscount.amount;
    const progress = Math.min((cartTotal / threshold) * 100, 100);

    const progressText = document.querySelector(
      "#my-progressbar .progress-text",
    );
    const moneyText = document.querySelector(
      "#my-progressbar .progress-text .amount",
    );

    const percentageText = document.querySelector(
      "#my-progressbar .progress-text .percentage",
    );
    const progressFill = document.querySelector(
      "#my-progressbar .progress-fill",
    );

    if (!progressText || !progressFill) return;

    if (cartTotal >= threshold) {
      progressText.textContent = "🎉 You’ve unlocked FREE shipping!";
      if (
        document.querySelector("cart-drawer").classList.contains("active") &&
        !confiteeBlasted
      ) {
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
          origin: { x: 0.9, y: 1 },
        });
        confiteeBlasted = true;
      }
    } else {
      const remaining = (threshold - cartTotal).toFixed(2);
      moneyText.classList.remove("skeleton-loader");
      percentageText.classList.remove("skeleton-loader");
      amount = remaining / 100;
      percentage = nextGoal.discount;
      if (confiteeBlasted) {
        confiteeBlasted = false;
      }
    }
    progressBar = progress;
    console.log("Cart total:", cartTotal);
    console.log("Progress percentage:", progress, progressBar);
    console.log("Threshold for free shipping:", threshold);
    progressFill.style.width = `${progress}%`;
  }

  document.addEventListener("cart:updated", updateProgressBar);
});
