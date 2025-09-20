//Query
export const FUNCTION_AUTOMATIC_DISCOUNT_QUERY = `
  query getDiscount($id: ID!){
  discountNode(id: $id){
    id
    discount{
      ... on DiscountAutomaticApp{
        title
        appDiscountType{
          title
        }
      }
    }
  }
}
`;

//mutations
export const CREATE_AUTOMATIC_DISCOUNT_MUTATION = `
  mutation CreateAutomaticDiscount($discountInput: DiscountAutomaticAppInput!) {
    discountAutomaticAppCreate(automaticAppDiscount: $discountInput) {
      automaticAppDiscount {
        discountId
      }
      userErrors { code field message }
    }
  }
`;

export interface CREATE_AUTOMATIC_DISCOUNT_MUTATION_TYPE {
  discountInput: {
    title: string;
    functionId: string;
    startsAt: string;
    discountClasses: ('PRODUCT' | 'SHIPPING' | 'ORDER')[];
    combinesWith: {
      orderDiscounts: boolean;
      productDiscounts: boolean;
      shippingDiscounts: boolean;
    };
  };
}

export const UPDATE_AUTOMATIC_DISCOUNT_MUTATION = `
  mutation UpdateAutomaticDiscount($id: ID!,$discountInput: DiscountAutomaticAppInput!) {
    discountAutomaticAppUpdate(id: $id,automaticAppDiscount: $discountInput) {
      automaticAppDiscount {
        discountId
      }
      userErrors { code field message }
    }
  }
`;
