import React from 'react';
import type { ProductGQL } from 'app/types/app_create-goal';

interface ProductsCtxValueType {
  Products: ProductGQL[];
}

interface ProductsContextProviderProps {
  Products: ProductGQL[];
  children: React.ReactNode;
}

const ProductsCtx = React.createContext<ProductsCtxValueType | null>(null);

export const ProductsContextProvider: React.FC<ProductsContextProviderProps> = ({
  Products,
  children,
}) => {
  return (
    <ProductsCtx.Provider value={{ Products }}>
      {children}
    </ProductsCtx.Provider>
  );
};

export const useProductsContext = () => {
  const context = React.useContext(ProductsCtx);
  if (!context) {
    throw new Error('useProductsContext must be used within a ProductsContextProvider');
  }
  return context;
};

export default ProductsCtx;
