import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher, useActionData } from '@remix-run/react';
import {
  Page,
  Card,
  BlockStack,
  TextField,
  Button,
  InlineStack,
  Toast,
  Frame,
  Text,
  ResourceList,
  ChoiceList,
  Layout,
  Avatar,
  ResourceItem,
} from '@shopify/polaris';

import { authenticate, apiVersion } from '../models/shopify.server';

import { SHOP_AND_GOAL_QUERY, SET_GOAL_DISCOUNTS_METAFIELD } from '../graphql/meta_fields';
import type {
  ShopData,
  GoalDiscountsValue,
  RootResult,
  ProductsData,
} from '../types/app_create-goal';

import type { AdminApiContextWithoutRest } from 'node_modules/@shopify/shopify-app-remix/dist/ts/server/clients';
import { ensureDiscountExists } from 'app/utils/create-discount-function-existance';
import GoalEditModal from 'app/components/goalEditModal';
import { DiscountGoals } from 'app/enums/discount-goals';
import { GET_PRODUCTS_WITH_CURSOR } from 'app/graphql/products';
import ProductSelectionModal from '../components/ProductSelectionModal';
import SpendingGoalWidget from 'app/components/example';
import GoalCard from 'app/components/goal_card';

// --- Helper Functions ---

const ShopDetails = {
  url: '',
  accessToken: '',
  apiVersion: '',
};

function ShopDetailsSetter(domain: string, accessToken: string | undefined, apiVersion: string) {
  if (!accessToken) return;
  ShopDetails.url = domain;
  ShopDetails.accessToken = accessToken;
  ShopDetails.apiVersion = apiVersion;
}

export async function requestQuery<T>(
  admin: AdminApiContextWithoutRest,
  query: string,
): Promise<T> {
  const response = await admin.graphql(query);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
}

export async function requestMutation<T>(
  admin: AdminApiContextWithoutRest,
  query: string,
  variables: Record<string, any>,
): Promise<T> {
  const response = await admin.graphql(query, variables);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
}

// --- Loader ---

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  try {
    const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
    if (shop) {
      const { id: shopId, url, currencyCode, goalDiscounts, discountId } = shop;
      ShopDetailsSetter(url, session?.accessToken, apiVersion);
      const goalDiscountArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];

      const variables = { first: 10, after: null };
      const { products, pageInfo } = await fetchAllProducts(admin, 200, null);

      return {
        shopId,
        currencyCode,
        goalDiscountArray,
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
  const ownerId = formData.get('ownerId')?.toString() ?? '';
  const actionType = formData.get('actionType')?.toString() ?? '';

  // Fetch existing metafields
  const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
  const { goalDiscounts, discountId } = shop;
  let goalDiscountsArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];

  // Only call ensureDiscountExists if discountId is missing or invalid
  if (
    [DiscountGoals.ADD, DiscountGoals.REMOVE, DiscountGoals.EDIT].includes(actionType as any) &&
    (!discountId || !discountId.id)
  ) {
    await ensureDiscountExists(admin, discountId?.id, ownerId);
  }

  // Handle add/remove/edit
  switch (actionType) {
    case 'products':
      const { products, pageInfo } = await fetchAllProducts(admin, 200, null, []);
      console.log(JSON.stringify(products));
      return;
    case DiscountGoals.ADD:
      goalDiscountsArray.push(addGoals(formData, goalDiscountsArray) as GoalDiscountsValue);
      break;
    case DiscountGoals.REMOVE:
      goalDiscountsArray.splice(removeGoal(formData), 1);
      break;
    case DiscountGoals.EDIT:
      const { idx, goal } = editGoal(formData);
      goalDiscountsArray[idx] = goal;
      break;
    default:
      return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
  }

  // Save updated array
  const { metafieldsSet } = await requestMutation<{
    metafieldsSet: { userErrors: any[]; metafields: any[] };
  }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
    variables: { ownerId, value: JSON.stringify(goalDiscountsArray) },
  });

  const userErrors = metafieldsSet?.userErrors ?? [];
  const metafields = metafieldsSet?.metafields ?? [];

  if (userErrors.length > 0) {
    return json({ ok: false, userErrors }, { status: 400 });
  }

  return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
}

