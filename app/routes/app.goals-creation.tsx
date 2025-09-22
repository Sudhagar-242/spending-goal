import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
  Modal,
} from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";
import shopify,{ authenticate,apiVersion } from "../models/shopify.server";

import {
  SHOP_AND_GOAL_QUERY,
  SET_GOAL_DISCOUNTS_METAFIELD,
  SET_DISCOUNT_ID_METAFIELD,
} from "../graphql/meta_fields";
import {
  CREATE_AUTOMATIC_DISCOUNT_MUTATION,
  UPDATE_AUTOMATIC_DISCOUNT_MUTATION,
} from "../graphql/discount_function";
import type { UserError } from "app/types/admin.types";
import type {
  ShopData,
  GoalDiscountsValue,
  RootResult,
  Shop,
  discountAutomaticAppCreate,
  GoalDiscounts,
} from "../types/app_create-goal";
import type { AdminApiContextWithoutRest } from "@shopify/shopify-app-remix/dist/ts/server/clients";
import { ensureDiscountExists } from "app/utils/create-discount-function-existance";
import GoalEditModal from "app/components/goalEditModal";
import ScrollableProducts from "../components/ScrollableProducts";

// --- Helper Functions ---

const ShopDetails = {
  url: "",
  accessToken: "",
  apiVersion: "",
}

function ShopDetailsSetter(domain: string, accessToken: string | undefined, apiVersion: string) {
  if(!accessToken) return;
  ShopDetails.url = domain;
  ShopDetails.accessToken = accessToken;
  ShopDetails.apiVersion = apiVersion;
}

async function requestQuery<T>(
  admin: AdminApiContextWithoutRest,
  query: string,
): Promise<T> {
  const response = await admin.graphql(query);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
}

async function requestMutation<T>(
  admin: AdminApiContextWithoutRest,
  query: string,
  variables: Record<string, any>,
): Promise<T> {
  const response = await admin.graphql(query, variables);
  const data = (await response.json()) as RootResult<T>;
  return data?.data;
}

function parseGoalDiscounts(value: string | null | undefined): GoalDiscountsValue[] {
  if (!value) return [];
  try {
    return JSON.parse(value) as GoalDiscountsValue[];
  } catch {
    return [];
  }
}

// --- Loader ---

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  try {
    const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
    if (shop) {
      const {
        id: shopId,
        url,
        currencyCode,
        goalDiscounts,
        discountId,
      } = shop;
      ShopDetailsSetter(url,session?.accessToken,apiVersion);
      console.log({...ShopDetails})
      console.log("Discount ID",{...discountId})
      const goalDiscountArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];
      return { shopId, currencyCode, goalDiscountArray, discountId, error: "" };
    }
    return {
      shopId: "",
      currencyCode: "",
      goalDiscountArray: [],
      discountId: "",
      error: "Shop metafield not available",
    };
  } catch (error) {
    console.error("Error in loader:", error.message);
    return {
      shopId: "",
      currencyCode: "",
      goalDiscountArray: [],
      discountId: "",
      error: `Error in loader: ${error}`,
    };
  }
}

