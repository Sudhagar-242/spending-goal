import {
  FUNCTION_AUTOMATIC_DISCOUNT_QUERY,
  CREATE_AUTOMATIC_DISCOUNT_MUTATION,
} from 'app/graphql/discount_function';
import { SET_DISCOUNT_ID_METAFIELD } from 'app/graphql/meta_fields';
import type { AdminApiContextWithoutRest } from 'node_modules/@shopify/shopify-app-remix/dist/ts/server/clients';

const DISCOUNT_TITLE = 'Cart Goal Discount';
const FUNCTION_ID = '21ac4370-f3c7-4d09-90b0-21b86b9b24bd';

function buildDiscountInput(): Record<string, any> {
  return {
    title: DISCOUNT_TITLE,
    functionId: FUNCTION_ID,
    startsAt: new Date().toISOString(),
    discountClasses: ['PRODUCT', 'SHIPPING', 'ORDER'],
    combinesWith: {
      orderDiscounts: true,
      productDiscounts: true,
      shippingDiscounts: true,
    },
  };
}

async function createDiscount(admin: AdminApiContextWithoutRest) {
  const discountInput = buildDiscountInput();
  const response = await admin.graphql(CREATE_AUTOMATIC_DISCOUNT_MUTATION, {
    variables: { discountInput },
  });
  let data = (await response.json()).data?.discountAutomaticAppCreate;
  if (!data) {
    try {
      const json = await response.json();
      data = json.data?.discountAutomaticAppCreate;
    } catch (e: unknown) {
      console.error('[Discount] Error parsing createDiscount response:', (e as Error).message);
      return { success: false, errors: [e as Error] };
    }
  }
  const userErrors = data?.userErrors || [];
  if (userErrors.length > 0) {
    return { success: false, errors: userErrors };
  }
  // The returned ID is always DiscountAutomaticApp
  return {
    success: !!data?.automaticAppDiscount?.discountId,
    discountId: data?.automaticAppDiscount?.discountId,
  };
}

async function saveDiscountIdMetafield(
  admin: AdminApiContextWithoutRest,
  ShopId: string,
  discountId: string,
) {
  await admin.graphql(SET_DISCOUNT_ID_METAFIELD, {
    variables: { ShopId, discountId: discountId },
  });
}

export async function ensureDiscountExists(
  admin: AdminApiContextWithoutRest,
  discountId: string | null,
  ShopId: string,
) {
  // Only query if discountId looks valid (DiscountAutomaticApp)
  if (
    discountId  &&
    discountId.startsWith('gid://shopify/DiscountAutomaticNode/')
  ) {
    console.log('[Discount] Checking discountId:', discountId);
    try {
      const queryRes = await admin.graphql(FUNCTION_AUTOMATIC_DISCOUNT_QUERY, {
        variables: { id: discountId },
      });
      console.log('[Discount] Query response:', JSON.stringify(queryRes, null, 2));
      const data = (await queryRes.json()).data?.discountNode;
      if (data) {
        console.log('[Discount] Discount exists:', data);
        return { success: true, discountId };
      } else {
        console.warn('[Discount] DiscountNode not found for id:', discountId);
      }
    } catch (err: any) {
      console.error('[Discount] Error querying discountId:', discountId, err.message, err);
    }
  } else {
    console.warn('[Discount] Skipping query, invalid discountId:', discountId);
  }

  // If no valid discountId or it was deleted, create a new one
  const createResult = await createDiscount(admin);
  if (!createResult.success) {
    if (
      createResult.errors &&
      createResult.errors.some(
        (error: { message: string }) =>
          error.message === 'Title must be unique for automatic discount.',
      )
    ) {
      console.error(
        '[Discount] Discount title already exists. Please use a unique title or re-use the existing discount.',
      );
      return { success: false, errors: createResult.errors };
    }
    console.error('[Discount] Discount creation errors:', createResult.errors);
    return { success: false, errors: createResult.errors };
  }
  if (createResult.discountId) {
    // Always save the DiscountAutomaticApp ID
    console.log('[Discount] Saving new discountId to metafield:', createResult.discountId);
    await saveDiscountIdMetafield(admin, ShopId, createResult.discountId);
    return { success: true, discountId: createResult.discountId };
  }
  return { success: false };
}
