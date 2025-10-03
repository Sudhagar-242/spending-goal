// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Modal,
//   TextField,
//   Checkbox,
//   Thumbnail,
//   InlineStack,
//   Text,
//   Box,
//   BlockStack,
// } from '@shopify/polaris';
// import type { ProductGQL } from 'app/types/app_create-goal';

// interface ProductModalProps {
//   Products: ProductGQL[];
//   selectedProductsProp: (value: string[]) => void;
//   open: boolean;
//   onClose: () => void;
//   initiallySelectedProducts?: string[];
// }

// export default function ProductModal({
//   Products,
//   selectedProductsProp,
//   open,
//   onClose,
//   initiallySelectedProducts,
// }: ProductModalProps) {
//   const [searchValue, setSearchValue] = useState<string>('');
//   const [selectedProducts, setSelectedProducts] = useState<string[]>(
//     sortProducts(initiallySelectedProducts ?? []) ?? [],
//   );
//   const [filteredProducts, setFilteredProducts] = useState(Products)

//   useEffect(() => {
//     setFilteredProducts(prev => Products.filter((product) => product.title.toLowerCase().includes(searchValue.toLowerCase())))  
//   }, [searchValue]);

//   function sortProducts(selected: string[]) {
//     const sortedProducts = Products.sort((a, b) => {
//       const aSelected = selected?.includes(a.id);
//       const bSelected = selected?.includes(b.id);
//       return bSelected ? 1 : aSelected ? -1 : 0;
//     });
//     return sortedProducts.map((product) => product.id);
//   }

//   const handleSearchChange = useCallback((value: string) => {
//     setSearchValue(value);
//     return false;
//   }, []);

//   const handleCheckboxChange = useCallback((productId: string, checked: boolean) => {
//     setSelectedProducts(prev => checked ? [...prev, productId] : prev.filter(id => id !== productId));
//   }, []);

//   const handleSelect = useCallback(() => {
//     selectedProductsProp(selectedProducts);
//     onClose();
//   }, [selectedProducts, selectedProductsProp, onClose]);

//   return (
//     <Modal
//       title="Select Products"
//       open={open}
//       onClose={onClose}
//       primaryAction={{
//         content: 'Select',
//         onAction: handleSelect,
//       }}
//       secondaryActions={[
//         {
//           content: 'Cancel',
//           onAction: onClose,
//         },
//       ]}
//     >
//       <Box
//         as="section"
//         paddingBlockStart="400"
//         paddingBlockEnd="400"
//         paddingInlineStart="400"
//         paddingInlineEnd="400"
//       >
//         <BlockStack gap="400">
//           <TextField
//             label="Search products"
//             value={searchValue}
//             onChange={handleSearchChange}
//             autoComplete="off"
//             placeholder="Search products"
//           />
//           <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//             <Text as="h3" variant="headingMd">
//               Products ({filteredProducts.length})
//             </Text>
//             {filteredProducts.map((product) => (
//               <InlineStack
//                 key={product.id}
//                 align="space-between"
//                 blockAlign="center"
//                 wrap={true}
//                 gap="400"
//               >
//                 <Checkbox
//                   id={product.id}
//                   label={
//                     <InlineStack blockAlign="center" wrap={false} gap="400">
//                       {product.featuredMedia?.preview && (
//                         <Thumbnail
//                           source={product?.featuredMedia?.preview.image.url}
//                           alt={product.title}
//                           size="small"
//                         />
//                       )}
//                       <Text variant="bodyMd" as="span">
//                         {product.title}
//                       </Text>
//                     </InlineStack>
//                   }
//                   checked={selectedProducts.includes(product.id)}
//                   onChange={(checked) => handleCheckboxChange(product.id, checked)}
//                 />
//               </InlineStack>
//             ))}
//           </div>
//         </BlockStack>
//       </Box>
//     </Modal>
//   );
// }

// // export default function ProductModal(selectedProductsProp: any = (value) => {
// //     console.log('Selected Products From Props:', value);
// // },open: any, onClose: any) {
// //   const [searchValue, setSearchValue] = useState('');
// //   const [selectedProducts, setSelectedProducts] = useState([]);
// //   const [isOpen, setIsOpen] = useState(open);

// //   const handleSearchChange = useCallback((value) => setSearchValue(value), []);

// //   const handleCheckboxChange = useCallback((productId, checked) => {
// //     setSelectedProducts((prev) =>
// //       checked ? [...prev, productId] : prev.filter((id) => id !== productId),
// //     );
// //   }, []);

// //   const filteredProducts = products.filter((product) =>
// //     product.name.toLowerCase().includes(searchValue.toLowerCase()),
// //   );