// --- Action ---

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const ownerIdRaw = formData.get("ownerId");
  const actionTypeRaw = formData.get("actionType");
  const ownerId = typeof ownerIdRaw === "string" ? ownerIdRaw : "";
  const actionType = typeof actionTypeRaw === "string" ? actionTypeRaw : "";

  // Fetch existing metafields
  const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
  const { goalDiscounts, discountId } = shop;
  let goalDiscountsArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];

  // Ensure discount exists
  await ensureDiscountExists(admin, discountId.id, ownerId);

  // Handle add/remove
  if (actionType === "add") {
    const amountRaw = formData.get("cart_goal") ?? "";
    const discountRaw = formData.get("discount_percent") ?? "";
    const successMessageRaw = formData.get("success_message") ?? "";
    const progressMessageRaw = formData.get("progress_message") ?? "";

    const amountInt = Number.parseInt(amountRaw as string, 10) * 100;
    const discountInt = Number.parseInt(discountRaw as string, 10);

    if (
      Number.isFinite(amountInt) &&
      Number.isFinite(discountInt) &&
      !goalDiscountsArray.some(
        (pair) => pair.amount === amountInt && pair.discount === discountInt
      )
    ) {
      goalDiscountsArray.push({
        amount: amountInt,
        discount: discountInt,
        successMessage: successMessageRaw.toString(),
        progressMessage: progressMessageRaw.toString(),
      });
    }
  } else if (actionType === "remove") {
    const removeIdx = Number(formData.get("removeIdx"));
    if (Number.isFinite(removeIdx)) {
      goalDiscountsArray = goalDiscountsArray.filter((_, idx) => idx !== removeIdx);
    }
  } else if (actionType === "edit") {
    const editingIndexRaw = formData.get("editingIndex");
    const editingIndex = typeof editingIndexRaw === "string" ? parseInt(editingIndexRaw, 10) : NaN;
    const cartGoalRaw = formData.get("cart_goal") ?? "";
    const discountPercentRaw = formData.get("discount_percent") ?? "";
    const successMessageRaw = formData.get("success_message") ?? "";
    const progressMessageRaw = formData.get("progress_message") ?? "";
    goalDiscountsArray = goalDiscountsArray.map((pair, idx) => {
      if (idx === editingIndex) {
        return {
          amount: Number.parseInt(cartGoalRaw as string, 10) * 100,
          discount: Number.parseInt(discountPercentRaw as string, 10),
          successMessage: successMessageRaw.toString(),
          progressMessage: progressMessageRaw.toString(),
        };
      }
      return pair;
    });
  }

  // Save updated array
  const saveResponse = await admin.graphql(SET_GOAL_DISCOUNTS_METAFIELD, {
    variables: { ownerId, value: JSON.stringify(goalDiscountsArray) },
  });
  const result = await saveResponse.json();
  const userErrors = result?.data?.metafieldsSet?.userErrors ?? [];
  const metafields = result?.data?.metafieldsSet?.metafields ?? [];

  if (userErrors.length > 0) {
    return json({ ok: false, userErrors }, { status: 400 });
  }

  return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
}

// --- Discount Helpers ---

// async function ensureDiscountExists(admin, discountId, ownerId) {
//   const now = new Date().toISOString();
//   const discountInput = {
//     title: "$5 discount",
//     functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
//     startsAt: now,
//     discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
//     combinesWith: {
//       orderDiscounts: true,
//       productDiscounts: true,
//       shippingDiscounts: true,
//     },
//   };

//   async function createDiscount() {
//     const response = await admin.graphql(CREATE_AUTOMATIC_DISCOUNT_MUTATION, {
//       variables: { discountInput },
//     });
//     const data = (await response.json()).data?.discountAutomaticAppCreate;
//     const userErrors = data?.userErrors || [];
//     if (userErrors.length > 0) {
//       console.error("Discount creation errors:", userErrors);
//       return { success: false, errors: userErrors };
//     }
//     if (data?.automaticAppDiscount?.discountId) {
//       await admin.graphql(SET_DISCOUNT_ID_METAFIELD, {
//         variables: { ownerId, discountData: data.automaticAppDiscount.discountId },
//       });
//       return { success: true, discountId: data.automaticAppDiscount.discountId };
//     }
//     return { success: false };
//   }

//   async function updateDiscount(id) {
//     try {
//       const response = await admin.graphql(UPDATE_AUTOMATIC_DISCOUNT_MUTATION, {
//         variables: { id, discountInput },
//       });
//       const updateRes = await response.json();
//       const userErrors =
//         updateRes.data?.discountAutomaticAppUpdate?.userErrors || [];
//       if (
//         userErrors.some((error) => error.message === "Discount does not exist.")
//       ) {
//         return { notFound: true };
//       }
//       if (userErrors.length > 0) {
//         console.error("Discount update errors:", userErrors);
//         return { success: false, errors: userErrors };
//       }
//       return { success: true };
//     } catch (err) {
//       console.error("Error updating discount:", err);
//       return { success: false, errors: [err] };
//     }
//   }

//   if (!discountId) {
//     return await createDiscount();
//   } else {
//     const updateResult = await updateDiscount(discountId);
//     if (updateResult.notFound) {
//       return await createDiscount();
//     }
//     return updateResult;
//   }
// }

// --- React UI ---

