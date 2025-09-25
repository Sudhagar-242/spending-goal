// let amount = 0;
// let percentage = 0;
let progressBar = 0;
let ConfettiBlasted = false;
let CartTotalGlobal = 0;
let progressTextForAnalyze = "";
// Example HTML structure to be injected
// <div class="p-container bg-transparent">
// <div class="progress-track" style="background:#eee; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 8px;">
//           <div class="progress-fill" style="background:#4caf50; height: 100%; width: ${progressBar}%; display: block; transition: width 0.3s ease;"></div>
//         </div>

function discountGoals() {
  const thresholdData = document.getElementById("threshold-data");
  const currency = thresholdData.getAttribute("data-currency") || "USD";
  const cartElement = thresholdData.getAttribute("data-cart-element");
  const thresholds = thresholdData.getAttribute("data-threshold");

  try {
    const goalDiscounts = JSON.parse(thresholds)
      .filter(
        (g) =>
          typeof g.amount === "number" &&
          g.amount > 0 &&
          typeof g.discount === "number" &&
          g.discount > 0,
      )
      .sort((a, b) => a.amount - b.amount);
    return { goalDiscounts, currency, cartElement };
  } catch (e) {
    console.error("Error parsing Goals:", e);
  }
}

function getGoal(cartTotal) {
  const { goalDiscounts } = discountGoals() || { goalDiscounts: [] };
  let nextGoal = null;
  let unlockedDiscount = null;
  let currentGoal = null;

  for (const goal of goalDiscounts) {
    if (cartTotal < goal.amount) {
      nextGoal = goal;
      currentGoal = goal;
      break;
    }
    unlockedDiscount = goal;
    if (cartTotal === goal.amount) {
      nextGoal = null;
      break;
    }
  }

  console.log("getGoal:", { cartTotal, nextGoal, unlockedDiscount });
  return { currentGoal, nextGoal, unlockedDiscount };
}

function formatMessage(template, data) {
  return template
    .replace(/\{discount\}/g, data.discount)
    .replace(/\{amountLeft\}/g, data.amountLeft)
    .replace(/\{percent\}/g, data.percent);
}

function wrapper() {
  const { currentGoal } = getGoal(CartTotalGlobal);
  const { currency } = discountGoals();
  const wrapper = document.createElement("div");
  wrapper.id = "my-progressbar";
  wrapper.style.marginBottom = "8px";
  let progressText;
  if (currentGoal) {
    progressText = currentGoal.progressMessage
      .replace(/\{discount\}/g, `<span class="amount skeleton-loader" style="display: inline-block;">${currentGoal.amount}</span>`)
      .replace(/\{amountLeft\}/g, `<span class="balance skeleton-loader" style="display: inline-block;">${currency}.${currentGoal.amountLeft ?? 0}</span>`)
      .replace(/\{percent\}/g, `<span class="percentage skeleton-loader" style="display: inline-block;">${currentGoal.discount}%</span>`);
  } else {
    progressText = progressTextForAnalyze;
  }
  progressTextForAnalyze = progressText;
  wrapper.innerHTML = `
        <div class="progress-text">${progressText}</div>
  <div class="p-container">
        <div class="progress-bar">
    <div class="progress progress-fill"  style="width: ${progressBar}%;"> 
      <div class="glow" style="display: inline-block;"></div>
    </div>
  </div>
</div>
</div>
      `;
  return wrapper;
}