function addGoals(formData: FormData, goalDiscountsArray: GoalDiscountsValue[]) {
  const goalName = formData.get('goal_name') ?? '';
  const amountRaw = formData.get('cart_goal') ?? '';
  const discountRaw = formData.get('discount_percent') ?? '';
  const successMessageRaw = formData.get('success_message') ?? '';
  const progressMessageRaw = formData.get('progress_message') ?? '';

  const amountInt = Number.parseInt(amountRaw as string, 10) * 100;
  const discountInt = Number.parseInt(discountRaw as string, 10);

  if (
    Number.isFinite(amountInt) &&
    Number.isFinite(discountInt) &&
    !goalDiscountsArray.some((pair) => pair.amount === amountInt)
  ) {
    return {
      name: goalName.toString(),
      amount: amountInt,
      discount: discountInt,
      successMessage: successMessageRaw.toString(),
      progressMessage: progressMessageRaw.toString(),
    };
  }
}

function removeGoal(formData: FormData) {
  const removeIdx = Number(formData.get('removeIdx'));
  return removeIdx;
}

function editGoal(formData: FormData) {
  const editingIndexRaw = formData.get('editingIndex');
  const editingIndex = typeof editingIndexRaw === 'string' ? parseInt(editingIndexRaw, 10) : NaN;
  const cartGoalName = formData.get('goal_name') ?? '';
  const cartGoalRaw = formData.get('cart_goal') ?? '';
  const discountPercentRaw = formData.get('discount_percent') ?? '';
  const successMessageRaw = formData.get('success_message') ?? '';
  const progressMessageRaw = formData.get('progress_message') ?? '';

  return {
    idx: editingIndex,
    goal: {
      name: cartGoalName.toString(),
      amount: Number.parseInt(cartGoalRaw as string, 10) * 100,
      discount: Number.parseInt(discountPercentRaw as string, 10),
      successMessage: successMessageRaw.toString(),
      progressMessage: progressMessageRaw.toString(),
    },
  };
}

//--- Products ---
async function fetchAllProducts(
  admin: AdminApiContextWithoutRest,
  first: number = 200,
  after: string | null = null,
  accumulated: ProductsData['products']['edges'] = [],
): Promise<{
  products: ProductsData['products']['edges'];
  pageInfo: ProductsData['products']['pageInfo'];
}> {
  const variables = { first, after };
  const { products: ProductsData } = await requestMutation<ProductsData>(
    admin,
    GET_PRODUCTS_WITH_CURSOR,
    { variables },
  );
  const { edges: products, pageInfo } = ProductsData;
  const allProducts = [...accumulated, ...products];

  if (pageInfo.hasNextPage && products.length > 0) {
    const lastCursor = products[products.length - 1]?.cursor;
    return fetchAllProducts(admin, first, lastCursor, allProducts);
  }

  return { products: allProducts, pageInfo };
}

// --- React UI ---

