// import React, { useCallback, useState } from 'react';
// import {
//   AppProvider,
//   Layout,
//   Box,
//   BlockStack,
//   InlineStack,
//   Text,
//   RadioButton,
//   TextField,
//   Banner,
//   Button,
//   RangeSlider,
//   Icon,
//   Frame,
//   List,
//   ChoiceList,
//   Card,
//   TextContainer,
// } from '@shopify/polaris';
// import { SearchIcon, AlertTriangleIcon } from '@shopify/polaris-icons';
// import '@shopify/polaris/build/esm/styles.css';

// const SpendingGoalWidget = () => {
//   const [selectedOption, setSelectedOption] = useState('specific');
//   const [goalName, setGoalName] = useState('New Spending Goal 1');
//   const [spendingGoalAmount, setSpendingGoalAmount] = useState('100');
//   const [discountType, setDiscountType] = useState('percentage');
//   const [discountValue, setDiscountValue] = useState('10');
//   const [atZeroGoalText, setAtZeroGoalText] = useState('Spend {{ goal_amount }} to get {{ discount_value }} discount!');
//   const [atHundredGoalText, setAtHundredGoalText] = useState('Congratulations! You get {{ discount_value }} discount on this order.');
//   const [textSize, setTextSize] = useState('16');
//   const [gradientStartColor, setGradientStartColor] = useState('#4033cc');
//   const [gradientEndColor, setGradientEndColor] = useState('#6659a6');
//   const [textColor, setTextColor] = useState('#202020');
//   const [iconType, setIconType] = useState('goal');
//   const [progressBarShape, setProgressBarShape] = useState('circle');
//   const [goalPosition, setGoalPosition] = useState('left');
//   const [topOffset, setTopOffset] = useState('60');

//   const handleOptionChange = (value) => setSelectedOption(value);
//   const handleGoalNameChange = (value) => setGoalName(value);
//   const handleSpendingGoalAmountChange = (value) => setSpendingGoalAmount(value);
//   const handleDiscountTypeChange = (value) => setDiscountType(value);
//   const handleDiscountValueChange = (value) => setDiscountValue(value);
//   const handleAtZeroGoalTextChange = (value) => setAtZeroGoalText(value);
//   const handleAtHundredGoalTextChange = (value) => setAtHundredGoalText(value);
//   const handleTextSizeChange = (value) => setTextSize(value);
//   const handleGradientStartColorChange = (value) => setGradientStartColor(value);
//   const handleGradientEndColorChange = (value) => setGradientEndColor(value);
//   const handleTextColorChange = (value) => setTextColor(value);
//   const handleIconTypeChange = (value) => setIconType(value);
//   const handleProgressBarShapeChange = (value) => setProgressBarShape(value);
//   const handleGoalPositionChange = (value) => setGoalPosition(value);
//   const handleTopOffsetChange = (value) => setTopOffset(value);

//   return (
//     <AppProvider>
//       <Layout>
//         <Layout.Section>
//           <BlockStack gap="400">
//             {/* Product Selection */}
//             <Box padding="400">
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h6">
//                   Product Selection
//                 </Text>
//                 <Text variant="bodyMd" as="p" color="subdued">
//                   The discount applies only when customers buy from the selected products.
//                 </Text>
//                 <BlockStack gap="200">
//                   <RadioButton
//                     label="Any product"
//                     id="any-product"
//                     name="product-selection"
//                     checked={selectedOption === 'any'}
//                     onChange={() => handleOptionChange('any')}
//                   />
//                   <RadioButton
//                     label="Specific product or collection"
//                     id="specific-product"
//                     name="product-selection"
//                     checked={selectedOption === 'specific'}
//                     onChange={() => handleOptionChange('specific')}
//                   />
//                   {selectedOption === 'specific' && (
//                     <BlockStack gap="200">
//                       <InlineStack align="space-between">
//                         <TextField
//                           label="Search products"
//                           prefix={<Icon source={SearchIcon} />}
//                           placeholder="Search products"
//                           value=""
//                           onChange={() => {}}
//                           autoComplete="off"
//                         />
//                         <Button variant="secondary">Browse</Button>
//                       </InlineStack>
//                       <Banner
//                         status="warning"
//                         icon={AlertTriangleIcon}
//                         title="A product or collection selection is required"
//                       />
//                     </BlockStack>
//                   )}
//                 </BlockStack>
//               </BlockStack>
//             </Box>

//             {/* Create New Spending Goal */}
//             <Box padding="400">
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h6">
//                   Create New Spending Goal
//                 </Text>
//                 <BlockStack gap="200">
//                   <TextField
//                     label="Goal Name"
//                     value={goalName}
//                     onChange={handleGoalNameChange}
//                   />
//                   <TextField
//                     label="Spending Goal Amount"
//                     value={spendingGoalAmount}
//                     onChange={handleSpendingGoalAmountChange}
//                     suffix="INR"
//                     type="number"
//                   />
//                   <InlineStack gap="200">
//                     <Button
//                       variant="secondary"
//                       pressed={discountType === 'percentage'}
//                       onClick={() => handleDiscountTypeChange('percentage')}
//                     >
//                       Percentage
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       pressed={discountType === 'fixed'}
//                       onClick={() => handleDiscountTypeChange('fixed')}
//                     >
//                       Fixed Amount
//                     </Button>
//                   </InlineStack>
//                   <TextField
//                     label="Discount Value"
//                     value={discountValue}
//                     onChange={handleDiscountValueChange}
//                     suffix={discountType === 'percentage' ? '%' : 'INR'}
//                     type="number"
//                   />
//                 </BlockStack>
//               </BlockStack>
//             </Box>
//           </BlockStack>
//         </Layout.Section>