export default function SpendingGoalPage() {
  const { shopId, currencyCode, goalDiscountArray, error } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const submitting = fetcher.state !== "idle";
  const [rerender, setRerender] = useState(false)
  const [goal, setGoal] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("🎉 You unlocked {discount}% off!");
  const [progressMessage, setProgressMessage] = useState<string>("Spend {amountLeft} more to unlock {discount}% off ({percent}% progress)");

const [shopDetailsReady, setShopDetailsReady] = useState(false);
const [shopUrl, setShopUrl] = useState('');
const [apiVersionState, setApiVersionState] = useState('');
const [accessToken, setAccessToken] = useState('');


// edit 

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data) {
      if ((fetcher.data as any).ok) {
        setToastError(null);
        setToastOpen(true);
        setGoal("");
        setDiscount("");
      } else if ((fetcher.data as any).userErrors?.length) {
        const first = (fetcher.data as any).userErrors[0];
        setToastError(first?.message ?? "Something went wrong");
        setToastOpen(true);
      }
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (fetcher.state === "idle") {
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

 useEffect(() => {
  if (ShopDetails.url && ShopDetails.apiVersion && ShopDetails.accessToken) {
    setShopUrl(ShopDetails.url);
    setApiVersionState(ShopDetails.apiVersion);
    setAccessToken(ShopDetails.accessToken);
    setShopDetailsReady(true); // ✅ Trigger re-render
  }
}, []);

  

  // Handle edit modal submit
  const handleEditSubmit = (e: React.FormEvent,goal: GoalDiscountsValue) => {
    e.preventDefault();
    fetcher.submit({
      ownerId: shopId ?? "",
      actionType: "edit",
      editingIndex: editingIndex,
      cart_goal: goal.amount,
      discount_percent: goal.discount,
      success_message: goal.successMessage,
      progress_message: goal.progressMessage,
    }, { method: "post" });
  };

  const handleGoalChange = useCallback((val: string) => {
    setGoal(val.replace(/[^0-9]/g, ""));
  }, []);

  const handleDiscountChange = useCallback((val: string) => {
    setDiscount(val.replace(/[^0-9]/g, ""));
  }, []);

  const toastMarkup = useMemo(() => {
    if (!toastOpen) return null;
    return (
      <Toast
        content={toastError ? `Error: ${toastError}` : "Goal/discount pair saved"}
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
                <input type="hidden" name="ownerId" value={shopId ?? ""} />
                <input type="hidden" name="actionType" value="add" />
                <BlockStack gap="400">
                  <TextField
                    label={`Cart goal (${currencyCode})`}
                    name="cart_goal"
                    value={goal}
                    onChange={handleGoalChange}
                    autoComplete="off"
                    inputMode="numeric"
                    helpText="Saved as amount (integer, cents)"
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
              <BlockStack gap="200">
                <BlockStack gap="200">
                  {shopDetailsReady ? (
  <ScrollableProducts
    ShopUrl={shopUrl}
    ApiVersion={apiVersionState}
    AccessToken={accessToken}
  />
) : (
  <Text as="p" variant="bodyMd" tone="subdued">
    Loading products... (Shop details not available yet)
  </Text>
)}

                </BlockStack>
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
                      <Card key={idx} padding="400">
                        <BlockStack gap="200">
                          <Text as="h4" variant="headingSm">
                            Amount: {pair ? new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: currencyCode,
                            }).format(Number(pair.amount) / 100) : "-"}
                          </Text>
                          <Text as="h4" variant="headingSm" tone="success">
                            Discount: {pair ? pair.discount : "-"}%
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Progress Message: <span style={{ fontStyle: "italic" }}>{pair && pair.progressMessage ? pair.progressMessage : ""}</span>
                          </Text>
                          <Text as="p" variant="bodySm" tone="success">
                            Success Message: <span style={{ fontWeight: 500 }}>{pair && pair.successMessage ? pair.successMessage : ""}</span>
                          </Text>
                          <InlineStack align="end">
                            <Button
                              variant="secondary"
                              onClick={() => handleEditClick(idx)}
                            >
                              Edit
                            </Button>
                            {editModalOpen && editingIndex === idx && (
                              <GoalEditModal
                                editModalOpen={true}
                                setEditModalOpen={setEditModalOpen}
                                goal={pair as GoalDiscountsValue}
                                setGoal={handleEditSubmit}
                              />
                            )}
                            <fetcher.Form
                              method="post"
                              onSubmit={() => setRemovingIndex(idx)}
                            >
                              <input type="hidden" name="ownerId" value={shopId ?? ""} />
                              <input type="hidden" name="actionType" value="remove" />
                              <input type="hidden" name="removeIdx" value={idx} />
                              <Button
                                submit
                                variant="tertiary"
                                loading={removingIndex === idx && fetcher.state !== "idle"}
                              >
                                Remove
                              </Button>
                            </fetcher.Form>
                          </InlineStack>
                        </BlockStack>
                      </Card>
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