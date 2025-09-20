import type { ActionFunctionArgs } from '@remix-run/node';
import { authenticate } from 'app/models/shopify.server';

interface ThemePayload {
  id: number;
  name: string;
  role: 'main' | 'unpublished';
  created_at: string;
  updated_at: string;
  theme_store_id: number | null;
  previewable: boolean;
  processing: boolean;
}

const metaKey = 'theme_name';
const metaNameSpace = 'zuper-shipping-threshold';
const shopData: Record<string, any> = {};
let ShopId = '';
let ThemeName = '';

async function updateMetaThemeName(
  shopDomain: string,
  accessToken: string,
  apiVersion: string,
  fetchedThemeName: string,
) {
  if (fetchedThemeName != ThemeName) {
    const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: `
      mutation UpdateShopMetafield {
  metafieldsSet(metafields: [
    {
      ownerId: "${ShopId}", # Replace with your shop GID
      namespace: "${metaKey}",
      key: "${metaKey}",
      type: "single_line_text_field",
      value: "${fetchedThemeName}"
    }
  ]) {
    metafields {
      id
      key
      value
    }
    userErrors {
      field
      message
    }
  }
}
      `,
      }),
    });
    const { data } = await response.json();
    ThemeName = fetchedThemeName;
    return data;
  }
}

async function fetchShopId(shopDomain: string, accessToken: string, apiVersion: string) {
  const response = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: `
        query {
          shop {
            id
            myshopifyDomain
            metafield(key: "${metaKey}" , namespace: "${metaNameSpace}"){
               value
            }
          }
        }
      `,
    }),
  });
  const { data } = await response.json();
  ShopId = data.shop.id;
  ThemeName = data.shop.metafield.value;
  return data;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Validate webhook signature
    const { topic, session, shop, payload } = await authenticate.webhook(request);
    // const { admin } = await authenticate.admin(request);

    const shopDomain = request.headers.get('X-Shopify-Shop-Domain');
    const apiVersion = request.headers.get('X-Shopify-API-Version');

    if (!ShopId) {
      if (shopDomain && session?.accessToken && apiVersion) {
        await fetchShopId(shopDomain, session?.accessToken, apiVersion);
        console.log('ShopId: ', ShopId, ThemeName);
      }
    }
    console.log('Shop data and api', shopData, apiVersion);

    if (topic !== 'THEMES_UPDATE') {
      console.warn('Unexpected webhook topic', { topic, shop });
      return new Response('Unhandled webhook topic', { status: 404 });
    }

    // Destructure actual theme payload
    const theme = payload as ThemePayload;

    if (theme.name != ThemeName && theme.role === 'main') {
      if (shopDomain && session?.accessToken && apiVersion) {
        await updateMetaThemeName(shopDomain, session?.accessToken, apiVersion, theme.name);
        console.log('ShopId: ', ShopId, ' Updated');
      }
    }

    console.info('Published theme update', {
      shop,
      themeId: theme.id,
      themeName: theme.name,
      role: theme.role,
      updatedAt: theme.created_at,
    });
    return new Response('Success', { status: 200 });
  } catch (error) {
    console.error('Webhook processing failed', { error });
    return new Response('Internal server error', { status: 500 });
  }
};
