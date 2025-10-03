// app/routes/shared-goal-handlers.server.ts
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { authenticate, apiVersion } from '../models/shopify.server';
import { SHOP_AND_GOAL_QUERY, SET_GOAL_DISCOUNTS_METAFIELD } from '../graphql/meta_fields';
import { ensureDiscountExists } from '../utils/create-discount-function-existance';
import { requestMutation, requestQuery } from '../utils/requestGQL';
import { fetchAllProducts } from '../utils/fetchAllProducts';
import { addGoals, removeGoal, editGoal } from '../utils/goalOperations';
import { DiscountGoals } from '../enums/discount-goals';
import type { GoalDiscountsValue, ShopData } from '../types/app_create-goal';

// --- Loader ---
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  try {
    const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);

    if (shop) {
      const { id: shopId, url, currencyCode, goalDiscounts, discountId } = shop;
      const { products, pageInfo } = await fetchAllProducts(admin, 200, null);

      return {
        shopId,
        currencyCode,
        goalDiscountArray: goalDiscounts
          ? (JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[])
          : [],
        discountId,
        url,
        accessToken: session?.accessToken,
        apiVersion,
        products,
        pageInfo,
        error: '',
      };
    }

    return {
      shopId: '',
      currencyCode: '',
      goalDiscountArray: [],
      discountId: '',
      products: null,
      pageInfo: null,
      error: 'Shop metafield not available',
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in loader:', error.message);
    }
    return {
      shopId: '',
      currencyCode: '',
      goalDiscountArray: [],
      discountId: '',
      products: null,
      pageInfo: null,
      error: 'Shop metafield not available',
    };
  }
}

// --- Action ---
export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  // Get the shop data
  const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
  const { goalDiscounts, discountId, id: shopId } = shop;

  // Parse existing goals or initialize empty array
  let goalDiscountsArray: GoalDiscountsValue[] = goalDiscounts?.value
    ? JSON.parse(goalDiscounts.value as string)
    : [];

  // Handle goal form submission (create/edit)
  const goalData = formData.get('goalData')?.toString();
  if (goalData) {
    try {
      const newGoal = JSON.parse(goalData);

      // Validate goal type
      if (!newGoal.type || !['order', 'product', 'shipping'].includes(newGoal.type)) {
        return json({ ok: false, error: 'Invalid goal type' }, { status: 400 });
      }

      // Add metadata
      newGoal.id = newGoal.id ?? crypto.randomUUID();
      newGoal.active = true;
      newGoal.createdAt = new Date().toISOString();
      newGoal.updatedAt = new Date().toISOString();

      // Ensure discount exists
      if (discountId) {
        await ensureDiscountExists(admin, discountId.value, shopId);
      }

      // Add goal to array
      goalDiscountsArray.push(newGoal);

      // Save metafield
      const { metafieldsSet } = await requestMutation<{
        metafieldsSet: { userErrors: any[]; metafields: any[] };
      }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
        variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
      });

      if (metafieldsSet?.userErrors?.length) {
        return json({ ok: false, userErrors: metafieldsSet.userErrors }, { status: 400 });
      }

      return json({ ok: true, goalDiscounts: goalDiscountsArray });
    } catch (error) {
      console.error('Error processing goal submission:', error);
      return json({ ok: false, error: 'Failed to process goal submission' }, { status: 400 });
    }
  }

  // Handle actions (ADD, REMOVE, EDIT)
  const actionType = formData.get('actionType')?.toString() ?? '';
  if (
    [DiscountGoals.ADD, DiscountGoals.REMOVE, DiscountGoals.EDIT].includes(actionType as any) &&
    (!discountId || !discountId.id)
  ) {
    await ensureDiscountExists(admin, discountId?.id, shopId);
  }

  switch (actionType) {
    case DiscountGoals.ADD:
      goalDiscountsArray.push(addGoals(formData, goalDiscountsArray) as GoalDiscountsValue);
      break;

    case DiscountGoals.REMOVE:
      const indexToRemove = removeGoal(formData);
      if (indexToRemove >= 0 && indexToRemove < goalDiscountsArray.length) {
        goalDiscountsArray.splice(indexToRemove, 1);
      }
      break;

    case DiscountGoals.EDIT:
      const { idx, goal } = editGoal(formData);
      if (idx >= 0 && idx < goalDiscountsArray.length) {
        goalDiscountsArray[idx] = {
          ...goalDiscountsArray[idx],
          ...goal,
          updatedAt: new Date().toISOString(),
        };
      }
      break;

    default:
      return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
  }

  // Save updated goals
  const { metafieldsSet } = await requestMutation<{
    metafieldsSet: { userErrors: any[]; metafields: any[] };
  }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
    variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
  });

  if (metafieldsSet?.userErrors?.length) {
    return json({ ok: false, userErrors: metafieldsSet.userErrors }, { status: 400 });
  }

  return json({ ok: true, goalDiscounts: goalDiscountsArray });
}
