// import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useLoaderData, useFetcher } from "@remix-run/react";
// import {
//   Page,
//   Card,
//   BlockStack,
//   TextField,
//   Button,
//   InlineStack,
//   Toast,
//   Frame,
//   Text,
// } from "@shopify/polaris";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import { authenticate } from "../models/shopify.server";

// // GraphQL queries and mutations
// const SHOP_AND_GOAL_QUERY = `#graphql
//   query ShopAndCartGoal {
//     shop {
//       id
//       currencyCode
//       goalDiscounts: metafield(namespace: "spending_goal", key: "goal_discounts") {
//         id
//         value
//         type
//       }
//       discountId: metafield(namespace: "spending_goal", key: "discount_id") {
//         id
//         value
//         type
//       }
//     }
//   }
// `;

// const SET_DISCOUNT_GOAL_DISCOUNTS_MUTATION = `#graphql
//   mutation SetGoalDiscounts($ownerId: ID!, $value: String!) {
//     metafieldsSet(
//       metafields: [
//         {
//           ownerId: $ownerId,
//           namespace: "spending_goal",
//           key: "goal_discounts",
//           type: "json",
//           value: $value
//         }
//       ]
//     ) {
//       metafields { id namespace key value }
//       userErrors { field message }
//     }
//   }
// `;

// const SET_DISCOUNT_ID_MUTATION = `#graphql
//   mutation SetDiscountId($ownerId: ID!, $discountId: String!) {
//     metafieldsSet(
//       metafields: [
//         {
//           ownerId: $ownerId,
//           namespace: "spending_goal",
//           key: "discount_id",
//           type: "single_line_text_field",
//           value: $discountId
//         }
//       ]
//     ) {
//       metafields { id namespace key value }
//       userErrors { field message }
//     }
//   }
// `;

// const CREATE_AUTOMATIC_DISCOUNT_MUTATION = `#graphql
//   mutation CreateAutomaticDiscount($discountInput: DiscountAutomaticAppInput!) {
//     discountAutomaticAppCreate(automaticAppDiscount: $discountInput) {
//       automaticAppDiscount {
//         discountId
//       }
//       userErrors { field message }
//     }
//   }
// `;

// const UPDATE_AUTOMATIC_DISCOUNT_MUTATION = `#graphql
//   mutation UpdateAutomaticDiscount($id: ID!,$discountInput: DiscountAutomaticAppInput!) {
//     discountAutomaticAppUpdate(id: $id,automaticAppDiscount: $discountInput) {
//       automaticAppDiscount {
//         discountId
//       }
//       userErrors { field message }
//     }
//   }
// `;


// // async function fetchMetafields(admin: any): Promise<{ goalDiscounts: GoalDiscount[]; discountId: string | null }> {
// //   const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
// //   const payload = await response.json();

// //   const shop = payload?.data?.shop;
// //   const goalDiscountsMetafield = shop?.goalDiscounts ?? '';
// //   const discountIdMetafield = shop?.discountId ?? '';
// //   let discountId = discountIdMetafield?.value ?? null;

// //   let goalDiscounts: GoalDiscount[] = [];
// //   if (goalDiscountsMetafield?.value) {
// //     try {
// //       goalDiscounts = JSON.parse(goalDiscountsMetafield.value);
// //     } catch {
// //       goalDiscounts = [];
// //     }
// //   }

// //   return { goalDiscounts, discountId };
// // }


// // async function createDiscount(admin: any, ownerId: string): Promise<string | null> {
// //   const now = new Date().toISOString();
// //   const createResp = await admin.graphql(CREATE_AUTOMATIC_DISCOUNT_MUTATION, {
// //     variables: {
// //       discountInput: {
// //         title: "$5 discount",
// //         functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
// //         startsAt: now,
// //         discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
// //         combinesWith: {
// //           orderDiscounts: true,
// //           productDiscounts: true,
// //           shippingDiscounts: true,
// //         },
// //       },
// //     },
// //   });

// //   const createData = await createResp.json();
// //   const discountData = createData?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
// //   const userErrors = createData?.data?.discountAutomaticAppCreate?.userErrors || [];

