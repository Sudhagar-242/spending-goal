import React, { useState, useCallback, useEffect } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, useFetcher, useNavigation, Navigate, useNavigate } from '@remix-run/react';
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
  Select,
} from '@shopify/polaris';
import { authenticate, apiVersion } from '../models/shopify.server';
import { SHOP_AND_GOAL_QUERY, SET_GOAL_DISCOUNTS_METAFIELD } from '../graphql/meta_fields';
import { ensureDiscountExists } from '../utils/create-discount-function-existance';
import { DiscountGoals, DiscountKind } from '../enums/discount-goals';
import { requestMutation, requestQuery } from '../utils/requestGQL';
import type { GoalDiscountsValue, ProductGQL, ShopData } from '../types/app_create-goal';
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
const options = [
  {
    label: DiscountKind.PRODUCT,
    value: DiscountKind.PRODUCT,
  },
  {
    label: DiscountKind.ORDER,
    value: DiscountKind.ORDER,
    // prefix:
  },
  {
    label: DiscountKind.SHIPPING,
    value: DiscountKind.SHIPPING,
  },
];

interface CreateGoalPageProps {
  fetcher: any;
  currencyCode: string;
  shopId: string;
  products: ProductGQL[];
  goalDiscountArray: any
}

// --- React UI ---
export default function CreateGoal({ fetcher, currencyCode, shopId, products, goalDiscountArray }: CreateGoalPageProps) {
  const navigation = useNavigation();
  const [activeToast, setActiveToast] = useState<{ content: string; error?: boolean } | null>(null);
  const [selected, setSelected] = useState(options[0].value);

  const navigate = useNavigate();

  console.log('goal creation', goalDiscountArray);

  const handleSelectChange = useCallback((value: string) => setSelected(value as DiscountKind), []);

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

useEffect(() => {
  if (fetcher.state === 'idle' && fetcher.data) {
    if (fetcher.data.ok) {
      setActiveToast({
        content: 'Goal saved successfully!',
        error: false,
      });

      // 👇 Redirect after success
      navigate('/app'); // or "/" if your home route is root
    } else {
      const data = fetcher.data;
      setActiveToast({
        content: data && !data.ok && 'error' in data ? data.error : 'Failed to save goal',
        error: true,
      });
    }
  }
}, [fetcher.state, fetcher.data, navigate]);

  


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

  console.log(selected);

  return (
    <Frame>
      {toastMarkup}
        <ProductsContextProvider Products={products ?? []}>
          <BlockStack gap="400">
            <Card>
              {/* <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} key={selected} /> */}
              <Select
                label="Permission"
                options={options}
                onChange={handleSelectChange}
                value={selected}
              />
            </Card>

            {/* Show loading state during form submission */}
            {navigation.state === 'submitting' ? (
              <Card>
                <BlockStack gap="400">
                  <SkeletonDisplayText size="medium" />
                  <SkeletonBodyText lines={6} />
                </BlockStack>
              </Card>
            ) : selected === DiscountKind.PRODUCT ? (
              <ProductGoalForm fetcher={fetcher} currencyCode={currencyCode} />
            ) : selected === DiscountKind.ORDER ? (
              <OrderGoalForm fetcher={fetcher} currencyCode={currencyCode} />
            ) : selected === DiscountKind.SHIPPING ? (
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
    </Frame>
  );
}
