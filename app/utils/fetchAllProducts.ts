import type { ProductGQL, ProductsData } from 'app/types/app_create-goal';
import type { AdminApiContextWithoutRest } from 'node_modules/@shopify/shopify-app-remix/dist/ts/server/clients';
import { requestMutation } from './requestGQL';
import { GET_PRODUCTS_WITH_CURSOR } from 'app/graphql/products';

export async function fetchAllProducts(
  admin: AdminApiContextWithoutRest,
  first: number = 200,
  after: string | null = null,
  accumulated: ProductsData['products']['edges'] = [],
): Promise<{
  products: ProductGQL[];
  pageInfo: ProductsData['products']['pageInfo'];
}> {
  const variables = { first, after };
  const { products: productsData } = await requestMutation<ProductsData>(
    admin,
    GET_PRODUCTS_WITH_CURSOR,
    { variables },
  );
  const { edges: products, pageInfo } = productsData;
  const allProducts = [...accumulated, ...products];
  if (pageInfo.hasNextPage && products.length > 0) {
    const lastCursor = products[products.length - 1]?.cursor;
    return fetchAllProducts(admin, first, lastCursor, allProducts);
  }
  const FetchedProducts = allProducts.map((product) => product.node);
  return { products: FetchedProducts, pageInfo };
}
