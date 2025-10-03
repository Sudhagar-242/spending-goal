// import React, { useState, useCallback, Suspense } from 'react';
// import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
// import { json } from '@remix-run/node';
// import { useLoaderData, useFetcher } from '@remix-run/react';
// import { Page, Card, BlockStack, Frame, Tabs, EmptyState, SkeletonPage, Banner, Layout, SkeletonBodyText, SkeletonDisplayText, Text } from '@shopify/polaris';
// import { authenticate, apiVersion } from '../models/shopify.server';
// import { SHOP_AND_GOAL_QUERY, SET_GOAL_DISCOUNTS_METAFIELD } from '../graphql/meta_fields';
// import { ensureDiscountExists } from '../utils/create-discount-function-existance';
// import { DiscountGoals, DiscountKind } from '../enums/discount-goals';
// import { requestMutation, requestQuery } from '../utils/requestGQL';
// import type { GoalDiscountsValue, ShopData } from '../types/app_create-goal';
// import { fetchAllProducts } from '../utils/fetchAllProducts';
// import { addGoals, removeGoal, editGoal } from '../utils/goalOperations';

// //ctx
// import { ProductsContextProvider } from '../context/productsContext';
// import OrderGoalForm from '../components/forms/orderForm';
// import ProductGoalForm from '../components/forms/productForm';
// import ShippingGoalForm from '../components/forms/shippingForm';

// // Fallback UI Components
// function LoadingFallback() {
//   return (
//     <SkeletonPage title="Spending Goals" backAction primaryAction>
//       <Layout>
//         <Layout.Section>
//           <Card>
//             <BlockStack gap="400">
//               <SkeletonDisplayText size="small" />
//               <SkeletonBodyText lines={3} />
//             </BlockStack>
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </SkeletonPage>
//   );
// }

// function ErrorFallback({ error }: { error: string }) {
//   return (
//     <Page title="Error" backAction={{ content: 'Back', url: '/app/index' }}>
//       <Layout>
//         <Layout.Section>
//           <Banner title="Error loading goals" tone="critical">
//             <Text as="p">{error}</Text>
//           </Banner>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }

// function FormLoadingFallback() {
//   return (
//     <Card>
//       <BlockStack gap="400">
//         <SkeletonDisplayText size="medium" />
//         <SkeletonBodyText lines={6} />
//       </BlockStack>
//     </Card>
//   );
// }

// const tabs = [
//   {
//     id: 'all-customers-1',
//     content: DiscountKind.ORDER,
//     accessibilityLabel: 'All customers',
//     panelID: 'all-customers-content-1',
//   },
//   {
//     id: 'accepts-marketing-1',
//     content: DiscountKind.PRODUCT,
//     panelID: 'accepts-marketing-content-1',
//   },
//   {
//     id: 'repeat-customers-1',
//     content: DiscountKind.SHIPPING,
//     panelID: 'repeat-customers-content-1',
//   },
// ];

// // --- Loader ---
// export async function loader({ request }: LoaderFunctionArgs) {
//   const { admin, session } = await authenticate.admin(request);
//   try {
//     const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
//     if (shop) {
//       const { id: shopId, url, currencyCode, goalDiscounts, discountId } = shop;
//       const { products, pageInfo } = await fetchAllProducts(admin, 200, null);
//       return {
//         shopId,
//         currencyCode,
//         goalDiscountArray: JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[],
//         discountId,
//         url,
//         accessToken: session?.accessToken,
//         apiVersion,
//         products,
//         pageInfo,
//         error: '',
//       };
//     }
//     return {
//       shopId: '',
//       currencyCode: '',
//       goalDiscountArray: [],
//       discountId: '',
//       products: null,
//       pageInfo: null,
//       error: 'Shop metafield not available',
//     };
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('Error in loader:', error.message);
//     }
//     return {
//       shopId: '',
//       currencyCode: '',
//       goalDiscountArray: [],
//       discountId: '',
//       products: null,
//       pageInfo: null,
//       error: 'Shop metafield not available',
//     };
//   }
// }

// // --- Action ---
// // export async function action({ request }: ActionFunctionArgs) {
// //   const { admin } = await authenticate.admin(request);
// //   const formData = await request.formData();
// //   const actionType = formData.get('actionType')?.toString() ?? '';
// //   const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
// //   const { goalDiscounts, discountId, id: ShopId } = shop;
// //   let goalDiscountsArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];

// //   if (
// //     [DiscountGoals.ADD, DiscountGoals.REMOVE, DiscountGoals.EDIT].includes(actionType as any) &&
// //     (!discountId || !discountId.id)
// //   ) {
// //     await ensureDiscountExists(admin, discountId?.id, ShopId);
// //   }

