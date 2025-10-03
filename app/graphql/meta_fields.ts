//query
export const SHOP_AND_GOAL_QUERY = `query ShopAndCartGoal {
    shop {
      id
      name
      url
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

//mutation
export const SET_GOAL_DISCOUNTS_METAFIELD = `
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
      userErrors { code field message }
    }
  }
`;

export const CREATE_OR_UPDATE_METAFIELD = `
mutation SetGoalDiscounts($ownerId: ID!,$key: String!,$namespace: String!, $value: String!, $type: String!) {
    metafieldsSet(
      metafields: [
        {
          ownerId: $ownerId,
          namespace: $namespace,
          key: $key,
          type: $type,
          value: $value
        }
      ]
    ) {
      metafields { id namespace key value }
      userErrors { code field message }
    }
  }
`;

export const SET_DISCOUNT_ID_METAFIELD = `
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
      userErrors { code field message }
    }
  }
`;
