import React, { useState, useCallback, useContext } from 'react';
import {
  Layout,
  Banner,
  BlockStack,
  Text,
  RadioButton,
  InlineStack,
  TextField,
  Button,
  Box,
  Thumbnail,
} from '@shopify/polaris';
import ProductModal from './modals/productsModal';
import { DeleteIcon } from "@shopify/polaris-icons";
import type { ProductGQL } from 'app/types/app_create-goal';
import ProductsCtx from 'app/context/productsContext';

// ----------------------
// Props and Types
// ----------------------
type ContentProp<T extends string> = {
  label: string;
  value: T;
  modal?: {
    open: boolean;
    onClose: () => void;
  };
};

type ProductSelectionWidgetProps<T extends string> = {
  contents: ContentProp<T>[];
  onSelectionCompletes: (products: ProductGQL[], type: T) => void;
};

export default function ProductSelectionWidget<T extends string>({
  contents,
  onSelectionCompletes,
}: ProductSelectionWidgetProps<T>) {
  // Ensure initial state is a valid T value
  const initialType = contents[0].value;
  const [selectedProductType, setSelectedProductType] = useState<T>(initialType);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
  const Products = useContext(ProductsCtx)?.Products;

  // ----------------------
  // Handlers
  // ----------------------
  const handleProductTypeChange = useCallback((value: T) => {
    setSelectedProductType(value);
    setSelectedProducts([]);
    onSelectionCompletes([], value); // Notify parent when type changes and products are reset
  }, [onSelectionCompletes]);

  const handleBrowseClick = useCallback(() => {
    setIsProductModalOpen((prev) => !prev);
  }, []);

  const handleSelectedProducts = useCallback(
    (products: string[]) => {
      const selected = products
        .map((id) => Products?.find((p) => p.id === id))
        .filter(Boolean) as ProductGQL[];
      setSelectedProducts(selected);
      onSelectionCompletes(selected, selectedProductType);
      console.log('Selected Products:', selected);
    },
    [Products, onSelectionCompletes, selectedProductType]
  );

  const handleProductsListEdit = useCallback((id: string) => {
    const updatedProducts = selectedProducts.filter((product) => product.id !== id);
    setSelectedProducts(updatedProducts);
    onSelectionCompletes(updatedProducts, selectedProductType); // Notify parent when a product is removed
  }, [selectedProducts, selectedProductType, onSelectionCompletes]);

  // ----------------------
  // Render
  // ----------------------
  return (
    <>
      <Layout>
        <Layout.Section variant="oneHalf">
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="headingMd" as="h6">
                Create New Spending Goal
              </Text>
              <BlockStack gap="200">
                {contents.map((content, index) => (
                  <React.Fragment key={index}>
                    <RadioButton
                      label={content.label}
                      id={content.value}
                      name="product-selection"
                      checked={selectedProductType === content.value}
                      onChange={() => handleProductTypeChange(content.value)}
                    />
                    {content.modal && selectedProductType === content.value && (
                      <BlockStack gap="200">
                        <InlineStack
                          gap="200"
                          align="space-between"
                          blockAlign="start"
                          wrap
                        >
                          <TextField
                            label="Search products"
                            placeholder="Search products"
                            readOnly
                            autoComplete="off"
                            aria-label="Search products"
                            onFocus={handleBrowseClick}
                          />
                          <Button
                            variant="secondary"
                            size="medium"
                            textAlign="center"
                            onClick={handleBrowseClick}
                          >
                            Browse
                          </Button>
                        </InlineStack>
                        {selectedProducts.length > 0 ? (
                          <BlockStack gap="200">
                            <Text variant="headingSm" as="h3">
                              Selected Products:
                            </Text>
                            {selectedProducts.map((product) => (
                              <InlineStack
                                key={product.id}
                                align="space-between"
                                gap="200"
                                wrap
                              >
                                <InlineStack align="start" gap="200">
                                  <Thumbnail
                                    source={
                                      product.featuredMedia?.preview.image.url ?? ''
                                    }
                                    alt={product.title}
                                    size="small"
                                  />
                                  <Text variant="bodyMd" as="p">
                                    {product.title}
                                  </Text>
                                </InlineStack>
                                <Button
                                  size="medium"
                                  textAlign="center"
                                  icon={DeleteIcon}
                                  onClick={() => handleProductsListEdit(product.id)}
                                />
                              </InlineStack>
                            ))}
                          </BlockStack>
                        ) : (
                          <Banner title="No Products Selected" tone="info">
                            Browse to select Products...
                          </Banner>
                        )}
                      </BlockStack>
                    )}
                  </React.Fragment>
                ))}
              </BlockStack>
            </BlockStack>
          </Box>
        </Layout.Section>
        <Layout.Section variant="oneHalf"></Layout.Section>
      </Layout>
      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          selectedProductsProp={handleSelectedProducts}
          open={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          initiallySelectedProducts={selectedProducts.map((product) => product.id)}
          Products={Products ?? []}
        />
      )}
    </>
  );
}