// //   switch (actionType) {
// //     case DiscountGoals.ADD:
// //       goalDiscountsArray.push(addGoals(formData, goalDiscountsArray) as GoalDiscountsValue);
// //       break;
// //     case DiscountGoals.REMOVE:
// //       goalDiscountsArray.splice(removeGoal(formData), 1);
// //       break;
// //     case DiscountGoals.EDIT:
// //       const { idx, goal } = editGoal(formData);
// //       goalDiscountsArray[idx] = goal;
// //       break;
// //     default:
// //       return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
// //   }

// //   const { metafieldsSet } = await requestMutation<{
// //     metafieldsSet: { userErrors: any[]; metafields: any[] };
// //   }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
// //     variables: { ShopId, value: JSON.stringify(goalDiscountsArray) },
// //   });

// //   const userErrors = metafieldsSet?.userErrors ?? [];
// //   const metafields = metafieldsSet?.metafields ?? [];

// //   if (userErrors.length > 0) {
// //     return json({ ok: false, userErrors }, { status: 400 });
// //   }
// //   return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
// // }

// // --- Action ---
// export async function action({ request }: ActionFunctionArgs) {
//   const { admin } = await authenticate.admin(request);
//   const formData = await request.formData();

//   // Get the shop data
//   const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
//   const { goalDiscounts, discountId, id: shopId } = shop;

//   // Parse existing goals or initialize empty array
//   let goalDiscountsArray: GoalDiscountsValue[] = goalDiscounts?.value
//     ? JSON.parse(goalDiscounts.value as string)
//     : [];

//   // Handle goal form submission from any of the forms
//   const goalData = formData.get('goalData')?.toString();
//   if (goalData) {
//     try {
//       // Parse the goal data from the form
//       const newGoal = JSON.parse(goalData);

//       // Validate the goal data based on its type
//       if (!newGoal.type || !['order', 'product', 'shipping'].includes(newGoal.type)) {
//         return json({ ok: false, error: 'Invalid goal type' }, { status: 400 });
//       }

//       // Add metadata
//       newGoal.id = newGoal.id || crypto.randomUUID();
//       newGoal.active = true;
//       newGoal.createdAt = new Date().toISOString();
//       newGoal.updatedAt = new Date().toISOString();

//       // Ensure discount exists
//       if (!discountId?.id) {
//         await ensureDiscountExists(admin, discountId?.id, shopId);
//       }

//       // Add the new goal to the array
//       goalDiscountsArray.push(newGoal);

//       // Save the updated goals array to Shopify
//       const { metafieldsSet } = await requestMutation<{
//         metafieldsSet: { userErrors: any[]; metafields: any[] };
//       }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
//         variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
//       });

//       const userErrors = metafieldsSet?.userErrors ?? [];
//       if (userErrors.length > 0) {
//         return json({ ok: false, userErrors }, { status: 400 });
//       }

//       return json({ ok: true, goalDiscounts: goalDiscountsArray });
//     } catch (error) {
//       console.error('Error processing goal submission:', error);
//       return json({ ok: false, error: 'Failed to process goal submission' }, { status: 400 });
//     }
//   }

//   // Handle other actions (ADD, REMOVE, EDIT)
//   const actionType = formData.get('actionType')?.toString() ?? '';
//   if (
//     [DiscountGoals.ADD, DiscountGoals.REMOVE, DiscountGoals.EDIT].includes(actionType as any) &&
//     (!discountId || !discountId.id)
//   ) {
//     await ensureDiscountExists(admin, discountId?.id, shopId);
//   }

//   switch (actionType) {
//     case DiscountGoals.ADD:
//       goalDiscountsArray.push(addGoals(formData, goalDiscountsArray) as GoalDiscountsValue);
//       break;
//     case DiscountGoals.REMOVE:
//       const indexToRemove = removeGoal(formData);
//       if (indexToRemove >= 0 && indexToRemove < goalDiscountsArray.length) {
//         goalDiscountsArray.splice(indexToRemove, 1);
//       }
//       break;
//     case DiscountGoals.EDIT:
//       const { idx, goal } = editGoal(formData);
//       if (idx >= 0 && idx < goalDiscountsArray.length) {
//         goalDiscountsArray[idx] = { ...goalDiscountsArray[idx], ...goal, updatedAt: new Date().toISOString() };
//       }
//       break;
//     default:
//       return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
//   }

//   // Save the updated goals array to Shopify
//   const { metafieldsSet } = await requestMutation<{
//     metafieldsSet: { userErrors: any[]; metafields: any[] };
//   }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
//     variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
//   });

//   const userErrors = metafieldsSet?.userErrors ?? [];
//   const metafields = metafieldsSet?.metafields ?? [];
//   if (userErrors.length > 0) {
//     return json({ ok: false, userErrors }, { status: 400 });
//   }

//   return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
// }