// //   if (userErrors.length > 0) {
// //     console.error("Discount creation errors:", userErrors);
// //     throw new Error("Discount creation failed");
// //   }

// //   if (discountData && discountData.discountId) {
// //     await admin.graphql(SET_DISCOUNT_ID_MUTATION, {
// //       variables: { ownerId, discountId: discountData.discountId },
// //     });
// //     return discountData.discountId;
// //   }

// //   return null;
// // }


// // async function updateOrCreateDiscount(admin: any, ownerId: string, discountId: string): Promise<string> {
// //   const now = new Date().toISOString();

// //   try {
// //     const updateReq = await admin.graphql(UPDATE_AUTOMATIC_DISCOUNT_MUTATION, {
// //       variables: {
// //         id: discountId,
// //         discountInput: {
// //           title: "$5 discount",
// //           functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
// //           startsAt: now,
// //           discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
// //           combinesWith: {
// //             orderDiscounts: true,
// //             productDiscounts: true,
// //             shippingDiscounts: true,
// //           },
// //         },
// //       },
// //     });

// //     const updateRes = await updateReq.json();

// //     const userErrors = updateRes.data.discountAutomaticAppUpdate.userErrors || [];
// //     if (
// //       userErrors.some((error: { message: string }) => error.message === "Discount does not exist.")
// //     ) {
// //       // Discount doesn't exist, so create new
// //       return await createDiscount(admin, ownerId) ?? discountId;
// //     }

// //     return discountId;
// //   } catch (err) {
// //     console.error("Error updating discount:", err);
// //     throw err;
// //   }
// // }

// // function modifyGoalDiscounts(
// //   goalDiscounts: GoalDiscount[],
// //   actionType: string | null,
// //   formData: FormData
// // ): GoalDiscount[] {
// //   if (actionType === "add") {
// //     const amountRaw = String(formData.get("cart_goal") ?? "");
// //     const discountRaw = String(formData.get("discount_percent") ?? "");
// //     const amountInt = Number.parseInt(amountRaw, 10) * 100;
// //     const discountInt = Number.parseInt(discountRaw, 10);

// //     if (Number.isFinite(amountInt) && Number.isFinite(discountInt)) {
// //       const isDuplicate = goalDiscounts.some(
// //         (pair) => pair.amount === amountInt && pair.discount === discountInt,
// //       );
// //       if (!isDuplicate) {
// //         goalDiscounts.push({ amount: amountInt, discount: discountInt });
// //       }
// //     }
// //   } else if (actionType === "remove") {
// //     const removeIdx = Number(formData.get("removeIdx"));
// //     if (Number.isFinite(removeIdx)) {
// //       goalDiscounts = goalDiscounts.filter((_, idx) => idx !== removeIdx);
// //     }
// //   }

// //   return goalDiscounts;
// // }

// // async function saveGoalDiscounts(admin: any, ownerId: string, goalDiscounts: GoalDiscount[]) {
// //   const saveResponse = await admin.graphql(SET_DISCOUNT_GOAL_DISCOUNTS_MUTATION, {
// //     variables: { ownerId, value: JSON.stringify(goalDiscounts) },
// //   });

// //   const result = await saveResponse.json();
// //   const userErrors = result?.data?.metafieldsSet?.userErrors ?? [];
// //   const metafields = result?.data?.metafieldsSet?.metafields ?? [];

// //   if (userErrors.length > 0) {
// //     throw new Error("Failed to save goal discounts");
// //   }

// //   return { metafields, goalDiscounts };
// // }

// // Loader to fetch shop metafield values


// export async function loader({ request }: LoaderFunctionArgs) {
//   const { admin } = await authenticate.admin(request);

//   const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
//   const payload = await response.json();

//   const shop = payload?.data?.shop;
//   const shopId = shop?.id;
//   const currencyCode = shop?.currencyCode ?? "USD";
//   const goalDiscountsMetafield = shop?.goalDiscounts;
//   const discountIdMetafield = shop?.discountId;

//   let goalDiscounts = [];
//   if (goalDiscountsMetafield?.value) {
//     try {
//       goalDiscounts = JSON.parse(goalDiscountsMetafield.value);
//     } catch {
//       goalDiscounts = [];
//     }
//   }