// //   const handleSelect = useCallback(() => {
// //     console.log('Selected Products:', selectedProducts);
// //     selectedProductsProp(selectedProducts);
// //     setIsOpen(false);
// //     onClose();
// //   }, [selectedProducts]);

// //   return (
// //     <Modal
// //       title="Select Products"
// //       open={isOpen}
// //       onClose={() => setIsOpen(false)}
// //       primaryAction={{
// //         content: 'Select',
// //         onAction: handleSelect,
// //       }}
// //       secondaryActions={[
// //         {
// //           content: 'Cancel',
// //           onAction: () => setIsOpen(false),
// //         },
// //       ]}
// //     >
// //       <Box
// //         as="section"
// //         paddingBlockStart="400"
// //         paddingBlockEnd="400"
// //         paddingInlineStart="400"
// //         paddingInlineEnd="400"
// //         overflowY='hidden'
// //         overflowX='hidden'
// //       >
// //         <BlockStack gap="400" align="center">
// //           <TextField
// //             label="Search products"
// //             value={searchValue}
// //             onChange={handleSearchChange}
// //             autoComplete="off"
// //             placeholder="Search products"
// //           />
// //           <div style={{ maxHeight: "400px", overflowY: "auto" }}>
// //             <Text as="h3" variant="headingMd">
// //               Products ({filteredProducts.length})
// //             </Text>
// //             {filteredProducts.map((product) => (
// //               <InlineStack
// //                 key={product.id}
// //                 align="space-between"
// //                 blockAlign="center"
// //                 wrap={true}
// //                 gap="400"
// //               >
// //                 <Checkbox
// //                   id={product.id}
// //                   label={
// //                     <InlineStack blockAlign="center" wrap={false} gap="400">
// //                       <Thumbnail source={product.image} alt={product.name} size="small" />
// //                       <Text variant="bodyMd" as="span">
// //                         {product.name}
// //                       </Text>
// //                     </InlineStack>
// //                   }
// //                   checked={selectedProducts.includes(product.id)}
// //                   onChange={(checked) => handleCheckboxChange(product.id, checked)}
// //                 />
// //               </InlineStack>
// //             ))}
// //           </div>
// //         </BlockStack>
// //       </Box>
// //     </Modal>
// //   );
// // }



import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  TextField,
  Checkbox,
  Thumbnail,
  InlineStack,
  Text,
  Box,
  BlockStack,
} from '@shopify/polaris';
import type { ProductGQL } from 'app/types/app_create-goal';

interface ProductModalProps {
  Products: ProductGQL[];
  selectedProductsProp: (value: string[]) => void;
  open: boolean;
  onClose: () => void;
  initiallySelectedProducts?: string[];
}