function Confetti(isBlast) {
  if (isBlast) {
    // Only trigger confetti once per unlock
    ConfettiBlasted = true;
    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.style.position = "fixed";
    confettiCanvas.style.top = 0;
    confettiCanvas.style.left = 0;
    confettiCanvas.style.width = "100%";
    confettiCanvas.style.height = "100%";
    confettiCanvas.style.pointerEvents = "none";
    confettiCanvas.style.zIndex = 9999;
    document.body.appendChild(confettiCanvas);
    // eslint-disable-next-line no-undef
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
    setTimeout(() => {
      confettiCanvas.remove();
    }, 3000);
    return "";
  }
  ConfettiBlasted = false;
  return "";
}
function setProgressMessage(cartTotal, nextGoal, unlockedDiscount, progressText, moneyText, percentageText, currency) {
    let message = "";
    if (cartTotal >= nextGoal?.amount && unlockedDiscount) {
        // Success message when the discount is unlocked
        message = unlockedDiscount.successMessage
            ? formatMessage(unlockedDiscount.successMessage, {
                  discount: unlockedDiscount.discount,
                  amountLeft: 0,
                  percent: 100,
              })
            : "🎉 You’ve eligible for FREE shipping!";
    } else if (nextGoal) {
        // Message when the next goal is still unmet
        const remaining = ((nextGoal.amount - cartTotal) / 100).toFixed(2);
        const percent = nextGoal.amount > 0 ? Math.floor((cartTotal / nextGoal.amount) * 100) : 0;
        moneyText.textContent = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(remaining);
        percentageText.textContent = `${nextGoal.discount}%`;
        message = nextGoal.progressMessage
            ? formatMessage(nextGoal.progressMessage, {
                  discount: nextGoal.discount,
                  amountLeft: moneyText.textContent,
                  percent,
              })
            : message;
    } else if (unlockedDiscount && !nextGoal) {
        // Message when all goals are unlocked
        message = unlockedDiscount.successMessage
            ? formatMessage(unlockedDiscount.successMessage, {
                  discount: unlockedDiscount.discount,
                  amountLeft: 0,
                  percent: 100,
              })
            : "🎉 You’ve eligible for FREE shipping!";
    }else {
        document.querySelector("#my-progressbar").style.display = "none";
        return;
    }

    progressText.textContent = message;
}



function updateProgressBarWidth(progressFill, progress) {
    progressFill.style.transition = "width 0.5s cubic-bezier(0.4,0,0.2,1)";
    progressFill.style.width = `${progress}%`;
}



document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    // cart-drawer__content cart-drawer__summary
    const cartDrawer = document.querySelector("#CartDrawer .drawer__footer") ?? document.querySelector(".cart-drawer__content .cart-drawer__summary");
    console.log("inside the Main Observer");
    if (!document.querySelector("#my-progressbar")) {
      cartDrawer.insertAdjacentElement("beforebegin", wrapper());
      updateProgressBar();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

async function updateProgressBar() {
    const cart = await fetch("/cart.js").then((res) => res.json());
    const cartTotal = cart.original_total_price;
    CartTotalGlobal = cartTotal;

    const { nextGoal, unlockedDiscount } = getGoal(cartTotal);
    let threshold = nextGoal ? nextGoal.amount : unlockedDiscount ? unlockedDiscount.amount : 0;
    let progress = threshold > 0 ? Math.min((cartTotal / threshold) * 100, 100) : 0;
    const { currency } = discountGoals();

    const progressText = document.querySelector("#my-progressbar .progress-text");
    const moneyText = document.querySelector("#my-progressbar .progress-text .amount");
    const percentageText = document.querySelector("#my-progressbar .progress-text .percentage");
    const progressFill = document.querySelector("#my-progressbar .progress-fill");

    if (!progressText || !progressFill || cartTotal <= 0) {
        console.warn("Progress bar elements not found.");
        return;
    }

    // Set the progress message based on the goal
    setProgressMessage(cartTotal, nextGoal, unlockedDiscount, progressText, moneyText, percentageText, currency);

    // Set the progress bar width
    progressBar = progress; // Update global progressBar variable
    updateProgressBarWidth(progressFill, progress);

    // Handle confetti if the discount is unlocked
    if (cartTotal >= threshold && unlockedDiscount) {
        if (
            document.querySelector("cart-drawer") &&
            document.querySelector("cart-drawer").classList.contains("active") &&
            !ConfettiBlasted
        ) {
            Confetti(true);
        }
    } else if (ConfettiBlasted) {
        Confetti(false);
    }
}


  document.addEventListener("cart:updated", updateProgressBar);
});