//         <Layout.Section>
//           <BlockStack gap="400">
//             {/* Text Formatting */}
//             <Box padding="400">
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h6">
//                   Text Formatting Options
//                 </Text>
//                 <BlockStack gap="200">
//                   <TextField
//                     label="At 0% Goal Text:"
//                     value={atZeroGoalText}
//                     onChange={handleAtZeroGoalTextChange}
//                     helpText="Default is: Spend {{ goal_amount }} to get {{ discount_value }} discount!"
//                   />
//                   <TextField
//                     label="At 100% Goal Completed Text:"
//                     value={atHundredGoalText}
//                     onChange={handleAtHundredGoalTextChange}
//                     helpText="Default is: Congratulations! You get {{ discount_value }} discount on this order."
//                   />
//                   <RangeSlider
//                     label="Text Size"
//                     value={Number(textSize)}
//                     onChange={handleTextSizeChange}
//                     min={12}
//                     max={18}
//                     step={1}
//                     suffix="px"
//                   />
//                 </BlockStack>
//               </BlockStack>
//             </Box>

//             {/* Widget Appearance */}
//             <Box padding="400">
//               <BlockStack gap="200">
//                 <Text variant="headingMd" as="h6">
//                   Widget Appearance
//                 </Text>
//                 <BlockStack gap="200">
//                   <InlineStack gap="200">
//                     <TextField
//                       label="Gradient Start Color"
//                       prefix="#"
//                       value={gradientStartColor}
//                       onChange={handleGradientStartColorChange}
//                     />
//                     <TextField
//                       label="Gradient End Color"
//                       prefix="#"
//                       value={gradientEndColor}
//                       onChange={handleGradientEndColorChange}
//                     />
//                     <TextField
//                       label="Text Color"
//                       prefix="#"
//                       value={textColor}
//                       onChange={handleTextColorChange}
//                     />
//                   </InlineStack>
//                   <InlineStack gap="200">
//                     <Button
//                       variant="secondary"
//                       pressed={iconType === 'cart'}
//                       onClick={() => handleIconTypeChange('cart')}
//                     >
//                       Cart
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       pressed={iconType === 'trophy'}
//                       onClick={() => handleIconTypeChange('trophy')}
//                     >
//                       Trophy
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       pressed={iconType === 'goal'}
//                       onClick={() => handleIconTypeChange('goal')}
//                     >
//                       Goal
//                     </Button>
//                   </InlineStack>
//                   <InlineStack gap="200">
//                     <Button
//                       variant="secondary"
//                       pressed={progressBarShape === 'linear'}
//                       onClick={() => handleProgressBarShapeChange('linear')}
//                     >
//                       Linear
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       pressed={progressBarShape === 'circle'}
//                       onClick={() => handleProgressBarShapeChange('circle')}
//                     >
//                       Circle
//                     </Button>
//                   </InlineStack>
//                   <InlineStack gap="200">
//                     <Button
//                       variant="secondary"
//                       pressed={goalPosition === 'left'}
//                       onClick={() => handleGoalPositionChange('left')}
//                     >
//                       Left
//                     </Button>
//                     <Button
//                       variant="secondary"
//                       pressed={goalPosition === 'right'}
//                       onClick={() => handleGoalPositionChange('right')}
//                     >
//                       Right
//                     </Button>
//                   </InlineStack>
//                   <TextField
//                     label="Top Offset (%)"
//                     value={topOffset}
//                     onChange={handleTopOffsetChange}
//                     suffix="%"
//                     type="number"
//                   />
//                 </BlockStack>
//               </BlockStack>
//             </Box>
//           </BlockStack>
//         </Layout.Section>
//       </Layout>
//     </AppProvider>
//   );
// };

// function SpendingGoalWidget() {
//   const [Radio, setRadio] = useState<string[]>(['none']);

//   const handleChoiceListChange = useCallback((value: string[]) => setRadio(value), []);

//   const renderChildren = useCallback(
//     (isSelected: boolean) =>
//       isSelected && (
//         <>
//           <InlineStack align="space-between" blockAlign="start" wrap>
//             <TextField
//               label="Search products"
//               placeholder="Search products"
//               readOnly
//               autoComplete="off"
//               aria-label="Search products"
//             />
//             <Button variant="secondary" size="medium" textAlign="center">
//               Browse
//             </Button>
//           </InlineStack>

//           <Box paddingBlockStart="400">
//             <Banner title="A product or collection selection is required" tone="warning" />
//           </Box>
//         </>
//       ),
//     [],
//   );

//   return (
//     <>
//       <Layout>
//         <Layout.Section>
//           <Banner
//             title="USPS has updated their rates"
//             action={{ content: 'Update rates', url: '' }}
//             secondaryAction={{ content: 'Learn more' }}
//             tone="info"
//             onDismiss={() => {}}
//           >
//             <p>Make sure you know how these changes affect your store.</p>
//           </Banner>
//           <Banner
//             title="Before you can purchase a shipping label, this change needs to be made:"
//             action={{ content: 'Edit address' }}
//             tone="warning"
//           >
//             <List>
//               <List.Item>
//                 The name of the city you’re shipping to has characters that aren’t allowed. City
//                 name can only include spaces and hyphens.
//               </List.Item>
//             </List>
//           </Banner>
//         </Layout.Section>
//       </Layout>
//       <Layout>
//         <Layout.Section variant="oneHalf">
//           <Box padding="400">
//             <BlockStack gap="200">
//               <Text variant="headingMd" as="h6">
//                 Create New Spending Goal
//               </Text>
//               <BlockStack gap="200">
//                 <Text as="p"> Select</Text>
//                 <RadioButton label="Any product" id="any-product" name="product-selection" />
//                 <RadioButton
//                   label="Specific product or collection"
//                   id="specific-product"
//                   name="product-selection"
//                 />
//               </BlockStack>
//               <ChoiceList
//                 title="Discount minimum requirements"
//                 choices={[
//                   { label: 'None', value: 'none' },
//                   { label: 'Minimum purchase', value: 'minimum_purchase' },
//                   {
//                     label: 'Minimum quantity',
//                     value: 'minimum_quantity',
//                     renderChildren,
//                   },
//                 ]}
//                 selected={Radio}
//                 onChange={handleChoiceListChange}
//               />
//             </BlockStack>
//           </Box>
//         </Layout.Section>
//         <Layout.Section variant="oneHalf"></Layout.Section>
//       </Layout>
//     </>
//   );
// }