// // --- React UI ---
// export default function SpendingGoalPage() {
//   const { shopId, currencyCode, goalDiscountArray, products, error } =
//     useLoaderData<typeof loader>();
//   const fetcher = useFetcher<typeof action>();
//   const [selected, setSelected] = useState(0);

//   console.log(goalDiscountArray)

//   const handleTabChange = useCallback(
//     (selectedTabIndex: number) => setSelected(selectedTabIndex),
//     [],
//   );

//   // Loading state
//   if (!shopId || !currencyCode) {
//     return <LoadingFallback />;
//   }

//   // Error state
//   if (error) {
//     return <ErrorFallback error={error} />;
//   }

//   // Loading state for fetcher
//   const isLoading = fetcher.state !== 'idle' && fetcher.state !== 'submitting';

//   return (
//     <Frame>
//       <Page title="Cart Spending Goals" backAction={{ content: 'Back', url: '/app/index' }}>
//         <ProductsContextProvider Products={products ?? []}>
//           <BlockStack gap="400">
//             <Card>
//               <Tabs
//                 tabs={tabs}
//                 selected={selected}
//                 onSelect={handleTabChange}
//                 key={selected}
//               />
//             </Card>

//             {isLoading ? (
//               <FormLoadingFallback />
//             ) : (
//               <>
//                 {tabs[selected].content === DiscountKind.PRODUCT ? (
//                   <Suspense fallback={<FormLoadingFallback />}>
//                     <ProductGoalForm fetcher={fetcher} currencyCode={currencyCode} />
//                   </Suspense>
//                 ) : tabs[selected].content === DiscountKind.ORDER ? (
//                   <Suspense fallback={<FormLoadingFallback />}>
//                     <OrderGoalForm fetcher={fetcher} currencyCode={currencyCode} />
//                   </Suspense>
//                 ) : tabs[selected].content === DiscountKind.SHIPPING ? (
//                   <Suspense fallback={<FormLoadingFallback />}>
//                     <ShippingGoalForm fetcher={fetcher} currencyCode={currencyCode} />
//                   </Suspense>
//                 ) : (
//                   <EmptyState
//                     image=""
//                     heading="No Content Available"
//                     secondaryAction={{
//                       content: "Refresh Page",
//                       onAction: () => window.location.reload()
//                     }}
//                   >
//                     <Text as="p" variant="bodyMd">
//                       There was an issue loading this content. Please try again.
//                     </Text>
//                   </EmptyState>
//                 )}
//               </>
//             )}
//           </BlockStack>
//         </ProductsContextProvider>
//       </Page>
//     </Frame>
//   );
// }

import React, { useState, useCallback, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher, useNavigation } from '@remix-run/react';
import {
  Page,
  Card,
  BlockStack,
  Frame,
  Tabs,
  EmptyState,
  SkeletonPage,
  Banner,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  Text,
  Toast,
} from '@shopify/polaris';
import { authenticate, apiVersion } from '../models/shopify.server';
import { SHOP_AND_GOAL_QUERY, SET_GOAL_DISCOUNTS_METAFIELD } from '../graphql/meta_fields';
import { ensureDiscountExists } from '../utils/create-discount-function-existance';
import { DiscountGoals, DiscountKind } from '../enums/discount-goals';
import { requestMutation, requestQuery } from '../utils/requestGQL';
import type { GoalDiscountsValue, ShopData } from '../types/app_create-goal';
import { fetchAllProducts } from '../utils/fetchAllProducts';
import { addGoals, removeGoal, editGoal } from '../utils/goalOperations';
import { ProductsContextProvider } from '../context/productsContext';
import OrderGoalForm from '../components/forms/orderForm';
import ProductGoalForm from '../components/forms/productForm';
import ShippingGoalForm from '../components/forms/shippingForm';