//   const discountId = discountIdMetafield?.value || null;

//   return json({ shopId, currencyCode, goalDiscounts, discountId });
// }

// // Action to append or remove goal/discount pair
// // export async function action({ request }: ActionFunctionArgs) {
// //   const { admin } = await authenticate.admin(request);
// //   const formData = await request.formData();

// //   const ownerId = formData.get("ownerId")?.toString();
// //   const actionType = formData.get("actionType");
// //   let goalDiscounts = [];

// //   // Fetch existing metafields
// //   const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
// //   const payload = await response.json() ;
// //   const shop = payload?.data?.shop;
// //   const goalDiscountsMetafield = shop?.goalDiscounts ?? '';
// //   const discountIdMetafield = shop?.discountId ?? '';
// //   let discountId = discountIdMetafield?.value ?? null;

// //   if (goalDiscountsMetafield?.value) {
// //     try {
// //       goalDiscounts = JSON.parse(goalDiscountsMetafield.value);
// //     } catch {
// //       goalDiscounts = [];
// //     }
// //   }

// //   // 1. Ensure automatic discount exists
// //   if (!discountId) {
// //     const now = new Date().toISOString();
// //     const createResp = await admin.graphql(CREATE_AUTOMATIC_DISCOUNT_MUTATION, {
// //       variables: {
// //         discountInput: {
// //           title: "$5 discount",
// //           functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
// //           startsAt: now,
// //           discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
// //           combinesWith: {
// //             orderDiscounts: true,
// //             productDiscounts: true,
// //             shippingDiscounts: true,
// //           },
// //         },
// //       },
// //     });

// //     const createData = await createResp.json();
// //     const discountData =
// //       createData?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
// //     const userErrors =
// //       createData?.data?.discountAutomaticAppCreate?.userErrors || [];

// //     if (userErrors.length > 0) {
// //       console.error("Discount creation errors:", userErrors);
// //       return json({ ok: false, userErrors }, { status: 400 });
// //     }

// //     if (discountData && discountData.discountId) {
// //       discountId = discountData.discountId;
// //       await admin.graphql(SET_DISCOUNT_ID_MUTATION, {
// //         variables: { ownerId, discountId },
// //       });
// //     } else {
// //       console.log("No Discount Id is Here", JSON.stringify(createData.data));
// //     }
// //   } else {
// //     // Optionally update the discount if you want to change its properties
// //     try {
// //       const now = new Date().toISOString();
// //       const updateReq = await admin.graphql(
// //         UPDATE_AUTOMATIC_DISCOUNT_MUTATION,
// //         {
// //           variables: {
// //             id: discountId,
// //             discountInput: {
// //               title: "$5 discount",
// //               functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
// //               startsAt: now,
// //               discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
// //               combinesWith: {
// //                 orderDiscounts: true,
// //                 productDiscounts: true,
// //                 shippingDiscounts: true,
// //               },
// //             },
// //           },
// //         },
// //       );
// //       const updateRes = await updateReq.json();
// //       console.log(JSON.stringify(updateRes.data));

// //       if (
// //         updateRes.data.discountAutomaticAppUpdate.userErrors?.some(
// //           (error) => error.message === "Discount does not exist.",
// //         )
// //       ) {
// //         const now = new Date().toISOString();
// //         const createResp = await admin.graphql(
// //           CREATE_AUTOMATIC_DISCOUNT_MUTATION,
// //           {
// //             variables: {
// //               discountInput: {
// //                 title: "$5 discount",
// //                 functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
// //                 startsAt: now,
// //                 discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
// //                 combinesWith: {
// //                   orderDiscounts: true,
// //                   productDiscounts: true,
// //                   shippingDiscounts: true,
// //                 },
// //               },
// //             },
// //           },
// //         );

// //         const createData = await createResp.json();
// //         const discountData =
// //           createData?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
// //         const userErrors =
// //           createData?.data?.discountAutomaticAppCreate?.userErrors || [];

// //         if (userErrors.length > 0) {
// //           console.error("Discount creation errors:", userErrors);
// //           return json({ ok: false, userErrors }, { status: 400 });
// //         }

