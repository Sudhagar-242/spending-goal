export interface LoaderData {
  shopId: string;
  currencyCode: string;
  goalDiscountArray: GoalDiscountsValue[];
  discountId: string;
  products: ProductsData['products']['edges'] | null;
  pageInfo: ProductsData['products']['pageInfo'] | null;
  error: string;
}

export interface ActionData {
  ok: boolean;
  userErrors?: Array<{ message: string }>;
  metafields?: any;
  goalDiscounts?: GoalDiscountsValue[];
  products?: ProductsData['products']['edges'];
  pageInfo?: ProductsData['products']['pageInfo'];
}

export interface GoalDiscount {
  amount: number;
  discount: number;
}

export interface DiscountData {
  discountId: string;
}

export interface UserError {
  code?: string;
  message: string;
  field?: string[];
}

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ [message: string]: string }>;
};

export interface RootResult<T> {
  data: T;
  extensions: Extensions;
}

export interface ShopData {
  shop: Shop;
}

export interface Shop {
  id: string;
  url: string;
  currencyCode: string;
  goalDiscounts: GoalDiscounts;
  discountId: DiscountId;
}

export interface GoalDiscounts {
  id: string;
  value: string | GoalDiscountsValue[];
  type: string;
}

export type GoalDiscountsValue = {
  name: string;
  amount: string | number;
  discount: string | number;
  successMessage: string;
  progressMessage: string;
};

export interface DiscountId {
  id: string;
  value: string;
  type: string;
}

export interface Extensions {
  cost: Cost;
}

export interface Cost {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ThrottleStatus;
}

export interface ThrottleStatus {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}

export interface VariablesWrapper<TVariables extends Record<string, any>> {
  variables: TVariables;
}

export interface discountAutomaticAppCreate {
  discountAutomaticAppCreate: {
    automaticAppDiscount: {
      discountId: string;
    };
    userErrors: UserError[];
  };
}

export interface ProductsData {
  products: {
    edges: {
      cursor: string;
      node: {
        id: string;
        title: string;
        description: string;
        featuredMedia?: {
          preview: {
            image: {
              url: string;
            };
          };
        };
      };
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}