// Fallback UI Components
function LoadingFallback() {
  return (
    <SkeletonPage title="Spending Goals" backAction primaryAction>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
}

function ErrorFallback({ error }: { error: string }) {
  return (
    <Page title="Error" backAction={{ content: 'Back', url: '/app/index' }}>
      <Layout>
        <Layout.Section>
          <Banner title="Error loading goals" tone="critical">
            <Text as="p">{error}</Text>
          </Banner>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

// Tabs configuration
const tabs = [
  {
    id: 'all-customers-1',
    content: DiscountKind.ORDER,
    accessibilityLabel: 'Order Goals',
    panelID: 'all-customers-content-1',
  },
  {
    id: 'accepts-marketing-1',
    content: DiscountKind.PRODUCT,
    panelID: 'accepts-marketing-content-1',
  },
  {
    id: 'repeat-customers-1',
    content: DiscountKind.SHIPPING,
    panelID: 'repeat-customers-content-1',
  },
];

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
        goalDiscountArray: goalDiscounts ? JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[] : [],
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

  // Handle goal form submission from any of the forms
  const goalData = formData.get('goalData')?.toString();
  if (goalData) {
    try {
      // Parse the goal data from the form
      const newGoal = JSON.parse(goalData);

      // Validate the goal data based on its type
      if (!newGoal.type || !['order', 'product', 'shipping'].includes(newGoal.type)) {
        return json({ ok: false, error: 'Invalid goal type' }, { status: 400 });
      }

      // Add metadata
      newGoal.id = newGoal.id ?? crypto.randomUUID();
      newGoal.active = true;
      newGoal.createdAt = new Date().toISOString();
      newGoal.updatedAt = new Date().toISOString();

      console.log("ensures", discountId);
      // Ensure discount exists
      if (discountId) {
        await ensureDiscountExists(admin, discountId.value, shopId);
      }
      // Add the new goal to the array
      goalDiscountsArray.push(newGoal);

      // Save the updated goals array to Shopify
      const { metafieldsSet } = await requestMutation<{
        metafieldsSet: { userErrors: any[]; metafields: any[] };
      }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
        variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
      });

      const userErrors = metafieldsSet?.userErrors ?? [];
      if (userErrors.length > 0) {
        return json({ ok: false, userErrors }, { status: 400 });
      }

      return json({ ok: true, goalDiscounts: goalDiscountsArray });
    } catch (error) {
      console.error('Error processing goal submission:', error);
      return json({ ok: false, error: 'Failed to process goal submission' }, { status: 400 });
    }
  }

  // Handle other actions (ADD, REMOVE, EDIT)
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
          // updatedAt: new Date().toISOString(),
        };
      }
      break;
    default:
      return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
  }

  // Save the updated goals array to Shopify
  const { metafieldsSet } = await requestMutation<{
    metafieldsSet: { userErrors: any[]; metafields: any[] };
  }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
    variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
  });

  const userErrors = metafieldsSet?.userErrors ?? [];
  const metafields = metafieldsSet?.metafields ?? [];
  if (userErrors.length > 0) {
    return json({ ok: false, userErrors }, { status: 400 });
  }

  return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
}

// --- React UI ---
export default function SpendingGoalPage() {
  const { shopId, currencyCode, goalDiscountArray, products, error } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const navigation = useNavigation();
  const [activeToast, setActiveToast] = useState<{ content: string; error?: boolean } | null>(null);
  const [selected, setSelected] = useState(0);

  console.log('goal creation', goalDiscountArray);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  // Show toast based on fetcher state
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.ok) {
        setActiveToast({
          content: 'Goal saved successfully!',
          error: false,
        });
      } else {
        const data = fetcher.data;

        setActiveToast({
          content: data && !data.ok && 'error' in data ? data.error : 'Failed to save goal',
          error: true,
        });
      }
    }
  }, [fetcher.state, fetcher.data, fetcher]);

  // Loading state for initial page load
  if (!shopId || !currencyCode) {
    return <LoadingFallback />;
  }

  // Error state
  if (error) {
    return <ErrorFallback error={error} />;
  }

  // Toast component
  const toastMarkup = activeToast ? (
    <Toast
      content={activeToast.content}
      onDismiss={() => setActiveToast(null)}
      error={activeToast.error}
    />
  ) : null;

  return (
    <Frame>
      {toastMarkup}
      <Page title="Cart Spending Goals" backAction={{ content: 'Back', url: '/app/index' }}>
        <ProductsContextProvider Products={products ?? []}>
          <BlockStack gap="400">
            <Card>
              <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} key={selected} />
            </Card>

            {/* Show loading state during form submission */}
            {navigation.state === 'submitting' ? (
              <Card>
                <BlockStack gap="400">
                  <SkeletonDisplayText size="medium" />
                  <SkeletonBodyText lines={6} />
                </BlockStack>
              </Card>
            ) : tabs[selected].content === DiscountKind.PRODUCT ? (
              <ProductGoalForm fetcher={fetcher} currencyCode={currencyCode} />
            ) : tabs[selected].content === DiscountKind.ORDER ? (
              <OrderGoalForm fetcher={fetcher} currencyCode={currencyCode} />
            ) : tabs[selected].content === DiscountKind.SHIPPING ? (
              <ShippingGoalForm fetcher={fetcher} currencyCode={currencyCode} />
            ) : (
              <EmptyState
                image=""
                heading="No Content Available"
                secondaryAction={{
                  content: 'Refresh Page',
                  onAction: () => window.location.reload(),
                }}
              >
                <Text as="p" variant="bodyMd">
                  There was an issue loading this content. Please try again.
                </Text>
              </EmptyState>
            )}
          </BlockStack>
        </ProductsContextProvider>
      </Page>
    </Frame>
  );
}