// export default SpendingGoalWidget;

// import React, { useState, useCallback } from 'react';
// import {
//   Layout,
//   Banner,
//   BlockStack,
//   Text,
//   RadioButton,
//   ChoiceList,
//   InlineStack,
//   TextField,
//   Button,
//   Box,
//   List,
// } from '@shopify/polaris';
// import ProductModal from './productsModal';

// function SpendingGoalWidget() {
//   const [selectedProductType, setSelectedProductType] = useState<string>('any-product');
//   const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
//   const [radio, setRadio] = useState<string[]>(['none']);

//   const handleProductTypeChange = useCallback((value: string) => {
//     setSelectedProductType(value);
//   }, []);

//   const handleChoiceListChange = useCallback((value: string[]) => setRadio(value), []);

//   const handleBrowseClick = useCallback(() => {
//     setIsProductModalOpen(true);
//   }, []);

//   const renderChildren = useCallback(
//     (isSelected: boolean) =>
//       isSelected && (
//         <>
//           <InlineStack align="space-between" blockAlign="start" wrap>
//             <TextField
//               label="Search products"
//               placeholder="Search products"
//               readOnly
//               autoComplete="off"
//               aria-label="Search products"
//             />
//             <Button variant="secondary" size="medium" textAlign="center" onClick={handleBrowseClick}>
//               Browse
//             </Button>
//           </InlineStack>
//           <Box paddingBlockStart="400">
//             <Banner title="A product or collection selection is required" tone="warning" />
//           </Box>
//         </>
//       ),
//     [],
//   );

//   return (
//     <>
//       <Layout>
//         <Layout.Section>
//           <Banner
//             title="USPS has updated their rates"
//             action={{ content: 'Update rates', url: '' }}
//             secondaryAction={{ content: 'Learn more' }}
//             tone="info"
//             onDismiss={() => {}}
//           >
//             <p>Make sure you know how these changes affect your store.</p>
//           </Banner>
//           <Banner
//             title="Before you can purchase a shipping label, this change needs to be made:"
//             action={{ content: 'Edit address' }}
//             tone="warning"
//           >
//             <List>
//               <List.Item>
//                 The name of the city you’re shipping to has characters that aren’t allowed. City
//                 name can only include spaces and hyphens.
//               </List.Item>
//             </List>
//           </Banner>
//         </Layout.Section>
//       </Layout>
//       <Layout>
//         <Layout.Section variant="oneHalf">
//           <Box padding="400">
//             <BlockStack gap="200">
//               <Text variant="headingMd" as="h6">
//                 Create New Spending Goal
//               </Text>
//               <BlockStack gap="200">
//                 <Text as="p">Select</Text>
//                 <RadioButton
//                   label="Any product"
//                   id="any-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'any-product'}
//                   onChange={() => handleProductTypeChange('any-product')}
//                 />
//                 <RadioButton
//                   label="Specific product or collection"
//                   id="specific-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'specific-product'}
//                   onChange={() => handleProductTypeChange('specific-product')}
//                 />
//               </BlockStack>
//               {selectedProductType === 'specific-product' && (
//                 <ChoiceList
//                   title="Discount minimum requirements"
//                   choices={[
//                     { label: 'None', value: 'none' },
//                     { label: 'Minimum purchase', value: 'minimum_purchase' },
//                     {
//                       label: 'Minimum quantity',
//                       value: 'minimum_quantity',
//                       renderChildren,
//                     },
//                   ]}
//                   selected={radio}
//                   onChange={handleChoiceListChange}
//                 />
//               )}
//             </BlockStack>
//           </Box>
//         </Layout.Section>
//         <Layout.Section variant="oneHalf"></Layout.Section>
//       </Layout>
//       {isProductModalOpen && (
//         <ProductModal
//           open={isProductModalOpen}
//           onClose={() => setIsProductModalOpen(false)}
//         />
//       )}
//     </>
//   );
// }

// export default SpendingGoalWidget;

// import React, { useState, useCallback } from 'react';
// import {
//   Layout,
//   Banner,
//   BlockStack,
//   Text,
//   RadioButton,
//   InlineStack,
//   TextField,
//   Button,
//   Box,
//   List,
// } from '@shopify/polaris';
// import ProductModal from './productsModal';

// function SpendingGoalWidget() {
//   const [selectedProductType, setSelectedProductType] = useState<string>('any-product');
//   const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);

//   const handleProductTypeChange = useCallback((value: string) => {
//     setSelectedProductType(value);
//   }, []);

//   const handleBrowseClick = useCallback(() => {
//     setIsProductModalOpen(prev => !prev);
//   }, []);

