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
} from "@shopify/polaris";
import { useCallback, useEffect, useMemo, useState } from "react";
import { authenticate } from "../shopify.server";
import { MyComponent } from "./MyComponent";

interface GoalDiscount {
  amount: number;
  discount: number;
}

// GraphQL queries and mutations
const SHOP_AND_GOAL_QUERY = `#graphql
  query ShopAndCartGoal {
    shop {
      id
      currencyCode
      metafield(namespace: "spending_goal", key: "goal_discounts") {
        id
        value
        type
      }
    }
  }
` as const;

const SET_GOAL_DISCOUNTS_MUTATION = `#graphql
  mutation SetGoalDiscounts($ownerId: ID!, $value: String!) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $ownerId,
          namespace: "spending_goal",
          key: "goal_discounts",
          type: "json",
          value: $value
        }
      ]
    ) {
      metafields { id namespace key value }
      userErrors { field message }
    }
  }
` as const;

// Loader to fetch shop metafield values
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
  const payload = await response.json();

  const shopId: string | undefined = payload?.data?.shop?.id;
  const currencyCode: string | undefined = payload?.data?.shop?.currencyCode ?? "USD";
  const metafield = payload?.data?.shop?.metafield;
  let goalDiscounts: Array<GoalDiscount> = [];

  if (metafield?.value) {
    try {
      goalDiscounts = JSON.parse(metafield.value);
    } catch {
      goalDiscounts = [];
    }
  }

  return json({ shopId, currencyCode, goalDiscounts });
}

// Action to append or remove goal/discount pair
export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const ownerId = String(formData.get("ownerId"));
  const actionType = formData.get("actionType");
  let goalDiscounts: Array<GoalDiscount> = [];

  // Fetch existing array
  const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
  const payload = await response.json();
  const metafield = payload?.data?.shop?.metafield;

  if (metafield?.value) {
    try {
      goalDiscounts = JSON.parse(metafield.value);
    } catch {
      goalDiscounts = [];
    }
  }

  if (actionType === "add") {
    const amountRaw = String(formData.get("cart_goal") ?? "");
    const discountRaw = String(formData.get("discount_percent") ?? "");
    const amountInt = Number.parseInt(amountRaw, 10) * 100;
    console.log(amountRaw,"amountRaw");
    console.log(amountInt,"amountInt");
    const discountInt = Number.parseInt(discountRaw, 10);

    if (Number.isFinite(amountInt) && Number.isFinite(discountInt)) {
      console.log(discountRaw,"discountRaw");
      console.log(discountInt,"discountInt");
      console.log(goalDiscounts,"goalDiscounts");
      const noDuplicate = goalDiscounts.some((pair) => (pair.amount === amountInt && pair.discount === discountInt));
      console.log(noDuplicate,"noDuplicate");
      if (!noDuplicate) {
        goalDiscounts.push({ amount: amountInt, discount: discountInt });
      }
    }
  } else if (actionType === "remove") {
    const removeIdx = Number(formData.get("removeIdx"));
    if (Number.isFinite(removeIdx)) {
      goalDiscounts = goalDiscounts.filter((_, idx) => idx !== removeIdx);
    }
  }

  // Save updated array
  const saveResponse = await admin.graphql(SET_GOAL_DISCOUNTS_MUTATION, {
    variables: { ownerId, value: JSON.stringify(goalDiscounts) },
  });

  const result = await saveResponse.json();
  const userErrors = result?.data?.metafieldsSet?.userErrors ?? [];
  const metafields = result?.data?.metafieldsSet?.metafields ?? [];

  if (userErrors.length > 0) {
    return json({ ok: false, userErrors }, { status: 400 });
  }

  return json({ ok: true, metafields, goalDiscounts });
}

// Polaris UI Component
export default function SpendingGoalPage() {
  const { shopId, currencyCode, goalDiscounts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();

  const submitting = fetcher.state !== "idle";
  const [goal, setGoal] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastError, setToastError] = useState<string | null>(null);

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
    console.log(fetcher.data,"fetcher.data");
  }, [fetcher.data]);

  const handleGoalChange = useCallback((val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    setGoal(digits);
  }, []);

  const handleDiscountChange = useCallback((val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    setDiscount(digits);
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
                  <InlineStack align="end">
                    <Button submit variant="primary">
                      Add goal & discount
                    </Button>
                  </InlineStack>
                </BlockStack>
              </fetcher.Form>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Current goal/discount pairs:
                </Text>
                {goalDiscounts.length === 0 ? (
                  <Text as="p" variant="bodyMd">
                    No pairs set yet.
                  </Text>
                ) : (
                  <>
                    {goalDiscounts.map((pair, idx) => (
                      <InlineStack key={idx} align="space-between" gap="400">
                        <Text as="p" variant="bodyMd">
                          Goal: {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: currencyCode,
                          }).format(pair.amount / 100)}, Discount: {pair.discount}%
                        </Text>
                        <fetcher.Form method="post">
                          <input type="hidden" name="ownerId" value={shopId ?? ""} />
                          <input type="hidden" name="actionType" value="remove" />
                          <input type="hidden" name="removeIdx" value={idx} />
                          <Button submit loading={submitting} variant="tertiary">
                            Remove  
                          </Button>
                        </fetcher.Form>
                      </InlineStack>
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
