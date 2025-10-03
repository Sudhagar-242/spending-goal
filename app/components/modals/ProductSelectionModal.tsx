import { useState } from 'react';
import { Modal, TextField, Button, Box, InlineStack, ResourceList, Text } from '@shopify/polaris';
import type { ProductsData } from 'app/types/app_create-goal';

interface ProductSelectionProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  products: ProductsData["products"]['edges'];
}

function ProductSelectionModal({ open=true, onClose, onSubmit }: ProductSelectionProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [searchValue, setSearchValue] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Record<string, any>[]>([]);

function handleClose() {
  setIsOpen(false);
  onClose();
}

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleItemClick = (itemId: string) => {
    console.log('Item clicked:', itemId);
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => handleClose()}
      title="Select Products"
    >
      <Modal.Section>
        <Box paddingBlockStart="400" paddingBlockEnd="400" paddingInlineStart="400" paddingInlineEnd="400">
          <TextField
            label="Search products"
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            placeholder="Search products"
            autoComplete='on'
          />
          <ResourceList
            items={filteredProducts}
            renderItem={(item) => {
              return (
                  <ResourceList.Item
                    id={item.id}
                    name={item.name}
                    onClick={() => handleItemClick(item.id)}
                  >
                    <Text variant="bodyMd" as="p">{item.name}</Text>
                  </ResourceList.Item>
              );
            }}
            selectedItems={selectedProducts}
            onSelectionChange={(selectedItems) => {
              setSelectedProducts(selectedItems);
            }}
            selectable
          />
        </Box>
      </Modal.Section>
      <Modal.Section>
        <Box paddingBlockStart="400" paddingBlockEnd="400" paddingInlineStart="400" paddingInlineEnd="400">
          <InlineStack align="end" gap="400">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              onSubmit({actionType: "products"});
              setIsOpen(false);
            }}>Select</Button>
          </InlineStack>
        </Box>
      </Modal.Section>
    </Modal>
  );
}

export default ProductSelectionModal;