//   return (
//     <>
//       <Layout>
//         {/* <Layout.Section>
//           <Banner
//             title="USPS has updated their rates"
//             action={{ content: 'Update rates', url: '' }}
//             secondaryAction={{ content: 'Learn more' }}
//             tone="info"
//             onDismiss={() => {}}
//           >
//             <p>Make sure you know how these changes affect your store.</p>
//           </Banner>
//           <Banner
//             title="Before you can purchase a shipping label, this change needs to be made:"
//             action={{ content: 'Edit address' }}
//             tone="warning"
//           >
//             <List>
//               <List.Item>
//                 The name of the city you’re shipping to has characters that aren’t allowed. City
//                 name can only include spaces and hyphens.
//               </List.Item>
//             </List>
//           </Banner>
//         </Layout.Section> */}
//       </Layout>
//       <Layout>
//         <Layout.Section variant="oneHalf">
//           <Box padding="400">
//             <BlockStack gap="200">
//               <Text variant="headingMd" as="h6">
//                 Create New Spending Goal
//               </Text>
//               <BlockStack gap="200">
//                 <Text as="p">Select</Text>
//                 <RadioButton
//                   label="Any product"
//                   id="any-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'any-product'}
//                   onChange={() => handleProductTypeChange('any-product')}
//                 />
//                 <RadioButton
//                   label="Specific product or collection"
//                   id="specific-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'specific-product'}
//                   onChange={() => handleProductTypeChange('specific-product')}
//                 />
//               </BlockStack>
//               {selectedProductType === 'specific-product' && (
//                 <InlineStack align="space-between" blockAlign="start" wrap>
//                   <TextField
//                     label="Search products"
//                     placeholder="Search products"
//                     readOnly
//                     autoComplete="off"
//                     aria-label="Search products"
//                     onFocus={handleBrowseClick}
//                   />
//                   <Button variant="secondary" size="medium" textAlign="center" onClick={handleBrowseClick}>
//                     Browse
//                   </Button>
//                 </InlineStack>
//               )}
//             </BlockStack>
//           </Box>
//         </Layout.Section>
//         <Layout.Section variant="oneHalf"></Layout.Section>
//       </Layout>
//       {isProductModalOpen && (
//         <ProductModal
//         selectedProductsProp={(value: any) => {
//           console.log('Selected Products From Props:', value);
//         }}
//           open={isProductModalOpen}
//           onClose={() => setIsProductModalOpen(false)}
//         />
//       )}
//     </>
//   );
// }

// export default SpendingGoalWidget;

// import React, {useState, useEffect} from 'react';
// import {
//   Page,
//   Card,
//   Layout,
//   FormLayout,
//   TextField,
//   Select,
//   Button,
//   ChoiceList,
//   InlineStack,
//   Badge,
//   Banner,
//   Modal,
//   Text,
//   Checkbox,
//   RangeSlider,
//   EmptyState,
//   ResourceList,
//   Avatar,
//   InlineError,
// } from '@shopify/polaris';

// // CreateGoal_Polaris_Component.jsx
// // Single-file React component that implements a "Create Goal" flow
// // using Shopify Polaris components.
// // - Type selection (Order / Product / Shipping)
// // - Dynamic fields per type
// // - Appearance customization and preview
// // - Validation and review modal

// export default function SpendingGoalWidget() {
//   const [step, setStep] = useState(1);
//   const [type, setType] = useState('order'); // 'order' | 'product' | 'shipping'

//   // Common fields
//   const [title, setTitle] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [active, setActive] = useState(true);

//   // Order-based
//   const [orderThreshold, setOrderThreshold] = useState('50');
//   const [orderDiscountKind, setOrderDiscountKind] = useState('percentage');
//   const [orderDiscountValue, setOrderDiscountValue] = useState('10');

//   // Product-based
//   // In a real app you would fetch products through the Storefront/Admin API.
//   // Here we use a mock product list and allow selecting by id.
//   const mockProducts = [
//     {id: 'gid://product/1', title: 'Blue T‑shirt', img: ''},
//     {id: 'gid://product/2', title: 'Coffee Mug', img: ''},
//     {id: 'gid://product/3', title: 'Sneakers', img: ''},
//   ];
//   const [selectedProductIds, setSelectedProductIds] = useState([]);
//   const [productQuantity, setProductQuantity] = useState('2');
//   const [productRewardKind, setProductRewardKind] = useState('percentage');
//   const [productRewardValue, setProductRewardValue] = useState('15');

//   // Shipping-based
//   const [shippingThreshold, setShippingThreshold] = useState('30');
//   const [shippingRewardKind, setShippingRewardKind] = useState('free'); // 'free' | 'reduced'
//   const [reducedShippingAmount, setReducedShippingAmount] = useState('2.99');

//   // Appearance
//   const [progressColor, setProgressColor] = useState('#5c6ac4');
//   const [motivationText, setMotivationText] = useState('Spend just $%left% more to unlock your reward');
//   const [successMessage, setSuccessMessage] = useState('Congrats! You unlocked the reward 🎉');
//   const [showPreview, setShowPreview] = useState(true);

//   // Review / Modal
//   const [showReview, setShowReview] = useState(false);

//   // Validation errors
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     // Simple validation whenever certain inputs change.
//     const newErrors = {};
//     if (!title.trim()) newErrors.title = 'Give your goal a short title.';

//     if (type === 'order') {
//       if (!isPositiveNumber(orderThreshold)) newErrors.orderThreshold = 'Enter a valid positive number.';
//       if (!isPositiveNumber(orderDiscountValue) || Number(orderDiscountValue) <= 0) newErrors.orderDiscountValue = 'Enter a valid discount value.';
//       if (orderDiscountKind === 'percentage' && Number(orderDiscountValue) > 100) newErrors.orderDiscountValue = 'Percentage cannot exceed 100%.';
//     }