export default function ProductModal({
  Products,
  selectedProductsProp,
  open,
  onClose,
  initiallySelectedProducts = [],
}: ProductModalProps) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initiallySelectedProducts);
  const [filteredProducts, setFilteredProducts] = useState<ProductGQL[]>(Products);



  // Update filtered products when searchValue or Products change
  useEffect(() => {

      // Sort products so that selected ones appear first
  const sortedProducts = [...Products].sort((a, b) => {
    const aSelected = selectedProducts.includes(a.id);
    const bSelected = selectedProducts.includes(b.id);
    return bSelected ? 1 : aSelected ? -1 : 0;
  });

    const filtered = sortedProducts.filter((product) =>
      product.title.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchValue]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleCheckboxChange = useCallback((productId: string, checked: boolean) => {
    setSelectedProducts((prev) =>
      checked ? [...prev, productId] : prev.filter((id) => id !== productId)
    );
  }, []);

  const handleSelect = useCallback(() => {
    selectedProductsProp(selectedProducts);
    onClose();
  }, [selectedProducts, selectedProductsProp, onClose]);

  return (
    <Modal
      title="Select Products"
      open={open}
      onClose={onClose}
      primaryAction={{
        content: 'Select',
        onAction: handleSelect,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Box
        as="section"
        paddingBlockStart="400"
        paddingBlockEnd="400"
        paddingInlineStart="400"
        paddingInlineEnd="400"
      >
        <BlockStack gap="400">
          <TextField
            label="Search products"
            value={searchValue}
            onChange={handleSearchChange}
            autoComplete="off"
            placeholder="Search products"
          />
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Text as="h3" variant="headingMd">
              Products ({filteredProducts.length})
            </Text>
            {filteredProducts.map((product) => (
              <InlineStack
                key={product.id}
                align="space-between"
                blockAlign="center"
                wrap={true}
                gap="400"
              >
                <Checkbox
                  id={product.id}
                  label={
                    <InlineStack blockAlign="center" wrap={false} gap="400">
                      {product.featuredMedia?.preview.image.url && (
                        <Thumbnail
                          source={product.featuredMedia?.preview.image.url}
                          alt={product.title}
                          size="small"
                        />
                      )}
                      <Text variant="bodyMd" as="span">
                        {product.title}
                      </Text>
                    </InlineStack>
                  }
                  checked={selectedProducts.includes(product.id)}
                  onChange={(checked) => handleCheckboxChange(product.id, checked)}
                />
              </InlineStack>
            ))}
          </div>
        </BlockStack>
      </Box>
    </Modal>
  );
}



// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   Modal,
//   TextField,
//   Checkbox,
//   Thumbnail,
//   InlineStack,
//   Text,
//   Box,
//   BlockStack,
// } from '@shopify/polaris';
// import type { ProductGQL } from 'app/types/app_create-goal';

// interface ProductModalProps {
//   Products: ProductGQL[];
//   selectedProductsProp: (value: string[]) => void;
//   open: boolean;
//   onClose: () => void;
//   initiallySelectedProducts?: string[];
// }

// export default function ProductModal({
//   Products,
//   selectedProductsProp,
//   open,
//   onClose,
//   initiallySelectedProducts,
// }: ProductModalProps) {
//   const [searchValue, setSearchValue] = useState<string>('');
//   const [selectedProducts, setSelectedProducts] = useState<string[]>(() =>
//     sortProducts(initiallySelectedProducts ?? [], Products),
//   );
//   const [filteredProducts, setFilteredProducts] = useState<ProductGQL[]>(Products);

//   // Update filteredProducts when searchValue or Products change
//   useEffect(() => {
//     setFilteredProducts(
//       Products.filter((product) =>
//         product.title.toLowerCase().includes(searchValue.toLowerCase()),
//       ),
//     );
//   }, [searchValue, Products]);

//   // Update selectedProducts if initiallySelectedProducts or Products change
//   useEffect(() => {
//     setSelectedProducts(sortProducts(initiallySelectedProducts ?? [], Products));
//   }, [initiallySelectedProducts, Products]);

//   // Sort products so selected ones appear first, return array of product IDs
//   function sortProducts(selected: string[], products: ProductGQL[]) {
//     // Clone products before sorting to avoid mutating props
//     const sortedProducts = [...products].sort((a, b) => {
//       const aSelected = selected.includes(a.id);
//       const bSelected = selected.includes(b.id);
//       if (aSelected === bSelected) return 0;
//       return aSelected ? -1 : 1;
//     });
//     return sortedProducts.map((product) => product.id);
//   }

//   const handleSearchChange = useCallback((value: string) => {
//     setSearchValue(value);
//     return false;
//   }, []);

//   const handleCheckboxChange = useCallback((productId: string, checked: boolean) => {
//     setSelectedProducts((prev) =>
//       checked && !prev.includes(productId)
//         ? [...prev, productId]
//         : prev.filter((id) => id !== productId),
//     );
//   }, []);

//   const handleSelect = useCallback(() => {
//     selectedProductsProp(selectedProducts);
//     onClose();
//   }, [selectedProducts, selectedProductsProp, onClose]);

//   return (
//     <Modal
//       title="Select Products"
//       open={open}
//       onClose={onClose}
//       primaryAction={{
//         content: 'Select',
//         onAction: handleSelect,
//       }}
//       secondaryActions={[
//         {
//           content: 'Cancel',
//           onAction: onClose,
//         },
//       ]}
//     >
//       <Box
//         as="section"
//         paddingBlockStart="400"
//         paddingBlockEnd="400"
//         paddingInlineStart="400"
//         paddingInlineEnd="400"
//       >
//         <BlockStack gap="400">
//           <TextField
//             label="Search products"
//             value={searchValue}
//             onChange={handleSearchChange}
//             autoComplete="off"
//             placeholder="Search products"
//           />
//           <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//             <Text as="h3" variant="headingMd">
//               Products ({filteredProducts.length})
//             </Text>
//             {filteredProducts.map((product) => (
//               <InlineStack
//                 key={product.id}
//                 align="space-between"
//                 blockAlign="center"
//                 wrap={true}
//                 gap="400"
//               >
//                 <Checkbox
//                   id={product.id}
//                   label={
//                     <InlineStack blockAlign="center" wrap={false} gap="400">
//                       {product.featuredMedia?.preview && (
//                         <Thumbnail
//                           source={product.featuredMedia.preview.image.url}
//                           alt={product.title}
//                           size="small"
//                         />
//                       )}
//                       <Text variant="bodyMd" as="span">
//                         {product.title}
//                       </Text>
//                     </InlineStack>
//                   }
//                   checked={selectedProducts.includes(product.id)}
//                   onChange={(checked) => handleCheckboxChange(product.id, checked)}
//                 />
//               </InlineStack>
//             ))}
//           </div>
//         </BlockStack>
//       </Box>
//     </Modal>
//   );
// }