// //         if (discountData && discountData.discountId) {
// //           discountId = discountData.discountId;
// //           await admin.graphql(SET_DISCOUNT_ID_MUTATION, {
// //             variables: { ownerId, discountId },
// //           });
// //         } else {
// //           console.log(
// //             "No Discount Id is Here",
// //             JSON.stringify(createData.data),
// //           );
// //         }
// //       }
// //     } catch (err) {
// //       console.log("Error on Update function", err);
// //     } finally {
// //       console.log("DiscountId Already Exists");
// //     }
// //   }

// //   // 2. Handle goal/discount pair add/remove
// //   if (actionType === "add") {
// //     const amountRaw = String(formData.get("cart_goal") ?? "");
// //     const discountRaw = String(formData.get("discount_percent") ?? "");
// //     const amountInt = Number.parseInt(amountRaw, 10) * 100;
// //     const discountInt = Number.parseInt(discountRaw, 10);

// //     if (Number.isFinite(amountInt) && Number.isFinite(discountInt)) {
// //       const noDuplicate = goalDiscounts.some(
// //         (pair: GoalDiscount) =>
// //           pair.amount === amountInt && pair.discount === discountInt,
// //       );
// //       if (!noDuplicate) {
// //         goalDiscounts.push({ amount: amountInt, discount: discountInt });
// //       }
// //     }
// //   } else if (actionType === "remove") {
// //     const removeIdx = Number(formData.get("removeIdx"));
// //     if (Number.isFinite(removeIdx)) {
// //       goalDiscounts = goalDiscounts.filter(
// //         (_: GoalDiscount, idx: number) => idx !== removeIdx,
// //       );
// //     }
// //   }

// //   // 3. Save updated goalDiscounts array
// //   const saveResponse = await admin.graphql(SET_DISCOUNT_GOAL_DISCOUNTS_MUTATION, {
// //     variables: { ownerId, value: JSON.stringify(goalDiscounts) },
// //   });

// //   const result = await saveResponse.json();
// //   const userErrors = result?.data?.metafieldsSet?.userErrors ?? [];
// //   const metafields = result?.data?.metafieldsSet?.metafields ?? [];

// //   if (userErrors.length > 0) {
// //     return json({ ok: false, userErrors }, { status: 400 });
// //   }

// //   return json({ ok: true, metafields, goalDiscounts });
// // }

// export async function action({ request }: ActionFunctionArgs) {
//   const { admin } = await authenticate.admin(request);
//   const formData = await request.formData();

//   const ownerId = formData.get("ownerId")?.toString();
//   const actionType = formData.get("actionType");

//   if (!ownerId) {
//     return json({ ok: false, error: "Missing ownerId" }, { status: 400 });
//   }

//   // 1. Fetch metafields
//   let { goalDiscounts, discountId } = await fetchMetafields(admin);

//   // 2. Ensure automatic discount exists
//   if (!discountId) {
//     try {
//       discountId = await createDiscount(admin, ownerId);
//     } catch (err) {
//       return json({ ok: false, error: "Failed to create discount" }, { status: 500 });
//     }
//   } else {
//     try {
//       discountId = await updateOrCreateDiscount(admin, ownerId, discountId);
//     } catch (err) {
//       return json({ ok: false, error: "Failed to update discount" }, { status: 500 });
//     }
//   }

//   // 3. Modify goal discounts based on action
//   goalDiscounts = modifyGoalDiscounts(goalDiscounts, actionType, formData);

//   // 4. Save updated goal discounts
//   try {
//     const { metafields, goalDiscounts: updatedDiscounts } = await saveGoalDiscounts(
//       admin,
//       ownerId,
//       goalDiscounts,
//     );
//     return json({ ok: true, metafields, goalDiscounts: updatedDiscounts });
//   } catch (err) {
//     return json({ ok: false, error: "Failed to save goal discounts" }, { status: 500 });
//   }
// }


// // Polaris UI Component
// export default function SpendingGoalPage() {
//   const { shopId, currencyCode, goalDiscounts } =
//     useLoaderData<typeof loader>();
//   const fetcher = useFetcher<typeof action>();

