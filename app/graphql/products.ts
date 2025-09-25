export const GET_PRODUCTS_WITH_CURSOR = `query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              description
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`;

// export const GET_PRODUCTS_WITH_CURSOR = `query getProducts {
//         products(first: 20) {
//           edges {
//             node {
//               id
//               title
//               description
//             }
//           }
//           pageInfo {
//             hasNextPage
//             endCursor
//           }
//         }
//       }`;
