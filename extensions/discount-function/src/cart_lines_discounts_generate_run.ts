import { MoneyV2 } from "app/types/admin.types";
import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
  CartInput,
  CartLinesDiscountsGenerateRunResult,
} from "../generated/api";

interface goal {
  amount: number;
  discount: number;
}

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {
  if (!input.cart.lines.length) {
    throw new Error("No cart lines found");
  }

  const hasOrderDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Order,
  );
  const hasProductDiscountClass = input.discount.discountClasses.includes(
    DiscountClass.Product,
  );

  if (!hasOrderDiscountClass && !hasProductDiscountClass) {
    return { operations: [] };
  }

  const maxCartLine = input.cart.lines.reduce((maxLine, line) => {
    if (line.cost.subtotalAmount.amount > maxLine.cost.subtotalAmount.amount) {
      return line;
    }
    return maxLine;
  }, input.cart.lines[0]);

  const operations = [];

  console.log(
    JSON.stringify(input.shop.metafield?.jsonValue),
    input.cart.cost.subtotalAmount.amount,
  );

  function getCurrentGoal(cartTotal: MoneyV2) {
    let nextGoal: goal | null = null;
    let unlockedDiscount: goal | null = null;
    const goalDiscounts = input.shop.metafield?.jsonValue.map((item: goal) => {
      item.amount = Number(item.amount / 100);
      return { ...item };
    });
    for (let i = 0; i < goalDiscounts.length; i++) {
      if (cartTotal < goalDiscounts[i].amount) {
        nextGoal = goalDiscounts[i];
        break;
      }
      unlockedDiscount = goalDiscounts[i];
    }
    console.log(
      "getCurrentGoal:",
      JSON.stringify({ cartTotal, nextGoal, unlockedDiscount }),
      input.cart.cost.subtotalAmount.amount,
    );
    return { nextGoal, unlockedDiscount };
  }

  const { nextGoal, unlockedDiscount } = getCurrentGoal(
    input.cart.cost.totalAmount.amount,
  );

  // if (hasOrderDiscountClass) {
  //   operations.push({
  //     orderDiscountsAdd: {
  //       candidates: [
  //         {
  //           message: "10% OFF ORDER",
  //           targets: [
  //             {
  //               orderSubtotal: {
  //                 excludedCartLineIds: [],
  //               },
  //             },
  //           ],
  //           value: {
  //             percentage: {
  //               value: 10,
  //             },
  //           },
  //         },
  //       ],
  //       selectionStrategy: OrderDiscountSelectionStrategy.First,
  //     },
  //   });
  // }

  // if (
  //   hasProductDiscountClass &&
  //   input.cart.cost.subtotalAmount?.amount >= 1000
  // ) {
  //   operations.push({
  //     productDiscountsAdd: {
  //       candidates: [
  //         {
  //           message: "20% OFF PRODUCT",
  //           targets: [
  //             {
  //               cartLine: {
  //                 id: maxCartLine.id,
  //               },
  //             },
  //           ],
  //           value: {
  //             percentage: {
  //               value: 20,
  //             },
  //           },
  //         },
  //       ],
  //       selectionStrategy: ProductDiscountSelectionStrategy.First,
  //     },
  //   });
  // }

  const goal: goal = nextGoal
    ? { ...nextGoal }
    : unlockedDiscount
      ? { ...unlockedDiscount }
      : ({} as goal);

  console.log("Fetched goal", JSON.stringify(goal));

  if (
    hasProductDiscountClass &&
    input.cart.cost.subtotalAmount.amount >= (goal.amount || 1000)
    // (Number(input.cart.cost.subtotalAmount.amount) >= nextGoal!.amount ||
    //   Number(input.cart.cost.subtotalAmount.amount) >=
    //     unlockedDiscount!.amount)
  ) {
    operations.push({
      productDiscountsAdd: {
        candidates: input.cart.lines.map((line) => ({
          message: "10% OFF ALL PRODUCTS",
          targets: [
            {
              cartLine: {
                id: line.id,
              },
            },
          ],
          value: {
            percentage: {
              value: goal.discount || 10,
            },
          },
        })),
        selectionStrategy: ProductDiscountSelectionStrategy.All,
      },
    });
  }
  // // Additional goal-based discounts if totalAmount exceeds 1000
  // if (input.cart.cost.totalAmount.amount >= 1000) {
  //   console.log("Total amount exceeds 1000, applying goal discounts");
  //   const goal_discounts = input.shop.metafield?.jsonValue;

  //   if (Array.isArray(goal_discounts)) {
  //     goal_discounts.forEach((item, idx) => {
  //       console.log(
  //         `Goal Discount - Amount: ${item.amount}, Discount: ${item.discount}, Total: ${input.cart.cost.totalAmount.amount}`,
  //       );
  //     });
  //   }

  //   input.cart.lines.forEach((product, idx) => {
  //     console.log(`Applying 30% OFF to product at index ${idx}`);
  //     operations.push({
  //       productDiscountsAdd: {
  //         candidates: [
  //           {
  //             message: `30% OFF on ${product.id} PRODUCT`,
  //             targets: [
  //               {
  //                 cartLine: {
  //                   id: `${product.id}`, // Ensure this is a valid cart line ID format
  //                 },
  //               },
  //             ],
  //             value: {
  //               percentage: {
  //                 value: 30, // Apply 30% discount
  //               },
  //             },
  //           },
  //         ],
  //         selectionStrategy: ProductDiscountSelectionStrategy.First,
  //       },
  //     });
  //   });
  // }

  return {
    operations,
  };
}
