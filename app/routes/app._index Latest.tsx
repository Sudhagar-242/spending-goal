// import { useEffect } from 'react';
// import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
// import { useFetcher, useLoaderData } from '@remix-run/react';
// import {
//   Page,
//   Layout,
//   Text,
//   Card,
//   Button,
//   BlockStack,
//   Box,
//   List,
//   Link,
//   InlineStack,
// } from '@shopify/polaris';
// import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
// import { authenticate } from '../models/shopify.server';

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }: ActionFunctionArgs) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ['Red', 'Orange', 'Yellow', 'Green'][Math.floor(Math.random() * 4)];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($product: ProductCreateInput!) {
//         productCreate(product: $product) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         product: {
//           title: `${color} Snowboard`,
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();

//   const product = responseJson.data!.productCreate!.product!;
//   const variantId = product.variants.edges[0]!.node!.id!;

//   const variantResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//         productVariants {
//           id
//           price
//           barcode
//           createdAt
//         }
//       }
//     }`,
//     {
//       variables: {
//         productId: product.id,
//         variants: [{ id: variantId, price: '100.00' }],
//       },
//     },
//   );

//   const variantResponseJson = await variantResponse.json();

//   return {
//     product: responseJson!.data!.productCreate!.product,
//     variant: variantResponseJson!.data!.productVariantsBulkUpdate!.productVariants,
//   };
// };

// export default function Index() {
//   // const loader = useLoaderData<typeof loader>();
//   const fetcher = useFetcher<typeof action>();

//   const shopify = useAppBridge();
//   const isLoading =
//     ['loading', 'submitting'].includes(fetcher.state) && fetcher.formMethod === 'POST';
//   const productId = fetcher.data?.product?.id.replace('gid://shopify/Product/', '');

//   useEffect(() => {
//     if (productId) {
//       shopify.toast.show('Product created');
//     }
//   }, [productId, shopify]);
//   const generateProduct = () => fetcher.submit({}, { method: 'POST' });

//   return (
//     <Page>
//       <TitleBar title="Remix app template">
//         <button variant="primary" onClick={generateProduct}>
//           Generate a product
//         </button>
//       </TitleBar>
//       <BlockStack gap="500">
//         <Layout>
//           <Layout.Section>
//             <Card>
//               <BlockStack gap="500">
//                 <BlockStack gap="200">
//                   <Text as="h2" variant="headingMd">
//                     Congrats on creating a new Shopify app 🎉
//                   </Text>
//                   <Text variant="bodyMd" as="p">
//                     This embedded app template uses{' '}
//                     <Link
//                       url="https://shopify.dev/docs/apps/tools/app-bridge"
//                       target="_blank"
//                       removeUnderline
//                     >
//                       App Bridge
//                     </Link>{' '}
//                     interface examples like an{' '}
//                     <Link url="/app/additional" removeUnderline>
//                       additional page in the app nav
//                     </Link>
//                     , as well as an{' '}
//                     <Link
//                       url="https://shopify.dev/docs/api/admin-graphql"
//                       target="_blank"
//                       removeUnderline
//                     >
//                       Admin GraphQL
//                     </Link>{' '}
//                     mutation demo, to provide a starting point for app development.
//                   </Text>
//                 </BlockStack>
//                 <BlockStack gap="200">
//                   <Text as="h3" variant="headingMd">
//                     Get started with products
//                   </Text>
//                   <Text as="p" variant="bodyMd">
//                     Generate a product with GraphQL and get the JSON output for that product. Learn
//                     more about the{' '}
//                     <Link
//                       url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
//                       target="_blank"
//                       removeUnderline
//                     >
//                       productCreate
//                     </Link>{' '}
//                     mutation in our API references.
//                   </Text>
//                 </BlockStack>
//                 <InlineStack gap="300">
//                   <Button loading={isLoading} onClick={generateProduct}>
//                     Generate a product
//                   </Button>
//                   {fetcher.data?.product && (
//                     <Button
//                       url={`shopify:admin/products/${productId}`}
//                       target="_blank"
//                       variant="plain"
//                     >
//                       View product
//                     </Button>
//                   )}
//                 </InlineStack>
//                 {fetcher.data?.product && (
//                   <>
//                     <Text as="h3" variant="headingMd">
//                       {' '}
//                       productCreate mutation
//                     </Text>
//                     <Box
//                       padding="400"
//                       background="bg-surface-active"
//                       borderWidth="025"
//                       borderRadius="200"
//                       borderColor="border"
//                       overflowX="scroll"
//                     >
//                       <pre style={{ margin: 0 }}>
//                         <code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
//                       </pre>
//                     </Box>
//                     <Text as="h3" variant="headingMd">
//                       {' '}
//                       productVariantsBulkUpdate mutation
//                     </Text>
//                     <Box
//                       padding="400"
//                       background="bg-surface-active"
//                       borderWidth="025"
//                       borderRadius="200"
//                       borderColor="border"
//                       overflowX="scroll"
//                     >
//                       <pre style={{ margin: 0 }}>
//                         <code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
//                       </pre>
//                     </Box>
//                   </>
//                 )}
//               </BlockStack>
//             </Card>
//           </Layout.Section>
//           <Layout.Section variant="oneThird">
//             <BlockStack gap="500">
//               <Card>
//                 <BlockStack gap="200">
//                   <Text as="h2" variant="headingMd">
//                     App template specs
//                   </Text>
//                   <BlockStack gap="200">
//                     <InlineStack align="space-between">
//                       <Text as="span" variant="bodyMd">
//                         Framework
//                       </Text>
//                       <Link url="https://remix.run" target="_blank" removeUnderline>
//                         Remix
//                       </Link>
//                     </InlineStack>
//                     <InlineStack align="space-between">
//                       <Text as="span" variant="bodyMd">
//                         Database
//                       </Text>
//                       <Link url="https://www.prisma.io/" target="_blank" removeUnderline>
//                         Prisma
//                       </Link>
//                     </InlineStack>
//                     <InlineStack align="space-between">
//                       <Text as="span" variant="bodyMd">
//                         Interface
//                       </Text>
//                       <span>
//                         <Link url="https://polaris.shopify.com" target="_blank" removeUnderline>
//                           Polaris
//                         </Link>
//                         {', '}
//                         <Link
//                           url="https://shopify.dev/docs/apps/tools/app-bridge"
//                           target="_blank"
//                           removeUnderline
//                         >
//                           App Bridge
//                         </Link>
//                       </span>
//                     </InlineStack>
//                     <InlineStack align="space-between">
//                       <Text as="span" variant="bodyMd">
//                         API
//                       </Text>
//                       <Link
//                         url="https://shopify.dev/docs/api/admin-graphql"
//                         target="_blank"
//                         removeUnderline
//                       >
//                         GraphQL API
//                       </Link>
//                     </InlineStack>
//                   </BlockStack>
//                 </BlockStack>
//               </Card>
//               <Card>
//                 <BlockStack gap="200">
//                   <Text as="h2" variant="headingMd">
//                     Next steps
//                   </Text>
//                   <List>
//                     <List.Item>
//                       Build an{' '}
//                       <Link
//                         url="https://shopify.dev/docs/apps/getting-started/build-app-example"
//                         target="_blank"
//                         removeUnderline
//                       >
//                         {' '}
//                         example app
//                       </Link>{' '}
//                       to get started
//                     </List.Item>
//                     <List.Item>
//                       Explore Shopify’s API with{' '}
//                       <Link
//                         url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
//                         target="_blank"
//                         removeUnderline
//                       >
//                         GraphiQL
//                       </Link>
//                     </List.Item>
//                   </List>
//                 </BlockStack>
//               </Card>
//             </BlockStack>
//           </Layout.Section>
//         </Layout>
//       </BlockStack>
//     </Page>
//   );
// }

// import { json, LoaderFunctionArgs } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import {
//   Card,
//   Layout,
//   Page,
//   Text,
//   DataTable,
//   Badge,
//   InlineStack,
// } from "@shopify/polaris";
// import { authenticate } from "../models/shopify.server";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { useEffect } from "react";

// // Dummy data for analytics
// const dummyAnalyticsData = {
//   totalCustomers: 1245,
//   totalOrders: 342,
//   totalRevenue: 12456.78,
//   progressBarUsage: 75,
// };

// const dummyCustomerList = [
//   { id: "1", name: "John Doe", email: "john@example.com", orders: 5, status: "active" },
//   { id: "2", name: "Jane Smith", email: "jane@example.com", orders: 3, status: "active" },
//   { id: "3", name: "Bob Johnson", email: "bob@example.com", orders: 1, status: "inactive" },
//   { id: "4", name: "Alice Brown", email: "alice@example.com", orders: 7, status: "active" },
// ];

// // Loader function (optional: fetch real data via Shopify Admin API)
// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const { admin } = await authenticate.admin(request);
//   // Example: Fetch real data using GraphQL
//   // const response = await admin.graphql(`{ shop { name } }`);
//   // const shop = await response.json();
//   return json({ dummyAnalyticsData, dummyCustomerList });
// };

// export default function Index() {
//   const { dummyAnalyticsData, dummyCustomerList } = useLoaderData<typeof loader>();
//   const shopify = useAppBridge();

//   // Example: Redirect using App Bridge
//   // const handleRedirect = () => {
//   //   const redirect = Redirect.create(app);
//   //   redirect.dispatch(Redirect.Action.ADMIN_PATH, { path: "/settings" });
//   // };

//   useEffect(() => {
//     shopify.toast.show("Welcome to the Analytics Dashboard!");
//   }, []);

//   // DataTable rows for customer list
//   const rows = dummyCustomerList.map((customer) => [
//     customer.id,
//     customer.name,
//     customer.email,
//     customer.orders,
//     <Badge key={customer.id} tone={customer.status === "active" ? "success" : "warning"}>
//       {customer.status}
//     </Badge>,
//   ]);

//   return (
//     <Page
//       title="Analytics Dashboard"
//       subtitle="Track progress bar usage and customer engagement"
//       primaryAction={{ content: "Settings" }}
//       // primaryAction={{ content: "Settings", onAction: handleRedirect }}
//     >
//       <Layout>
//         {/* Analytics Summary Cards */}
//         <Layout.Section>
//           <InlineStack align="space-evenly">
//             <Card padding={"400"}>
//               <Text variant="bodyMd" fontWeight="bold" as="p">
//                 Total Customers
//               </Text>
//               <Text variant="heading2xl" as="h2">
//                 {dummyAnalyticsData.totalCustomers}
//               </Text>
//             </Card>
//             <Card>
//               <Text variant="bodyMd" fontWeight="bold" as="p">
//                 Total Orders
//               </Text>
//               <Text variant="heading2xl" as="h2">
//                 {dummyAnalyticsData.totalOrders}
//               </Text>
//             </Card>
//             <Card>
//               <Text variant="bodyMd" fontWeight="bold" as="p">
//                 Total Revenue
//               </Text>
//               <Text variant="heading2xl" as="h2">
//                 ${dummyAnalyticsData.totalRevenue.toFixed(2)}
//               </Text>
//             </Card>
//             <Card>
//               <Text variant="bodyMd" fontWeight="bold" as="p">
//                 Progress Bar Usage
//               </Text>
//               <Text variant="heading2xl" as="h2">
//                 {dummyAnalyticsData.progressBarUsage}%
//               </Text>
//             </Card>
//           </InlineStack>
//         </Layout.Section>

//         {/* Customer List Table */}
//         <Layout.Section>
//           <Card>
//             <DataTable
//               columnContentTypes={["text", "text", "text", "numeric", "text"]}
//               headings={["ID", "Name", "Email", "Orders", "Status"]}
//               rows={rows}
//             />
//           </Card>
//         </Layout.Section>
//       </Layout>
//     </Page>
//   );
// }

import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  Card,
  Layout,
  Page,
  Text,
  Badge,
  InlineStack,
  BlockStack,
} from '@shopify/polaris';
import { authenticate } from '../models/shopify.server';
import { useAppBridge } from '@shopify/app-bridge-react';
import { useEffect } from 'react';

