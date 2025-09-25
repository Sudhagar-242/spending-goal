// import type { LoaderFunction } from '@remix-run/node';
// import { ApiVersion } from '@shopify/shopify-app-remix/server';
// import { authenticate } from 'app/models/shopify.server';


// interface Product {
//   id: string;
//   title: string;
//   description: string;
// }

// export const loader: LoaderFunction = async ({ request }) => {
//   try {
//     const { admin, session } = await authenticate.admin(request);

//     if (!admin || !session) {
//       return new Response('Unauthorized', { status: 401 });
//     }

//     const SHOP_URL = session.shop;
//     const API_VERSION = ApiVersion;
//     const ACCESS_TOKEN = session.accessToken;

//     const query = `
//       query getProducts($first: Int!) {
//         products(first: $first) {
//           edges {
//             node {
//               id
//               title
//               description
//             }
//           }
//         }
//       }
//     `;

//     const variables = { first: 20 };

//     const response = await fetch(`${SHOP_URL}/admin/api/${API_VERSION}/graphql.json`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Shopify-Access-Token': ACCESS_TOKEN ?? '',
//       },
//       body: JSON.stringify({ query, variables }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       return new Response(`Failed to fetch products: ${errorText}`, { status: response.status });
//     }

//     const json = await response.json();

//     const products: Product[] = json.data.products.edges.map((edge: any) => edge.node);

//     return new Response(JSON.stringify(products), {
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error in loader:', error);
//     return new Response('Internal Server Error', { status: 500 });
//   }
// };


import { authenticate } from "app/models/shopify.server";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";


interface PageInfo {
  hasNextPage: boolean
  endCursor: string
}

interface Data {
  products: Products
}

interface Products {
  edges: Edge[]
  pageInfo: PageInfo
}

interface Edge {
  cursor: string
  node: Node
}

interface Node {
  id: string
  title: string
  description: string
}

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('Loader called');
  // const url = new URL(request.url ?? "hello/hello");
  // const cursor = url.searchParams.get('cursor') ?? null;
  const { admin } = await authenticate.admin(request);
  const query = `query getProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
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
  const variables = { first: 20, after: null };
  const response = await admin.graphql(query, { variables });
  console.log(JSON.stringify(response));
  const data = (await response.json())?.data as Data;
  return json({ products: data?.products , pageInfo: data?.products?.pageInfo});
}
