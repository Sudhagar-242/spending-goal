import { MoneyV2 } from 'app/types/admin.types';
import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
  CartInput,
  CartLinesDiscountsGenerateRunResult,
} from '../generated/api';

interface Goal {
  amount: number;
  discount: number;
  successMessage?: string;
  progressMessage?: string;
}

export function cartLinesDiscountsGenerateRun02(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {
  if (!input.cart.lines.length) {
    throw new Error('No cart lines found');
  }

  const hasOrderDiscountClass = input.discount.discountClasses.includes(DiscountClass.Order);
  const hasProductDiscountClass = input.discount.discountClasses.includes(DiscountClass.Product);

  if (!hasOrderDiscountClass && !hasProductDiscountClass) {
    return { operations: [] };
  }

  // Parse goals from metafield
  const goalDiscounts: GoalDiscountsValue[] = Array.isArray(input.shop.metafield?.jsonValue)
    ? input.shop.metafield.jsonValue.map((item: Goal) => ({
        ...item,
        amount: Number(item.amount) / 100, // Convert cents to currency
      }))
    : [];

  // Find the best unlocked goal and the next goal
  function getCurrentGoal(cartTotal: number) {
    let nextGoal: Goal | null = null;
    let unlockedGoal: Goal | null = null;
    const goalDiscounts = Array.isArray(input.shop.metafield?.jsonValue)
      ? input.shop.metafield.jsonValue.map((item: Goal) => ({
          ...item,
          amount: Number(item.amount) / 100,
        }))
      : [];
    for (let i = 0; i < goalDiscounts.length; i++) {
      if (cartTotal < goalDiscounts[i].amount) {
        nextGoal = goalDiscounts[i];
        break;
      }
      unlockedGoal = goalDiscounts[i];
    }
    return { nextGoal, unlockedGoal };
  }

  const cartTotal = input.cart.cost.totalAmount.amount;
  const { nextGoal, unlockedGoal } = getCurrentGoal(cartTotal);

  // Apply the best discount (highest unlocked)
  const operations = [];

  if (
    hasProductDiscountClass &&
    unlockedGoal &&
    cartTotal >= unlockedGoal.amount // Only apply if cartTotal is at least the unlocked goal
  ) {
    operations.push({
      productDiscountsAdd: {
        candidates: input.cart.lines.map((line) => {
          return ({
          message: `${unlockedGoal.discount}% OFF ALL PRODUCTS`,
          targets: [
            {
              cartLine: {
                id: line.id,
              },
            },
          ],
          value: {
            percentage: {
              value: unlockedGoal.discount,
            },
          },
        })}),
        selectionStrategy: ProductDiscountSelectionStrategy.All,
      },
    });
  }

  if (hasOrderDiscountClass && unlockedGoal && cartTotal >= unlockedGoal.amount) {
    operations.push({
      orderDiscountsAdd: {
        candidates: [
          {
            message: unlockedGoal.successMessage || `${unlockedGoal.discount}% OFF ORDER`,
            targets: [
              {
                orderSubtotal: {
                  excludedCartLineIds: [],
                },
              },
            ],
            value: {
              percentage: {
                value: unlockedGoal.discount,
              },
            },
          },
        ],
        selectionStrategy: OrderDiscountSelectionStrategy.First,
      },
    });
  }

  // Optionally, you can log or return progress info for the storefront
  console.log(
    'Discount logic:',
    JSON.stringify({
      cartTotal,
      unlockedGoal,
      nextGoal,
      operations,
    }),
  );

  console.log('Operations: ', JSON.stringify(operations));

  return {
    operations,
  };
}