import { SHOP_AND_GOAL_QUERY } from 'app/graphql/meta_fields';
import type { GoalDiscountsValue, ShopData } from 'app/types/app_create-goal';
import GoalCard from 'app/components/goal_card';
import { requestQuery } from 'app/utils/requestGQL';

// Dummy data for analytics
const dummyAnalyticsData = {
  totalCustomers: 1245,
  totalOrders: 342,
  totalRevenue: 12456.78,
  progressBarUsage: 75,
};

const dummyCustomerList = [
  { id: '1', name: 'John Doe', email: 'john@example.com', orders: 5, status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', orders: 3, status: 'active' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', orders: 1, status: 'inactive' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', orders: 7, status: 'active' },
];

// Loader function (optional: fetch real data via Shopify Admin API)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
  const { currencyCode, goalDiscounts } = shop;
  const goalDiscountArray = JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[];
  return json({ dummyAnalyticsData, dummyCustomerList, currencyCode, goalDiscountArray });
};

export default function Index() {
  const { dummyAnalyticsData, dummyCustomerList, goalDiscountArray } = useLoaderData<typeof loader>();
  const app = useAppBridge();

  useEffect(() => {
    app.toast.show('Welcome to the Analytics Dashboard!', { duration: 3000 });
  }, [app]);

  // DataTable rows for customer list
  const rows = dummyCustomerList.map((customer) => [
    customer.id,
    customer.name,
    customer.email,
    customer.orders,
    <Badge key={customer.id} tone={customer.status === 'active' ? 'success' : 'warning'}>
      {customer.status}
    </Badge>,
  ]);

  return (
    <Page
      title="Analytics Dashboard"
      subtitle="Track progress bar usage and customer engagement"
      primaryAction={{ content: 'Create Goal', url: '/app/goals-creation' }}
    >
      <Layout>
        {/* Analytics Summary Cards */}
        <Layout.Section>
          <InlineStack align="space-evenly" blockAlign="center" wrap={false}>
            <Card padding="400">
              <BlockStack>
                <Text variant="bodyMd" fontWeight="bold" as="p">
                  Total Customers
                </Text>
                <Text variant="heading2xl" as="h2">
                  {dummyAnalyticsData.totalCustomers}
                </Text>
              </BlockStack>
            </Card>
            <Card padding="400">
              <BlockStack>
                <Text variant="bodyMd" fontWeight="bold" as="p">
                  Total Orders
                </Text>
                <Text variant="heading2xl" as="h2">
                  {dummyAnalyticsData.totalOrders}
                </Text>
              </BlockStack>
            </Card>
            <Card padding="400">
              <BlockStack>
                <Text variant="bodyMd" fontWeight="bold" as="p">
                  Total Revenue
                </Text>
                <Text variant="heading2xl" as="h2">
                  ${dummyAnalyticsData.totalRevenue.toFixed(2)}
                </Text>
              </BlockStack>
            </Card>
            <Card padding="400">
              <BlockStack>
                <Text variant="bodyMd" fontWeight="bold" as="p">
                  Progress Bar Usage
                </Text>
                <Text variant="heading2xl" as="h2">
                  {dummyAnalyticsData.progressBarUsage}%
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        {/* Customer List Table */}
        <Layout.Section>
          <Card padding="400">
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">
                Current goal/discount pairs:
              </Text>
              {goalDiscountArray && goalDiscountArray.length === 0 ? (
                <Text as="p" variant="bodyMd">
                  No pairs set yet.
                </Text>
              ) : (
                <>
                  {/* {goalDiscountArray.map((pair, idx) => (
                    <GoalCard goal={pair!} index={idx} key={idx} currencyCode={currencyCode} />
                  ))} */}
                  <Text as="p" variant="bodyMd">
                  Its Working...
                </Text>
                </>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

//   OrderIcon,
//   CartSaleIcon,
//   MoneyIcon