//     if (type === 'product') {
//       if (selectedProductIds.length === 0) newErrors.selectedProductIds = 'Select at least one product.';
//       if (!isPositiveInteger(productQuantity)) newErrors.productQuantity = 'Quantity must be a positive whole number.';
//     }

//     if (type === 'shipping') {
//       if (!isPositiveNumber(shippingThreshold)) newErrors.shippingThreshold = 'Enter a valid positive number.';
//       if (shippingRewardKind === 'reduced' && !isPositiveNumber(reducedShippingAmount)) newErrors.reducedShippingAmount = 'Enter a valid shipping amount.';
//     }

//     setErrors(newErrors);
//   }, [type, title, orderThreshold, orderDiscountValue, selectedProductIds, productQuantity, shippingThreshold, reducedShippingAmount]);

//   function isPositiveNumber(v) {
//     return v !== '' && !isNaN(Number(v)) && Number(v) >= 0;
//   }

//   function isPositiveInteger(v) {
//     return /^[1-9]\d*$/.test(String(v));
//   }

//   function handleSelectProduct(id) {
//     setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
//   }

//   function renderTypeCards() {
//     return (
//       <Layout>
//         <Layout.Section>
//           <Card sectioned>
//             <FormLayout>
//               <InlineStack distribution="fillEvenly">
//                 <Card.Section>
//                   <Text  as="p"size="small">Choose goal type</Text>
//                   <InlineStack>
//                     <Card sectioned>
//                       <Text  as="p"fontWeight={type === 'order' ? 'strong' : 'subdued'}>Order-based</Text>
//                       <div style={{marginTop: 8}}>Spend a cart amount to unlock % or $ discount.</div>
//                       <div style={{marginTop: 12}}>
//                         <Button primary={type === 'order'} onClick={() => setType('order')}>Select</Button>
//                       </div>
//                     </Card>
//                     <Card sectioned>
//                       <Text  as="p"fontWeight={type === 'product' ? 'strong' : 'subdued'}>Product-based</Text>
//                       <div style={{marginTop: 8}}>Buy X of specific products to unlock a reward.</div>
//                       <div style={{marginTop: 12}}>
//                         <Button primary={type === 'product'} onClick={() => setType('product')}>Select</Button>
//                       </div>
//                     </Card>
//                     <Card sectioned>
//                       <Text  as="p"fontWeight={type === 'shipping' ? 'strong' : 'subdued'}>Shipping-based</Text>
//                       <div style={{marginTop: 8}}>Reach cart total to unlock free/reduced shipping.</div>
//                       <div style={{marginTop: 12}}>
//                         <Button primary={type === 'shipping'} onClick={() => setType('shipping')}>Select</Button>
//                       </div>
//                     </Card>
//                   </InlineStack>
//                 </Card.Section>
//               </InlineStack>
//             </FormLayout>
//           </Card>
//         </Layout.Section>
//       </Layout>
//     );
//   }

//   function renderOrderFields() {
//     return (
//       <Card sectioned>
//         <FormLayout>
//           <TextField
//             label="Spend threshold (USD)"
//             value={orderThreshold}
//             onChange={(v) => setOrderThreshold(v)}
//             prefix="$"
//             type="number"
//             helpText="Example: 50 means customers must spend $50 to unlock."
//             error={errors.orderThreshold}
//           />

//           <Select
//             label="Discount type"
//             options={[{label: 'Percentage', value: 'percentage'}, {label: 'Fixed amount (USD)', value: 'fixed'}]}
//             onChange={(v) => setOrderDiscountKind(v)}
//             value={orderDiscountKind}
//           />

//           <TextField
//             label={orderDiscountKind === 'percentage' ? 'Discount (%)' : 'Discount (USD)'}
//             value={orderDiscountValue}
//             onChange={(v) => setOrderDiscountValue(v)}
//             type="number"
//             suffix={orderDiscountKind === 'percentage' ? '%' : 'USD'}
//             error={errors.orderDiscountValue}
//           />
//         </FormLayout>
//       </Card>
//     );
//   }

//   function renderProductFields() {
//     return (
//       <Card sectioned>
//         <FormLayout>
//           <Text  as="p"fontWeight="subdued">Choose products (mock selector)</Text>
//           <ResourceList
//             items={mockProducts}
//             renderItem={(item) => {
//               const {id, title, img} = item;
//               const selected = selectedProductIds.includes(id);
//               return (
//                 <ResourceList.Item id={id} accessibilityLabel={`Select ${title}`}>
//                   <InlineStack alignment="center">
//                     <InlineStack.Item>
//                       <Avatar customer size="medium" name={title} />
//                     </InlineStack.Item>
//                     <InlineStack.Item fill>
//                       <Text  as="p"fontWeight="strong">{title}</Text>
//                     </InlineStack.Item>
//                     <InlineStack.Item>
//                       <Button
//                         onClick={() => handleSelectProduct(id)}
//                         plain
//                       >{selected ? 'Deselect' : 'Select'}</Button>
//                     </InlineStack.Item>
//                   </InlineStack>
//                 </ResourceList.Item>
//               );
//             }}
//           />
//           {errors.selectedProductIds && <InlineError message={errors.selectedProductIds} fieldID="selectedProductIds" />}

//           <TextField
//             label="Required quantity"
//             value={productQuantity}
//             onChange={(v) => setProductQuantity(v)}
//             type="number"
//             helpText="For example: buy 2 of the selected product(s)."
//             error={errors.productQuantity}
//           />