//   const submitting = fetcher.state !== "idle";
//   const [goal, setGoal] = useState<string>("");
//   const [discount, setDiscount] = useState<string>("");
//   const [toastOpen, setToastOpen] = useState(false);
//   const [toastError, setToastError] = useState<string | null>(null);

//   useEffect(() => {
//     if (fetcher.data) {
//       if ((fetcher.data as any).ok) {
//         setToastError(null);
//         setToastOpen(true);
//         setGoal("");
//         setDiscount("");
//       } else if ((fetcher.data as any).userErrors?.length) {
//         const first = (fetcher.data as any).userErrors[0];
//         setToastError(first?.message ?? "Something went wrong");
//         setToastOpen(true);
//       }
//     }
//     console.log(fetcher.data, "fetcher.data");
//   }, [fetcher.data]);

//   const handleGoalChange = useCallback((val: string) => {
//     const digits = val.replace(/[^0-9]/g, "");
//     setGoal(digits);
//   }, []);

//   const handleDiscountChange = useCallback((val: string) => {
//     const digits = val.replace(/[^0-9]/g, "");
//     setDiscount(digits);
//   }, []);

//   const toastMarkup = useMemo(() => {
//     if (!toastOpen) return null;
//     return (
//       <Toast
//         content={
//           toastError ? `Error: ${toastError}` : "Goal/discount pair saved"
//         }
//         error={Boolean(toastError)}
//         onDismiss={() => setToastOpen(false)}
//       />
//     );
//   }, [toastOpen, toastError]);

//   return (
//     <Frame>
//       <Page title="Cart Spending Goals">
//         <BlockStack gap="400">
//           <Card>
//             <BlockStack gap="400">
//               <Text as="p" variant="bodyMd">
//                 Add multiple goal/discount pairs. Each pair is appended to the
//                 metafield array.
//               </Text>
//               <fetcher.Form method="post">
//                 <input type="hidden" name="ownerId" value={shopId ?? ""} />
//                 <input type="hidden" name="actionType" value="add" />
//                 <BlockStack gap="400">
//                   <TextField
//                     label={`Cart goal (${currencyCode})`}
//                     name="cart_goal"
//                     value={goal}
//                     onChange={handleGoalChange}
//                     autoComplete="off"
//                     inputMode="numeric"
//                     helpText="Saved as amount (integer, cents)"
//                   />
//                   <TextField
//                     label="Discount percentage (integer)"
//                     name="discount_percent"
//                     value={discount}
//                     onChange={handleDiscountChange}
//                     autoComplete="off"
//                     inputMode="numeric"
//                     helpText="Saved as discount (integer, percent)"
//                   />
//                   <InlineStack align="end">
//                     <Button submit loading variant="primary">
//                       Add goal & discount
//                     </Button>
//                   </InlineStack>
//                 </BlockStack>
//               </fetcher.Form>
//               <BlockStack gap="200">
//                 <Text as="h3" variant="headingSm">
//                   Current goal/discount pairs:
//                 </Text>
//                 {goalDiscounts.length === 0 ? (
//                   <Text as="p" variant="bodyMd">
//                     No pairs set yet.
//                   </Text>
//                 ) : (
//                   <>
//                     {goalDiscounts.map((pair: GoalDiscount, idx: number) => (
//                       <InlineStack key={idx} align="space-between" gap="400">
//                         <Text as="p" variant="bodyMd">
//                           Goal:{" "}
//                           {new Intl.NumberFormat(undefined, {
//                             style: "currency",
//                             currency: currencyCode,
//                           }).format(pair.amount / 100)}
//                           , Discount: {pair.discount}%
//                         </Text>
//                         <fetcher.Form method="post">
//                           <input
//                             type="hidden"
//                             name="ownerId"
//                             value={shopId ?? ""}
//                           />
//                           <input
//                             type="hidden"
//                             name="actionType"
//                             value="remove"
//                           />
//                           <input type="hidden" name="removeIdx" value={idx} />
//                           <Button
//                             submit
//                             loading
//                             variant="tertiary"
//                           >
//                             Remove
//                           </Button>
//                         </fetcher.Form>
//                       </InlineStack>
//                     ))}
//                   </>
//                 )}
//               </BlockStack>
//             </BlockStack>
//           </Card>
//         </BlockStack>
//       </Page>
//       {toastMarkup}
//     </Frame>
//   );
// }


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
import { authenticate } from "../models/shopify.server";

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
      goalDiscounts: metafield(namespace: "spending_goal", key: "goal_discounts") {
        id
        value
        type
      }
      discountId: metafield(namespace: "spending_goal", key: "discount_id") {
        id
        value
        type
      }
    }
  }
