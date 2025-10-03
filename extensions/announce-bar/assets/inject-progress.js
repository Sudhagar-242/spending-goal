let progressBar = 0;
let ConfettiBlasted = false;
let CartTotalGlobal = 0;
let progressTextForAnalyze = '';

const discountGoals = () => {
  const currency = window.cart_currency;
  console.log('Window Goal Discounts (raw): ', window.goal_discounts);
  const goalDiscounts = window.goal_discounts.goals
    .filter(
      (g) =>
        typeof g.amount === 'number' &&
        g.amount > 0 &&
        typeof g.discount === 'number' &&
        g.discount > 0,
    )
    .sort((a, b) => a.amount - b.amount);
  console.log('Filtered & Sorted goalDiscounts:', goalDiscounts);
  return { goalDiscounts, currency };
};

const getGoal = (cartTotal) => {
  const { goalDiscounts } = discountGoals() || { goalDiscounts: [] };
  console.log('getGoal - input goalDiscounts:', goalDiscounts);
  const extractedGoals = {
    nextGoal: null,
    unlockedDiscount: null,
    currentGoal: null,
  };

  for (const goal of goalDiscounts) {
    if (cartTotal < goal.amount) {
      extractedGoals.nextGoal = goal;
      extractedGoals.currentGoal = goal;
      break;
    }
    extractedGoals.unlockedDiscount = goal;
    if (cartTotal === goal.amount) {
      extractedGoals.nextGoal = null;
      break;
    }
  }

  console.log('getGoal:', { cartTotal, ...extractedGoals });
  return { ...extractedGoals };
};

const formatMessage = (template, data) => {
  return template
    .replace(/\{discount\}/g, data.discount)
    .replace(/\{amountLeft\}/g, data.amountLeft)
    .replace(/\{percent\}/g, data.percent);
};

