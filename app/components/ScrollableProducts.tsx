// app/components/Products.tsx or routes/products.tsx
import { useEffect, useState, useRef } from 'react';
import { Card, DataTable, Spinner } from '@shopify/polaris';

interface ProductProps{
  ShopUrl: string;
  ApiVersion: string;
  AccessToken: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
}



export default function ScrollableProducts({ShopUrl, ApiVersion, AccessToken}: ProductProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);


  // 🧠 Fetch products with pagination

  
  async function fetchProducts(cursor: string | null = null) {
    console.log('[fetchProducts] Called with cursor:', cursor);
    setLoading(true);

    const query = `
      query getProducts($first: Int!, $after: String) {
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
      }
    `;

    const variables = { first: 20, after: cursor };
    console.log('[fetchProducts] Sending GraphQL request:', { query, variables });

    console.log('[fetchProducts] Fetching from:', `${ShopUrl}/admin/api/${ApiVersion}/graphql.json`);
    const response = await fetch(`${ShopUrl}/admin/api/${ApiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': AccessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json();
    console.log('[fetchProducts] Response JSON:', json);

    const edges = json?.data?.products?.edges || [];
    const pageInfo = json?.data?.products?.pageInfo || {};
    console.log('[fetchProducts] Edges:', edges);
    console.log('[fetchProducts] PageInfo:', pageInfo);

    const newProducts = edges.map((edge: any) => edge.node);
    console.log('[fetchProducts] New products:', newProducts);

    setProducts((prev) => {
      const updated = [...prev, ...newProducts];
      console.log('[setProducts] Updated products:', updated);
      return updated;
    });
    setEndCursor(pageInfo.endCursor);
    setHasNextPage(pageInfo.hasNextPage);
    setLoading(false);
    console.log('[fetchProducts] Loading finished.');
  }

  // 🧭 Load on scroll using IntersectionObserver
  useEffect(() => {
    if (!loaderRef.current) return;
    console.log('[useEffect] Setting up IntersectionObserver. endCursor:', endCursor, 'hasNextPage:', hasNextPage, 'loading:', loading);

    const observer = new IntersectionObserver(
      (entries) => {
        console.log('[IntersectionObserver] Entries:', entries);
        if (entries[0].isIntersecting && hasNextPage && !loading) {
          console.log('[IntersectionObserver] Loader visible, fetching more products...');
          fetchProducts(endCursor);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(loaderRef.current);

    return () => {
      console.log('[useEffect] Cleaning up IntersectionObserver.');
      observer.disconnect();
    };
  }, [endCursor, hasNextPage, loading]);

  // 🚀 Initial load
  useEffect(() => {
    console.log('[useEffect] Initial load, fetching products...');
    fetchProducts();
  }, []);

  // 🧾 Format products for the DataTable
  const rows = products.map((product, idx) => {
    console.log(`[DataTable] Row ${idx}:`, product);
    return [
      product.title,
      product.description || '—',
    ];
  });

  return (
    <Card title="All Products">
      <DataTable
        columnContentTypes={['text', 'text']}
        headings={['Title', 'Description']}
        rows={rows}
      />

      <div ref={loaderRef} style={{ height: '60px', textAlign: 'center', padding: '10px' }}>
        {loading && <Spinner accessibilityLabel="Loading products" size="small" />}
      </div>
    </Card>
  );
}