//           <Select
//             label="Reward type"
//             options={[{label: 'Percentage off', value: 'percentage'}, {label: 'Fixed amount off', value: 'fixed'}, {label: 'Free gift', value: 'gift'}]}
//             value={productRewardKind}
//             onChange={(v) => setProductRewardKind(v)}
//           />

//           {productRewardKind !== 'gift' && (
//             <TextField
//               label={productRewardKind === 'percentage' ? 'Reward (%)' : 'Reward (USD)'}
//               value={productRewardValue}
//               onChange={(v) => setProductRewardValue(v)}
//               type="number"
//             />
//           )}
//         </FormLayout>
//       </Card>
//     );
//   }

//   function renderShippingFields() {
//     return (
//       <Card sectioned>
//         <FormLayout>
//           <TextField
//             label="Cart total required (USD)"
//             value={shippingThreshold}
//             onChange={(v) => setShippingThreshold(v)}
//             prefix="$"
//             type="number"
//             error={errors.shippingThreshold}
//           />

//           <Select
//             label="Shipping reward"
//             options={[{label: 'Free shipping', value: 'free'}, {label: 'Reduced shipping rate', value: 'reduced'}]}
//             value={shippingRewardKind}
//             onChange={(v) => setShippingRewardKind(v)}
//           />

//           {shippingRewardKind === 'reduced' && (
//             <TextField
//               label="Reduced shipping amount (USD)"
//               value={reducedShippingAmount}
//               onChange={(v) => setReducedShippingAmount(v)}
//               prefix="$"
//               type="number"
//               error={errors.reducedShippingAmount}
//             />
//           )}
//         </FormLayout>
//       </Card>
//     );
//   }

//   function renderAppearanceCard() {
//     return (
//       <Card sectioned>
//         <FormLayout>
//           <TextField label="Goal title" value={title} onChange={(v) => setTitle(v)} helpText="Shown in the merchant dashboard and preview." error={errors.title} />

//           <TextField label="Motivation text" value={motivationText} onChange={(v) => setMotivationText(v)} helpText="Use %left% token to show remaining amount." />

//           <TextField label="Success message" value={successMessage} onChange={(v) => setSuccessMessage(v)} />

//           <TextField label="Progress color (hex)" value={progressColor} onChange={(v) => setProgressColor(v)} helpText="Example: #5c6ac4" />

//           <InlineStack distribution="equalSpacing">
//             <div>
//               <Text  as="p"fontWeight="subdued">Start date</Text>
//               <TextField value={startDate} onChange={(v) => setStartDate(v)} placeholder="YYYY-MM-DD" />
//             </div>
//             <div>
//               <Text  as="p"fontWeight="subdued">End date</Text>
//               <TextField value={endDate} onChange={(v) => setEndDate(v)} placeholder="YYYY-MM-DD" />
//             </div>
//             <div>
//               <Text  as="p"fontWeight="subdued">Active</Text>
//               <Checkbox checked={active} onChange={(v) => setActive(v)} />
//             </div>
//           </InlineStack>
//         </FormLayout>
//       </Card>
//     );
//   }

//   function previewProgress(simulatedCartTotal = 20) {
//     // Simulated cart for previewing progress toward the threshold
//     let threshold = 0;
//     if (type === 'order') threshold = Number(orderThreshold || 0);
//     if (type === 'shipping') threshold = Number(shippingThreshold || 0);
//     if (type === 'product') threshold = Number(productQuantity || 0); // note: product preview uses quantity not dollars

//     let percent = 0;
//     if (type === 'product') {
//       // For product-based preview we show progress by quantity
//       const qty = Number(simulatedCartTotal);
//       percent = Math.min(100, Math.round((qty / (Number(productQuantity) || 1)) * 100));
//     } else {
//       percent = threshold > 0 ? Math.min(100, Math.round((simulatedCartTotal / threshold) * 100)) : 0;
//     }

//     return (
//       <Card sectioned subdued>
//         <InlineStack vertical>
//           <Text  as="p"fontWeight="strong">Storefront preview</Text>
//           <div style={{border: '1px solid #e3e3e3', borderRadius: 8, padding: 12}}>
//             <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
//               <div>{title || 'Your goal'}</div>
//               <Badge status={percent === 100 ? 'success' : 'attention'}>{percent === 100 ? 'Unlocked' : 'In progress'}</Badge>
//             </div>
//             <div style={{height: 10, background: '#eee', borderRadius: 6}}>
//               <div style={{width: `${percent}%`, height: '100%', borderRadius: 6, background: progressColor}} />
//             </div>
//             <div style={{marginTop: 8}}>
//               {percent === 100 ? (
//                 <div>{successMessage}</div>
//               ) : (
//                 <div>{motivationText.replace('%left%', formatLeft(threshold, simulatedCartTotal))}</div>
//               )}
//             </div>
//           </div>

//           <div style={{marginTop: 8}}>
//             <InlineStack alignment="center">
//               <div style={{width: 200}}>
//                 <RangeSlider
//                   label="Simulate cart (for preview)"
//                   min={0}
//                   max={Math.max(100, Number(orderThreshold || shippingThreshold || 100))}
//                   value={String(simulatedCartTotal)}
//                   onChange={() => {}}
//                 />
//               </div>
//               <div>
//                 <Button onClick={() => {}} disabled>Open live preview</Button>
//               </div>
//             </InlineStack>
//           </div>
//         </InlineStack>
//       </Card>
//     );
//   }

//   function formatLeft(threshold, current) {
//     if (type === 'product') {
//       const left = Math.max(0, Number(productQuantity) - Number(current));
//       return `${left} item${left === 1 ? '' : 's'}`;
//     }
//     const left = Math.max(0, (Number(threshold) || 0) - Number(current || 0));
//     return `$${left.toFixed(2)}`;
//   }