const ProgressBarParent = () => {
  const { currentGoal } = getGoal(CartTotalGlobal);
  const { currency, goalDiscounts } = discountGoals();
  console.log('ProgressBarParent - currentGoal:', currentGoal);
  console.log('ProgressBarParent - all goalDiscounts:', goalDiscounts);
  const ProgressBarParent = document.createElement('div');
  ProgressBarParent.id = 'my-progressbar';
  ProgressBarParent.style.marginBottom = '8px';
  let progressText;
  if (currentGoal) {
    progressText = currentGoal.progressMessage
      .replace(
        /\{discount\}/g,
        `<span class="amount skeleton-loader" style="display: inline-block;">${currentGoal.amount}</span>`,
      )
      .replace(
        /\{amountLeft\}/g,
        `<span class="balance skeleton-loader" style="display: inline-block;">${currency}.${currentGoal.amountLeft ?? 0}</span>`,
      )
      .replace(
        /\{percent\}/g,
        `<span class="percentage skeleton-loader" style="display: inline-block;">${currentGoal.discount}</span>`,
      );
  } else {
    progressText = progressTextForAnalyze;
  }
  progressTextForAnalyze = progressText;
  ProgressBarParent.innerHTML = `
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
  return ProgressBarParent;
};

const createConfettiCanvas = () => {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = 9999;
  document.body.appendChild(canvas);
  return canvas;
};

const launchConfetti = (canvas) => {
  // eslint-disable-next-line no-undef
  const myConfetti = confetti.create(canvas, {
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
    canvas.remove();
  }, 3000);
};

const Confetti = (isBlast) => {
  if (isBlast) {
    ConfettiBlasted = true;
    const confettiCanvas = createConfettiCanvas();
    launchConfetti(confettiCanvas);
    return '';
  }
  ConfettiBlasted = false;
  return '';
};

const formatDiscountMessage = (template, data) => {
  return template ? formatMessage(template, data) : '🎉 You’ve eligible for FREE shipping!';
};

const updateMoneyAndPercentText = (
  moneyText,
  percentageText,
  remaining,
  currency,
  discountPercent,
) => {
  moneyText.textContent = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(remaining);

  percentageText.textContent = `${discountPercent}%`;
};

const setProgressMessage = (
  cartTotal,
  nextGoal,
  unlockedDiscount,
  progressText,
  moneyText,
  percentageText,
  currency,
) => {
  let message = '';

  if (cartTotal >= nextGoal?.amount && unlockedDiscount) {
    // Success message when the discount is unlocked
    message = formatDiscountMessage(unlockedDiscount.successMessage, {
      discount: unlockedDiscount.discount,
      amountLeft: 0,
      percent: 100,
    });
  } else if (nextGoal) {
    // Message when the next goal is still unmet
    const remaining = ((nextGoal.amount - cartTotal) / 100).toFixed(2);
    const percent = nextGoal.amount > 0 ? Math.floor((cartTotal / nextGoal.amount) * 100) : 0;

    updateMoneyAndPercentText(moneyText, percentageText, remaining, currency, nextGoal.discount);

    message = nextGoal.progressMessage
      ? formatMessage(nextGoal.progressMessage, {
          discount: nextGoal.discount,
          amountLeft: moneyText.textContent,
          percent,
        })
      : message;
  } else if (unlockedDiscount && !nextGoal) {
    // Message when all goals are unlocked
    message = formatDiscountMessage(unlockedDiscount.successMessage, {
      discount: unlockedDiscount.discount,
      amountLeft: 0,
      percent: 100,
    });
  } else {
    const progressBar = document.querySelector('#my-progressbar');
    if (progressBar) progressBar.style.display = 'none';
    return;
  }

  progressText.textContent = message;
};

const updateProgressBarWidth = (progressFill, progress) => {
  progressFill.style.transition = 'width 0.5s cubic-bezier(0.4,0,0.2,1)';
  progressFill.style.width = `${progress}%`;
};

const getElements = () => {
  return {
    progressText: document.querySelector('#my-progressbar .progress-text'),
    moneyText: document.querySelector('#my-progressbar .progress-text .amount'),
    percentageText: document.querySelector('#my-progressbar .progress-text .percentage'),
    progressFill: document.querySelector('#my-progressbar .progress-fill'),
    progressBarElem: document.querySelector('#my-progressbar'),
  };
};

const hideProgressBar = () => {
  const { progressBarElem } = getElements();
  const parentElem = ProgressBarParent();
  if (parentElem) parentElem.style.display = 'none';
  if (progressBarElem) progressBarElem.style.display = 'none';
};

const shouldBlastConfetti = (cartTotal, threshold, unlockedDiscount) => {
  const cartDrawer = document.querySelector('cart-drawer');
  return (
    cartTotal >= threshold &&
    unlockedDiscount &&
    cartDrawer?.classList.contains('active') &&
    !ConfettiBlasted
  );
};

const updateProgressBarContent = (
  cartTotal,
  nextGoal,
  unlockedDiscount,
  currency,
  progressText,
  moneyText,
  percentageText,
  progressFill,
  progress,
) => {
  setProgressMessage(
    cartTotal,
    nextGoal,
    unlockedDiscount,
    progressText,
    moneyText,
    percentageText,
    currency,
  );
  progressBar = progress;
  updateProgressBarWidth(progressFill, progress);
};

const updateProgressBar = async () => {
  const { cartTotal } = await fetchCart();
  CartTotalGlobal = cartTotal;

  const { nextGoal, unlockedDiscount } = getGoal(cartTotal);
  console.log('updateProgressBar - nextGoal:', nextGoal);
  console.log('updateProgressBar - unlockedDiscount:', unlockedDiscount);

  const threshold = nextGoal ? nextGoal.amount : unlockedDiscount ? unlockedDiscount.amount : 0;
  const progress = threshold > 0 ? Math.min((cartTotal / threshold) * 100, 100) : 0;

  const { currency } = discountGoals();
  const { progressText, moneyText, percentageText, progressFill } = getElements();

  if (!progressText || !progressFill) {
    console.warn('Progress bar elements not found.');
    console.log({ cartTotal, progressText, progressFill });
    return;
  }

  if (Object.is(cartTotal, 0)) {
    console.warn('Cart total is 0. Progress bar will not be updated.');
    hideProgressBar();
    return;
  }

  updateProgressBarContent(
    cartTotal,
    nextGoal,
    unlockedDiscount,
    currency,
    progressText,
    moneyText,
    percentageText,
    progressFill,
    progress,
  );

  if (shouldBlastConfetti(cartTotal, threshold, unlockedDiscount)) {
    Confetti(true);
  } else if (ConfettiBlasted) {
    Confetti(false);
  }
};

const fetchCart = async () => {
  const cart = await fetch('/cart.js').then((res) => res.json());
  return { cart, cartTotal: cart.original_total_price };
};

const getCartDrawer = () => {
  return document.querySelector('#CartDrawer .drawer__footer') ??
  document.querySelector('.cart-drawer__content .cart-drawer__summary .cart__summary-totals');
};

const insertProgressBarIfNeeded = () => {
  const cartDrawer = getCartDrawer();
  if (cartDrawer && !document.querySelector('#my-progressbar')) {
    cartDrawer.insertAdjacentElement('beforebegin', ProgressBarParent());
    updateProgressBar();
  }
};

const setupMutationObserver = () => {
  const observer = new MutationObserver(() => {
    const cartDrawer = getCartDrawer();
    if (!document.querySelector('#my-progressbar')) {
      cartDrawer.insertAdjacentElement('beforebegin', ProgressBarParent());
      updateProgressBar();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

document.addEventListener('DOMContentLoaded', () => {
  const cartDrawer = getCartDrawer();

  insertProgressBarIfNeeded();

  console.log('Outside Dom Loaded', cartDrawer);

  setupMutationObserver();

  document.addEventListener('cart:updated', updateProgressBar);

  if (!cartDrawer) {
    console.warn('Cart drawer element not found. Progress bar cannot be injected.');
  }
});





// // Goal Discounts Manager for Shopify
// class GoalDiscountsManager {
//   constructor() {
//     this.progressBar = 0;
//     this.confettiBlasted = false;
//     this.cartTotalGlobal = 0;
//     this.progressTextForAnalyze = '';
//     this.currency = window.cart_currency || 'USD';
//     this.goalDiscounts = this.getGoalDiscountsFromMetafield();
//   }

//   // Get goal discounts from Shopify metafield
//   getGoalDiscountsFromMetafield() {
//     try {
//       // Get metafield value from Shopify
//       const metafieldValue = window?.goal_discounts?.value;

//       if (!metafieldValue) {
//         console.warn('No goal discounts metafield found');
//         return [];
//       }

//       const parsedGoals = JSON.parse(metafieldValue);

//       // Filter and sort goals
//       return parsedGoals
//         .filter(g =>
//           typeof g.conditions?.minimumSpent === 'number' &&
//           g.conditions.minimumSpent > 0 &&
//           typeof g.discount?.value === 'number' &&
//           g.discount.value > 0
//         )
//         .sort((a, b) => a.conditions.minimumSpent - b.conditions.minimumSpent);
//     } catch (error) {
//       console.error('Error parsing goal discounts:', error);
//       return [];
//     }
//   }

//   // Get the current goal based on cart total
//   getGoal(cartTotal) {
//     const extractedGoals = {
//       nextGoal: null,
//       unlockedDiscount: null,
//       currentGoal: null
//     };

//     for (const goal of this.goalDiscounts) {
//       if (cartTotal < goal.conditions.minimumSpent) {
//         extractedGoals.nextGoal = goal;
//         extractedGoals.currentGoal = goal;
//         break;
//       }
//       extractedGoals.unlockedDiscount = goal;
//       if (cartTotal === goal.conditions.minimumSpent) {
//         extractedGoals.nextGoal = null;
//         break;
//       }
//     }

//     return extractedGoals;
//   }

//   // Format message templates
//   formatMessage(template, data) {
//     if (!template) return '';

//     return template
//       .replace(/\{discount\}/g, data.discount)
//       .replace(/\{amountLeft\}/g, data.amountLeft)
//       .replace(/\{percent\}/g, data.percent);
//   }

//   // Create progress bar element
//   createProgressBar() {
//     const progressBarContainer = document.createElement('div');
//     progressBarContainer.id = 'goal-progress-container';
//     progressBarContainer.style.marginBottom = '8px';

//     const { currentGoal } = this.getGoal(this.cartTotalGlobal);
//     let progressText = '';

//     if (currentGoal) {
//       progressText = currentGoal.message.progress
//         ? this.formatMessage(currentGoal.message.progress, {
//             discount: currentGoal.discount.value,
//             amountLeft: this.formatCurrency((currentGoal.conditions.minimumSpent - this.cartTotalGlobal) / 100),
//             percent: currentGoal.discount.value
//           })
//         : '';
//     } else {
//       progressText = this.progressTextForAnalyze;
//     }

//     this.progressTextForAnalyze = progressText;

//     progressBarContainer.innerHTML = `
//       <div class="progress-text">${progressText}</div>
//       <div class="p-container">
//         <div class="progress-bar">
//           <div class="progress progress-fill" style="width: ${this.progressBar}%;">
//             <div class="glow" style="display: inline-block;"></div>
//           </div>
//         </div>
//       </div>
//     `;

//     return progressBarContainer;
//   }

//   // Format currency based on shop settings
//   formatCurrency(amount) {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: this.currency,
//     }).format(amount);
//   }

//   // Create confetti canvas
//   createConfettiCanvas() {
//     const canvas = document.createElement('canvas');
//     canvas.style.position = 'fixed';
//     canvas.style.top = '0';
//     canvas.style.left = '0';
//     canvas.style.width = '100%';
//     canvas.style.height = '100%';
//     canvas.style.pointerEvents = 'none';
//     canvas.style.zIndex = '9999';
//     document.body.appendChild(canvas);
//     return canvas;
//   }

//   // Launch confetti animation
//   launchConfetti(canvas) {
//     // eslint-disable-next-line no-undef
//     const myConfetti = confetti.create(canvas, {
//       resize: true,
//       useWorker: true,
//     });

//     myConfetti({
//       particleCount: 100,
//       spread: 70,
//       startVelocity: 30,
//       angle: 90,
//       origin: { x: 0.9, y: 1 },
//     });

//     setTimeout(() => {
//       canvas.remove();
//     }, 3000);
//   }

//   // Show confetti if needed
//   showConfetti(isBlast) {
//     if (isBlast && !this.confettiBlasted) {
//       this.confettiBlasted = true;
//       const confettiCanvas = this.createConfettiCanvas();
//       this.launchConfetti(confettiCanvas);
//     } else if (!isBlast) {
//       this.confettiBlasted = false;
//     }
//   }

//   // Update progress message
//   updateProgressMessage(cartTotal, nextGoal, unlockedDiscount) {
//     const progressTextElement = document.querySelector('#goal-progress-container .progress-text');
//     const moneyTextElement = document.querySelector('#goal-progress-container .progress-text .amount');
//     const percentageTextElement = document.querySelector('#goal-progress-container .progress-text .percentage');

//     let message = '';

//     if (cartTotal >= nextGoal?.conditions.minimumSpent && unlockedDiscount) {
//       // Success message when the discount is unlocked
//       message = this.formatMessage(unlockedDiscount.message.success, {
//         discount: unlockedDiscount.discount.value,
//         amountLeft: 0,
//         percent: 100,
//       });
//     } else if (nextGoal) {
//       // Message when the next goal is still unmet
//       const remaining = (nextGoal.conditions.minimumSpent - cartTotal) / 100;
//       const percent = nextGoal.conditions.minimumSpent > 0
//         ? Math.floor((cartTotal / nextGoal.conditions.minimumSpent) * 100)
//         : 0;

//       if (moneyTextElement && percentageTextElement) {
//         moneyTextElement.textContent = this.formatCurrency(remaining);
//         percentageTextElement.textContent = `${nextGoal.discount.value}%`;
//       }

//       message = nextGoal.message.progress
//         ? this.formatMessage(nextGoal.message.progress, {
//             discount: nextGoal.discount.value,
//             amountLeft: this.formatCurrency(remaining),
//             percent: nextGoal.discount.value,
//           })
//         : '';
//     } else if (unlockedDiscount && !nextGoal) {
//       // Message when all goals are unlocked
//       message = this.formatMessage(unlockedDiscount.message.success, {
//         discount: unlockedDiscount.discount.value,
//         amountLeft: 0,
//         percent: 100,
//       });
//     } else {
//       const progressBar = document.querySelector('#goal-progress-container');
//       if (progressBar) progressBar.style.display = 'none';
//       return;
//     }

//     if (progressTextElement) {
//       progressTextElement.textContent = message;
//     }
//   }

//   // Update progress bar width
//   updateProgressBarWidth(progressFill, progress) {
//     if (progressFill) {
//       progressFill.style.transition = 'width 0.5s cubic-bezier(0.4,0,0.2,1)';
//       progressFill.style.width = `${progress}%`;
//     }
//   }

//   // Get cart elements
//   getCartElements() {
//     return {
//       progressText: document.querySelector('#goal-progress-container .progress-text'),
//       moneyText: document.querySelector('#goal-progress-container .progress-text .amount'),
//       percentageText: document.querySelector('#goal-progress-container .progress-text .percentage'),
//       progressFill: document.querySelector('#goal-progress-container .progress-fill'),
//       progressBarElem: document.querySelector('#goal-progress-container'),
//     };
//   }

//   // Hide progress bar
//   hideProgressBar() {
//     const progressBarElem = this.getCartElements().progressBarElem;
//     if (progressBarElem) progressBarElem.style.display = 'none';
//   }

//   // Check if confetti should be shown
//   shouldShowConfetti(cartTotal, threshold, unlockedDiscount) {
//     const cartDrawer = document.querySelector('cart-drawer');
//     return (
//       cartTotal >= threshold &&
//       unlockedDiscount &&
//       cartDrawer?.classList.contains('active') &&
//       !this.confettiBlasted
//     );
//   }

//   // Update progress bar content
//   async updateProgressBar() {
//     const cart = await this.fetchCart();
//     this.cartTotalGlobal = cart.cartTotal;

//     const { nextGoal, unlockedDiscount } = this.getGoal(this.cartTotalGlobal);
//     const threshold = nextGoal
//       ? nextGoal.conditions.minimumSpent
//       : unlockedDiscount
//         ? unlockedDiscount.conditions.minimumSpent
//         : 0;

//     const progress = threshold > 0
//       ? Math.min((this.cartTotalGlobal / threshold) * 100, 100)
//       : 0;

//     this.progressBar = progress;

//     const { progressText, moneyText, percentageText, progressFill } = this.getCartElements();

//     if (!progressText || !progressFill) {
//       console.warn('Progress bar elements not found.');
//       return;
//     }

//     if (this.cartTotalGlobal === 0) {
//       console.warn('Cart total is 0. Progress bar will not be updated.');
//       this.hideProgressBar();
//       return;
//     }

//     this.updateProgressMessage(this.cartTotalGlobal, nextGoal, unlockedDiscount);
//     this.updateProgressBarWidth(progressFill, progress);

//     if (this.shouldShowConfetti(this.cartTotalGlobal, threshold, unlockedDiscount)) {
//       this.showConfetti(true);
//     } else if (this.confettiBlasted) {
//       this.showConfetti(false);
//     }
//   }

//   // Fetch cart data
//   async fetchCart() {
//     try {
//       const response = await fetch('/cart.js');
//       const cart = await response.json();
//       return {
//         cart,
//         cartTotal: cart.original_total_price
//       };
//     } catch (error) {
//       console.error('Error fetching cart:', error);
//       return {
//         cart: null,
//         cartTotal: 0
//       };
//     }
//   }

//   // Get cart drawer element
//   getCartDrawer() {
//     return document.querySelector('#CartDrawer .drawer__footer') ??
//       document.querySelector('.cart-drawer__content .cart-drawer__summary .cart__summary-totals');
//   }

//   // Insert progress bar if needed
//   insertProgressBarIfNeeded() {
//     const cartDrawer = this.getCartDrawer();
//     if (cartDrawer && !document.querySelector('#goal-progress-container')) {
//       cartDrawer.insertAdjacentElement('beforebegin', this.createProgressBar());
//       this.updateProgressBar();
//     }
//   }

//   // Setup mutation observer
//   setupMutationObserver() {
//     const observer = new MutationObserver(() => {
//       const cartDrawer = this.getCartDrawer();
//       if (!document.querySelector('#goal-progress-container')) {
//         this.insertProgressBarIfNeeded();
//       }
//     });

//     observer.observe(document.body, { childList: true, subtree: true });
//   }

//   // Initialize the manager
//   init() {
//     document.addEventListener('DOMContentLoaded', () => {
//       this.insertProgressBarIfNeeded();
//       this.setupMutationObserver();
//       document.addEventListener('cart:updated', () => this.updateProgressBar());

//       const cartDrawer = this.getCartDrawer();
//       if (!cartDrawer) {
//         console.warn('Cart drawer element not found. Progress bar cannot be injected.');
//       }
//     });
//   }
// }

// // Initialize the manager
// const goalDiscountsManager = new GoalDiscountsManager();
// goalDiscountsManager.init();