`;

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
`;

const SET_DISCOUNT_ID_MUTATION = `#graphql
  mutation SetDiscountId($ownerId: ID!, $discountId: String!) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $ownerId,
          namespace: "spending_goal",
          key: "discount_id",
          type: "single_line_text_field",
          value: $discountId
        }
      ]
    ) {
      metafields { id namespace key value }
      userErrors { field message }
    }
  }
`;

const CREATE_AUTOMATIC_DISCOUNT_MUTATION = `#graphql
  mutation CreateAutomaticDiscount($discountInput: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $discountInput) {
      automaticAppDiscount {
        discountId
      }
      userErrors { field message }
    }
  }
`;

const UPDATE_AUTOMATIC_DISCOUNT_MUTATION = `#graphql
  mutation UpdateAutomaticDiscount($id: ID!,$discountInput: DiscountAutomaticAppInput!) {
    discountAutomaticAppUpdate(id: $id,automaticAppDiscount: $discountInput) {
      automaticAppDiscount {
        discountId
      }
      userErrors { field message }
    }
  }
`;

// Loader to fetch shop metafield values
export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
  const payload = await response.json();

  const shop = payload?.data?.shop;
  const shopId = shop?.id;
  const currencyCode = shop?.currencyCode ?? "USD";
  const goalDiscountsMetafield = shop?.goalDiscounts;
  const discountIdMetafield = shop?.discountId;

  let goalDiscounts = [];
  if (goalDiscountsMetafield?.value) {
    try {
      goalDiscounts = JSON.parse(goalDiscountsMetafield.value);
    } catch {
      goalDiscounts = [];
    }
  }

  const discountId = discountIdMetafield?.value || null;

  return json({ shopId, currencyCode, goalDiscounts, discountId });
}