export default function SpendingGoalPage() {
  const { shopId, currencyCode, goalDiscountArray, products, pageInfo, error } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  // const actionData = useActionData<typeof action>();

  const submitting =
    fetcher.state !== 'idle' && fetcher?.formData?.get('actionType') === DiscountGoals.ADD;
  const [goalName, setGoalName] = useState<string>('');
  const [goal, setGoal] = useState<string>('');
  const [discount, setDiscount] = useState<string>('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('🎉 You unlocked {discount}% off!');
  const [progressMessage, setProgressMessage] = useState<string>(
    'Spend {amountLeft} more to unlock {discount}% off ({percent}% progress)',
  );
  const [goalError, setGoalError] = useState<string | undefined>(undefined);

  // edit
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // products browse modal
  const [openProductsModal, setOpenProductsModal] = useState(false);

  const [Radio, setRadio] = useState<string[]>(['none']);

  // product selection
  // const [productSelectionModalOpen, setProductSelectionModalOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      if ((fetcher.data as any).ok) {
        setToastError(null);
        setToastOpen(true);
        setGoal('');
        setDiscount('');
      } else if ((fetcher.data as any).userErrors?.length) {
        const first = (fetcher.data as any).userErrors[0];
        setToastError(first?.message ?? 'Something went wrong');
        setToastOpen(true);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (fetcher.state === 'idle') {
      setRemovingIndex(null);
      setEditingIndex(null);
      setEditModalOpen(false);
    }
  }, [fetcher.state]);
  // Handle edit button click
  const handleEditClick = (idx: number) => {
    setEditingIndex(idx);
    setEditModalOpen(true);
  };

  // Handle edit modal submit
  const handleEditSubmit = (e: React.FormEvent, goal: GoalDiscountsValue) => {
    e.preventDefault();
    fetcher.submit(
      {
        ownerId: shopId ?? '',
        actionType: 'edit',
        editingIndex: editingIndex,
        goal_name: goal.name,
        cart_goal: goal.amount,
        discount_percent: goal.discount,
        success_message: goal.successMessage,
        progress_message: goal.progressMessage,
      },
      { method: 'post' },
    );
  };

  const handleGoalChange = useCallback(
    (val: string) => {
      const cleaned = val.replace(/[^0-9]/g, '');
      const numericValue = Number(cleaned);

      if (isNaN(numericValue)) {
        setGoalError('Invalid number.');
        setGoal('');
        return;
      }

      const amountInCents = numericValue * 100;
      const exists = goalDiscountArray.some((pair) => pair?.amount === amountInCents);

      if (exists) {
        setGoalError('This amount already exists.');
      } else {
        setGoalError(undefined);
      }

      setGoal(cleaned);
    },
    [goalDiscountArray],
  );

  const handleChoiceListChange = useCallback((value: string[]) => setRadio(value), []);

  const handleDiscountChange = useCallback((val: string) => {
    setDiscount(val.replace(/[^0-9]/g, ''));
  }, []);

  const toastMarkup = useMemo(() => {
    if (!toastOpen) return null;
    return (
      <Toast
        content={toastError ? `Error: ${toastError}` : 'Goal/discount pair saved'}
        error={Boolean(toastError)}
        onDismiss={() => setToastOpen(false)}
      />
    );
  }, [toastOpen, toastError]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Frame>
      <Page title="Cart Spending Goals">
        <BlockStack gap="400">
          <Card>
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                Add multiple goal/discount pairs. Each pair is appended to the metafield array.
              </Text>
              <fetcher.Form method="post">
                <input type="hidden" name="ownerId" value={shopId ?? ''} />
                <input type="hidden" name="actionType" value="add" />
                <BlockStack gap="400">
                  <TextField
                    label={`Cart goal Name`}
                    name="goal_name"
                    value={goalName}
                    onChange={setGoalName}
                    autoComplete="off"
                    inputMode="text"
                    helpText="Goal Name"
                  />
                  <TextField
                    label={`Cart goal (${currencyCode})`}
                    name="cart_goal"
                    value={goal}
                    onChange={handleGoalChange}
                    autoComplete="off"
                    inputMode="numeric"
                    helpText="Saved as amount (integer, cents)"
                    error={goalError}
                  />
                  <TextField
                    label="Discount percentage (integer)"
                    name="discount_percent"
                    value={discount}
                    onChange={handleDiscountChange}
                    autoComplete="off"
                    inputMode="numeric"
                    helpText="Saved as discount (integer, percent)"
                  />
                  <TextField
                    label="Success Message"
                    name="success_message"
                    value={successMessage}
                    onChange={setSuccessMessage}
                    autoComplete="off"
                    helpText="Shown when a goal is reached. Use {discount} for discount value."
                  />
                  <TextField
                    label="Progress Message"
                    name="progress_message"
                    value={progressMessage}
                    onChange={setProgressMessage}
                    autoComplete="off"
                    helpText="Shown before reaching a goal. Use {amountLeft}, {discount}, {percent}."
                  />
                  <InlineStack align="end">
                    <Button submit loading={submitting} variant="primary">
                      Add goal & discount
                    </Button>
                  </InlineStack>
                </BlockStack>
              </fetcher.Form>

              <BlockStack>
                <SpendingGoalWidget />
              </BlockStack>

              <BlockStack>
                <Layout>
                  <Layout.Section>
                    <ResourceList
                      resourceName={{ singular: 'product', plural: 'products' }}
                      items={products ?? []}
                      renderItem={(item) => {
                        const { id, title, featuredMedia } = item.node;
                        const media = (
                          <Avatar
                            size="md"
                            name={title}
                            source={featuredMedia?.preview?.image?.url}
                          />
                        );

                        return (
                          <ResourceItem
                            id={id}
                            url="#"
                            media={media}
                            accessibilityLabel={`View details for ${title}`}
                          >
                            <Text variant="bodyMd" fontWeight="bold" as="h3">
                              {title}
                            </Text>
                          </ResourceItem>
                        );
                      }}
                    />
                  </Layout.Section>
                </Layout>
              </BlockStack>

              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Current goal/discount pairs:
                </Text>
                {goalDiscountArray.length === 0 ? (
                  <Text as="p" variant="bodyMd">
                    No pairs set yet.
                  </Text>
                ) : (
                  <>
                    {goalDiscountArray.map((pair, idx) => (
                      <React.Fragment key={idx}>
                        <GoalCard
                          goal={pair!}
                          index={idx}
                          currencyCode={currencyCode}
                          isEditModalOpen={editModalOpen}
                          setEditModalOpen={setEditModalOpen}
                          removingIndex={removingIndex}
                          setRemovingIndex={setRemovingIndex}
                          onEditClick={() => handleEditClick(idx)}
                          editingIndex={editingIndex}
                          fetcher={fetcher}
                          shopId={shopId}
                        />
                        {editModalOpen && editingIndex === idx && (
                          <GoalEditModal
                            editModalOpen={true}
                            setEditModalOpen={setEditModalOpen}
                            goal={pair as GoalDiscountsValue}
                            setGoal={handleEditSubmit}
                          />
                        )}
                      </React.Fragment>
                      // <Card key={idx} padding="400">
                      //   <BlockStack gap="200">
                      //     <Text as="h4" variant="bodySm" tone="success">
                      //       Goal Name: {pair && pair.name ? pair.name : ''}
                      //     </Text>
                      //     <Text as="h4" variant="headingSm" tone="success">
                      //       Amount: {Number(pair?.amount) / 100}
                      //     </Text>
                      //     <Text as="h4" variant="headingSm">
                      //       Amount:{' '}
                      //       {pair
                      //         ? new Intl.NumberFormat(
                      //             typeof navigator !== 'undefined' ? navigator.language : 'en-IN',
                      //             {
                      //               style: 'currency',
                      //               currency: currencyCode,
                      //             },
                      //           ).format(Number(pair.amount) / 100)
                      //         : '-'}
                      //     </Text>

                      //     <Text as="h4" variant="headingSm" tone="success">
                      //       Discount: {pair ? pair.discount : '-'}%
                      //     </Text>
                      //     <Text as="p" variant="bodySm" tone="subdued">
                      //       Progress Message:{' '}
                      //       <span style={{ fontStyle: 'italic' }}>
                      //         {pair && pair.progressMessage ? pair.progressMessage : ''}
                      //       </span>
                      //     </Text>
                      //     <Text as="p" variant="bodySm" tone="success">
                      //       Success Message:{' '}
                      //       <span style={{ fontWeight: 500 }}>
                      //         {pair && pair.successMessage ? pair.successMessage : ''}
                      //       </span>
                      //     </Text>
                      //     <InlineStack align="end">
                      //       <Button variant="secondary" onClick={() => handleEditClick(idx)}>
                      //         Edit
                      //       </Button>
                      //       {editModalOpen && editingIndex === idx && (
                      //         <GoalEditModal
                      //           editModalOpen={true}
                      //           setEditModalOpen={setEditModalOpen}
                      //           goal={pair as GoalDiscountsValue}
                      //           setGoal={handleEditSubmit}
                      //         />
                      //       )}
                      //       <fetcher.Form method="post" onSubmit={() => setRemovingIndex(idx)}>
                      //         <input type="hidden" name="ownerId" value={shopId ?? ''} />
                      //         <input type="hidden" name="actionType" value="remove" />
                      //         <input type="hidden" name="removeIdx" value={idx} />
                      //         <Button
                      //           submit
                      //           variant="tertiary"
                      //           loading={removingIndex === idx && fetcher.state !== 'idle'}
                      //         >
                      //           Remove
                      //         </Button>
                      //       </fetcher.Form>
                      //     </InlineStack>
                      //   </BlockStack>
                      // </Card>
                    ))}
                  </>
                )}
              </BlockStack>
            </BlockStack>
          </Card>
        </BlockStack>
      </Page>
      {toastMarkup}
    </Frame>
  );
}
