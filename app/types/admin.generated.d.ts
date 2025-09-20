/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import type * as AdminTypes from './admin.types';

export type PopulateProductMutationVariables = AdminTypes.Exact<{
  product: AdminTypes.ProductCreateInput;
}>;

export type PopulateProductMutation = {
  productCreate?: AdminTypes.Maybe<{
    product?: AdminTypes.Maybe<
      Pick<AdminTypes.Product, 'id' | 'title' | 'handle' | 'status'> & {
        variants: {
          edges: Array<{
            node: Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>;
          }>;
        };
      }
    >;
  }>;
};

export type ShopifyRemixTemplateUpdateVariantMutationVariables = AdminTypes.Exact<{
  productId: AdminTypes.Scalars['ID']['input'];
  variants: Array<AdminTypes.ProductVariantsBulkInput> | AdminTypes.ProductVariantsBulkInput;
}>;

export type ShopifyRemixTemplateUpdateVariantMutation = {
  productVariantsBulkUpdate?: AdminTypes.Maybe<{
    productVariants?: AdminTypes.Maybe<
      Array<Pick<AdminTypes.ProductVariant, 'id' | 'price' | 'barcode' | 'createdAt'>>
    >;
  }>;
};

export type ShopAndCartGoalQueryVariables = AdminTypes.Exact<{ [key: string]: never }>;

export type ShopAndCartGoalQuery = {
  shop: Pick<AdminTypes.Shop, 'id' | 'currencyCode'> & {
    metafield?: AdminTypes.Maybe<Pick<AdminTypes.Metafield, 'id' | 'value' | 'type'>>;
  };
};

export type SetGoalDiscountsMutationVariables = AdminTypes.Exact<{
  ownerId: AdminTypes.Scalars['ID']['input'];
  value: AdminTypes.Scalars['String']['input'];
}>;

export type SetGoalDiscountsMutation = {
  metafieldsSet?: AdminTypes.Maybe<{
    metafields?: AdminTypes.Maybe<
      Array<Pick<AdminTypes.Metafield, 'id' | 'namespace' | 'key' | 'value'>>
    >;
    userErrors: Array<Pick<AdminTypes.MetafieldsSetUserError, 'field' | 'message'>>;
  }>;
};

interface GeneratedQueryTypes {
  '#graphql\n  query ShopAndCartGoal {\n    shop {\n      id\n      currencyCode\n      metafield(namespace: "spending_goal", key: "goal_discounts") {\n        id\n        value\n        type\n      }\n    }\n  }\n': {
    return: ShopAndCartGoalQuery;
    variables: ShopAndCartGoalQueryVariables;
  };
}

interface GeneratedMutationTypes {
  '#graphql\n      mutation populateProduct($product: ProductCreateInput!) {\n        productCreate(product: $product) {\n          product {\n            id\n            title\n            handle\n            status\n            variants(first: 10) {\n              edges {\n                node {\n                  id\n                  price\n                  barcode\n                  createdAt\n                }\n              }\n            }\n          }\n        }\n      }': {
    return: PopulateProductMutation;
    variables: PopulateProductMutationVariables;
  };
  '#graphql\n    mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {\n      productVariantsBulkUpdate(productId: $productId, variants: $variants) {\n        productVariants {\n          id\n          price\n          barcode\n          createdAt\n        }\n      }\n    }': {
    return: ShopifyRemixTemplateUpdateVariantMutation;
    variables: ShopifyRemixTemplateUpdateVariantMutationVariables;
  };
  '#graphql\n  mutation SetGoalDiscounts($ownerId: ID!, $value: String!) {\n    metafieldsSet(\n      metafields: [\n        {\n          ownerId: $ownerId,\n          namespace: "spending_goal",\n          key: "goal_discounts",\n          type: "json",\n          value: $value\n        }\n      ]\n    ) {\n      metafields { id namespace key value }\n      userErrors { field message }\n    }\n  }\n': {
    return: SetGoalDiscountsMutation;
    variables: SetGoalDiscountsMutationVariables;
  };
}
declare module '@shopify/admin-api-client' {
  type InputMaybe<T> = AdminTypes.InputMaybe<T>;
  interface AdminQueries extends GeneratedQueryTypes {}
  interface AdminMutations extends GeneratedMutationTypes {}
}