// Action to append or remove goal/discount pair
export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const ownerId = String(formData.get("ownerId"));
  const actionType = formData.get("actionType");
  let goalDiscounts = [];

  // Fetch existing metafields
  const response = await admin.graphql(SHOP_AND_GOAL_QUERY);
  const payload = await response.json();
  const shop = payload?.data?.shop;
  const goalDiscountsMetafield = shop?.goalDiscounts;
  const discountIdMetafield = shop?.discountId;
  let discountId = discountIdMetafield?.value || null;

  if (goalDiscountsMetafield?.value) {
    try {
      goalDiscounts = JSON.parse(goalDiscountsMetafield.value);
    } catch {
      goalDiscounts = [];
    }
  }

  // 1. Ensure automatic discount exists
  if (!discountId) {
    const now = new Date().toISOString();
    const createResp = await admin.graphql(CREATE_AUTOMATIC_DISCOUNT_MUTATION, {
      variables: {
        discountInput: {
          title: "$5 discount",
          functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
          startsAt: now,
          discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
          combinesWith: {
            orderDiscounts: true,
            productDiscounts: true,
            shippingDiscounts: true,
          },
        },
      },
    });

    const createData = await createResp.json();
    const discountData =
      createData?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
    const userErrors =
      createData?.data?.discountAutomaticAppCreate?.userErrors || [];

    if (userErrors.length > 0) {
      console.error("Discount creation errors:", userErrors);
      return json({ ok: false, userErrors }, { status: 400 });
    }

    if (discountData && discountData.discountId) {
      discountId = discountData.discountId;
      await admin.graphql(SET_DISCOUNT_ID_MUTATION, {
        variables: { ownerId, discountId },
      });
    } else {
      console.log("No Discount Id is Here", JSON.stringify(createData.data));
    }
  } else {
    // Optionally update the discount if you want to change its properties
    try {
      const now = new Date().toISOString();
      const updateReq = await admin.graphql(
        UPDATE_AUTOMATIC_DISCOUNT_MUTATION,
        {
          variables: {
            id: discountId,
            discountInput: {
              title: "$5 discount",
              functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
              startsAt: now,
              discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
              combinesWith: {
                orderDiscounts: true,
                productDiscounts: true,
                shippingDiscounts: true,
              },
            },
          },
        },
      );
      const updateRes = await updateReq.json();
      console.log(JSON.stringify(updateRes.data));

      if (
        updateRes.data.discountAutomaticAppUpdate.userErrors?.some(
          (error) => error.message === "Discount does not exist.",
        )
      ) {
        const now = new Date().toISOString();
        const createResp = await admin.graphql(
          CREATE_AUTOMATIC_DISCOUNT_MUTATION,
          {
            variables: {
              discountInput: {
                title: "$5 discount",
                functionId: "21ac4370-f3c7-4d09-90b0-21b86b9b24bd",
                startsAt: now,
                discountClasses: ["PRODUCT", "SHIPPING", "ORDER"],
                combinesWith: {
                  orderDiscounts: true,
                  productDiscounts: true,
                  shippingDiscounts: true,
                },
              },
            },
          },
        );

        const createData = await createResp.json();
        const discountData =
          createData?.data?.discountAutomaticAppCreate?.automaticAppDiscount;
        const userErrors =
          createData?.data?.discountAutomaticAppCreate?.userErrors || [];

        if (userErrors.length > 0) {
          console.error("Discount creation errors:", userErrors);
          return json({ ok: false, userErrors }, { status: 400 });
        }

        if (discountData && discountData.discountId) {
          discountId = discountData.discountId;
          await admin.graphql(SET_DISCOUNT_ID_MUTATION, {
            variables: { ownerId, discountId },
          });
        } else {
          console.log(
            "No Discount Id is Here",
            JSON.stringify(createData.data),
          );
        }
      }
    } catch (err) {
      console.log("Error on Update function", err);
    } finally {
      console.log("DiscountId Already Exists");
    }
  }

  // 2. Handle goal/discount pair add/remove
  if (actionType === "add") {
    const amountRaw = String(formData.get("cart_goal") ?? "");
    const discountRaw = String(formData.get("discount_percent") ?? "");
    const amountInt = Number.parseInt(amountRaw, 10) * 100;
    const discountInt = Number.parseInt(discountRaw, 10);

    if (Number.isFinite(amountInt) && Number.isFinite(discountInt)) {
      const noDuplicate = goalDiscounts.some(
        (pair: GoalDiscount) =>
          pair.amount === amountInt && pair.discount === discountInt,
      );
      if (!noDuplicate) {
        goalDiscounts.push({ amount: amountInt, discount: discountInt });
      }
    }
  } else if (actionType === "remove") {
    const removeIdx = Number(formData.get("removeIdx"));
    if (Number.isFinite(removeIdx)) {
      goalDiscounts = goalDiscounts.filter(
        (_: GoalDiscount, idx: number) => idx !== removeIdx,
      );
    }
  }

  // 3. Save updated goalDiscounts array
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
  const { shopId, currencyCode, goalDiscounts } =
    useLoaderData<typeof loader>();
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
    console.log(fetcher.data, "fetcher.data");
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
        content={
          toastError ? `Error: ${toastError}` : "Goal/discount pair saved"
        }
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
                Add multiple goal/discount pairs. Each pair is appended to the
                metafield array.
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
                    <Button submit loading variant="primary">
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
                    {goalDiscounts.map((pair: GoalDiscount, idx: number) => (
                      <InlineStack key={idx} align="space-between" gap="400">
                        <Text as="p" variant="bodyMd">
                          Goal:{" "}
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency: currencyCode,
                          }).format(pair.amount / 100)}
                          , Discount: {pair.discount}%
                        </Text>
                        <fetcher.Form method="post">
                          <input
                            type="hidden"
                            name="ownerId"
                            value={shopId ?? ""}
                          />
                          <input
                            type="hidden"
                            name="actionType"
                            value="remove"
                          />
                          <input type="hidden" name="removeIdx" value={idx} />
                          <Button
                            submit
                            loading
                            variant="tertiary"
                          >
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