//   function buildSummary() {
//     const summary = {title, type, active, startDate, endDate};
//     if (type === 'order') {
//       summary.threshold = `$${Number(orderThreshold).toFixed(2)}`;
//       summary.reward = orderDiscountKind === 'percentage' ? `${orderDiscountValue}% off` : `$${Number(orderDiscountValue).toFixed(2)} off`;
//     }
//     if (type === 'product') {
//       summary.products = mockProducts.filter((p) => selectedProductIds.includes(p.id)).map((p) => p.title);
//       summary.requiredQuantity = productQuantity;
//       summary.reward = productRewardKind === 'gift' ? 'Free gift' : (productRewardKind === 'percentage' ? `${productRewardValue}% off` : `$${Number(productRewardValue).toFixed(2)} off`);
//     }
//     if (type === 'shipping') {
//       summary.threshold = `$${Number(shippingThreshold).toFixed(2)}`;
//       summary.reward = shippingRewardKind === 'free' ? 'Free shipping' : `Shipping $${Number(reducedShippingAmount).toFixed(2)}`;
//     }
//     return summary;
//   }

//   function handleSave() {
//     // Final validation: if errors object not empty, don't open review.
//     if (Object.keys(errors).length > 0) {
//       // highlight first error
//       setShowReview(false);
//       return;
//     }

//     // In a real app, here you would call your backend or Shopify GraphQL API to create the goal
//     // For this example we simply close the modal and show a banner success message.
//     setShowReview(false);
//     setStep(1);
//     // Reset (or navigate back to list)
//     // ...
//     alert('Goal saved (mock). In a real app send summary to backend.');
//   }

//   const summary = buildSummary();

//   return (
//     <Page title="Create Discount Goal">
//       <Layout>
//         <Layout.Section>
//           <Banner title="Create a new goal" status="info">Build a dynamic discount goal that syncs with your storefront progress widget.</Banner>
//         </Layout.Section>

//         <Layout.Section oneHalf>
//           <Card>
//             <Card.Section title="1. Choose goal type">{renderTypeCards()}</Card.Section>

//             <Card.Section title="2. Configure goal">
//               {type === 'order' && renderOrderFields()}
//               {type === 'product' && renderProductFields()}
//               {type === 'shipping' && renderShippingFields()}
//             </Card.Section>

//             <Card.Section title="3. Appearance & schedule">{renderAppearanceCard()}</Card.Section>

//             <Card.Section>
//               <InlineStack distribution="trailing">
//                 <Button onClick={() => { setShowReview(true); }} primary>Review & Save</Button>
//               </InlineStack>
//             </Card.Section>
//           </Card>
//         </Layout.Section>

//         <Layout.Section oneHalf>
//           {showPreview ? (
//             <div>
//               {previewProgress(20)}

//               <Card sectioned title="Summary">
//                 <p><strong>Title:</strong> {summary.title}</p>
//                 <p><strong>Type:</strong> {summary.type}</p>
//                 {summary.threshold && <p><strong>Threshold:</strong> {summary.threshold}</p>}
//                 {summary.products && <p><strong>Products:</strong> {summary.products.join(', ')}</p>}
//                 <p><strong>Reward:</strong> {summary.reward}</p>
//                 <p><strong>Active:</strong> {summary.active ? 'Yes' : 'No'}</p>
//                 {(summary.startDate || summary.endDate) && <p><strong>Schedule:</strong> {summary.startDate || '—'} to {summary.endDate || '—'}</p>}
//               </Card>

//             </div>
//           ) : (
//             <EmptyState heading="Preview disabled" action={{content: 'Enable preview', onAction: () => setShowPreview(true)}}>
//               <p>Toggle preview to see how the widget will look in the storefront.</p>
//             </EmptyState>
//           )}
//         </Layout.Section>
//       </Layout>

//       <Modal
//         open={showReview}
//         onClose={() => setShowReview(false)}
//         title="Review goal"
//         primaryAction={{content: 'Save goal', onAction: handleSave}}
//         secondaryActions={[{content: 'Back', onAction: () => setShowReview(false)}]}
//       >
//         <Modal.Section>
//           <InlineStack vertical>
//             <Text  as="p"fontWeight="strong">{summary.title || 'Untitled goal'}</Text>
//             <div><strong>Type:</strong> {summary.type}</div>
//             {summary.threshold && <div><strong>Threshold:</strong> {summary.threshold}</div>}
//             {summary.products && <div><strong>Products:</strong> {summary.products.join(', ')}</div>}
//             <div><strong>Reward:</strong> {summary.reward}</div>
//             {Object.keys(errors).length > 0 && (
//               <div style={{marginTop: 8}}>
//                 <InlineError message={Object.values(errors)[0]} fieldID="error" />
//               </div>
//             )}
//           </InlineStack>
//         </Modal.Section>
//       </Modal>
//     </Page>
//   );
// }

// import React, { useState, useCallback } from 'react';
// import {
//   Layout,
//   Banner,
//   BlockStack,
//   Text,
//   RadioButton,
//   InlineStack,
//   TextField,
//   Button,
//   Box,
//   List,
//   Thumbnail,
// } from '@shopify/polaris';
// import ProductModal,{ productsFromModal } from './productsModal';

// // Define types for selected products
// type Product = {
//   id: string;
//   name: string;
//   image: string;
// };

// export default function SpendingGoalWidget() {
//   const [selectedProductType, setSelectedProductType] = useState<string>('any-product');
//   const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
//   const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

//   // Handle product type selection
//   const handleProductTypeChange = useCallback((value: string) => {
//     setSelectedProductType(value);
//   }, []);

//   // Handle opening/closing the product modal
//   const handleBrowseClick = useCallback(() => {
//     setIsProductModalOpen(prev => !prev);
//   }, []);

//   // Handle selected products from the modal
//   const handleSelectedProducts = useCallback((products: string[]) => {
//     const selected = products.map(id => {
//       const product = productsFromModal?.find(p => p.id === id);
//       return product ? { id: product.id, name: product.name, image: product.image } : null;
//     }).filter(Boolean) as Product[];

//     setSelectedProducts(selected);
//     console.log('Selected Products:', selected);
//   }, []);

//   return (
//     <>
//       <Layout>
//       </Layout>
//       <Layout>
//         <Layout.Section variant="oneHalf">
//           <Box padding="400">
//             <BlockStack gap="200">
//               <Text variant="headingMd" as="h6">
//                 Create New Spending Goal
//               </Text>
//               <BlockStack gap="200">
//                 <Text as="p">Select</Text>
//                 <RadioButton
//                   label="Any product"
//                   id="any-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'any-product'}
//                   onChange={() => handleProductTypeChange('any-product')}
//                 />
//                 <RadioButton
//                   label="Specific product or collection"
//                   id="specific-product"
//                   name="product-selection"
//                   checked={selectedProductType === 'specific-product'}
//                   onChange={() => handleProductTypeChange('specific-product')}
//                 />
//               </BlockStack>
//               {selectedProductType === 'specific-product' && (
//                 <InlineStack gap="200" align='space-between' blockAlign="start" wrap>
//                   <TextField
//                     label="Search products"
//                     placeholder="Search products"
//                     readOnly
//                     autoComplete="off"
//                     aria-label="Search products"
//                     onFocus={handleBrowseClick}
//                   />
//                   <Button
//                     variant="secondary"
//                     size="medium"
//                     textAlign="center"
//                     onClick={handleBrowseClick}
//                   >
//                     Browse
//                   </Button>
//                   {selectedProducts.length > 0 && (
//                     <BlockStack gap="200">
//                       <Text variant="headingSm" as="h3">Selected Products:</Text>
//                       {selectedProducts.map((product) => (
//                         <InlineStack key={product.id} align="start" gap="200">
//                           <Thumbnail source={product.image} alt={product.name} size="small" />
//                           <Text variant="bodyMd" as={'p'}>{product.name}</Text>
//                         </InlineStack>
//                       ))}
//                     </BlockStack>
//                   )}
//                 </InlineStack>
//               )}
//             </BlockStack>
//           </Box>
//         </Layout.Section>
//         <Layout.Section variant="oneHalf"></Layout.Section>
//       </Layout>
//       {isProductModalOpen && (
//         <ProductModal
//           selectedProductsProp={handleSelectedProducts}
//           open={isProductModalOpen}
//           onClose={() => setIsProductModalOpen(false)}
//         />
//       )}
//     </>
//   );
// }

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
// import { useProductContext } from 'app/routes/app.goals-creation';
import { useOutletContext } from '@remix-run/react';
import type { ProductGQL } from 'app/types/app_create-goal';
import ProductsCtx from 'app/context/productsContext';

// Define types for selected products
type Product = {
  id: string;
  name: string;
  image: string;
};

// Define types for props
type ContentProp = {
  label: string;
  value: string;
  modal?: {
    selectedProductsProp?: (products: string[]) => void;
    open: boolean;
    onClose: () => void;
  };
};

type ProductSelectionWidgetProps = {
  contents: ContentProp[];
  onSelectionCompletes: (products: ProductGQL[]) => void;
};

export default function ProductSelectionWidget({ contents, onSelectionCompletes }: ProductSelectionWidgetProps) {
  const [selectedProductType, setSelectedProductType] = useState<string>('any-product');
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
  // const products = useProductContext();
  const ctx = useContext(ProductsCtx)

  console.log("ctx: ", ctx);

  // Handle product type selection
  const handleProductTypeChange = useCallback((value: string) => {
    setSelectedProductType(value);
  }, []);

  // Handle opening/closing the product modal
  const handleBrowseClick = useCallback(() => {
    setIsProductModalOpen((prev) => !prev);
  }, []);

  // Handle selected products from the modal
  const handleSelectedProducts = useCallback((products: string[]) => {
    const selected = products
      .map((id) => {
        const product = ctx?.Products?.find((p) => p.id === id);
        return product ? product : null;
      })
      .filter(Boolean) as ProductGQL[];
    setSelectedProducts(selected);
    onSelectionCompletes(selected);
    console.log('Selected Products:', selected);
  }, []);

  const handleProductsListEdit= (id: string) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== id))
  };

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
                        <InlineStack gap="200" align="space-between" blockAlign="start" wrap>
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
                              <InlineStack key={product.id} align="space-between" gap="200" wrap>
                                <InlineStack align="start" gap="200">
                                  <Thumbnail
                                    source={product.featuredMedia?.preview.image.url ?? ""}
                                    alt={product.title}
                                    size="small"
                                  />
                                  <Text variant="bodyMd" as={'p'}>
                                    {product.title}
                                  </Text>
                                </InlineStack>
                                <Button size="medium" textAlign="center" icon={DeleteIcon} onClick={() => handleProductsListEdit(product.id)} />
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
      {isProductModalOpen && contents.some((content) => content.modal) && (
        <ProductModal
          selectedProductsProp={handleSelectedProducts}
          open={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          initiallySelectedProducts={selectedProducts.map((product) => product.id)} 
          Products={ctx?.Products ?? []}        />
      )}
    </>
  );
}
