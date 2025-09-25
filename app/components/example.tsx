import React, { useCallback, useState } from 'react';
import {
  AppProvider,
  Layout,
  Box,
  BlockStack,
  InlineStack,
  Text,
  RadioButton,
  TextField,
  Banner,
  Button,
  RangeSlider,
  Icon,
  Frame,
  List,
  ChoiceList,
  Card,
  TextContainer,
} from '@shopify/polaris';
import { SearchIcon, AlertTriangleIcon } from '@shopify/polaris-icons';
import '@shopify/polaris/build/esm/styles.css';

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

function SpendingGoalWidget() {
  const [Radio, setRadio] = useState<string[]>(['none']);

  const handleChoiceListChange = useCallback((value: string[]) => setRadio(value), []);

  const renderChildren = useCallback(
    (isSelected: boolean) =>
      isSelected && (
        <>
          <InlineStack align="space-between" blockAlign="start" wrap>
            <TextField
              label="Search products"
              placeholder="Search products"
              readOnly
              autoComplete="off"
              aria-label="Search products"
            />
            <Button variant="secondary" size="medium" textAlign="center">
              Browse
            </Button>
          </InlineStack>

          <Box paddingBlockStart="400">
            <Banner title="A product or collection selection is required" tone="warning" />
          </Box>
        </>
      ),
    [],
  );

  return (
    <>
      <Layout>
        <Layout.Section>
          <Banner
            title="USPS has updated their rates"
            action={{ content: 'Update rates', url: '' }}
            secondaryAction={{ content: 'Learn more' }}
            tone="info"
            onDismiss={() => {}}
          >
            <p>Make sure you know how these changes affect your store.</p>
          </Banner>
          <Banner
            title="Before you can purchase a shipping label, this change needs to be made:"
            action={{ content: 'Edit address' }}
            tone="warning"
          >
            <List>
              <List.Item>
                The name of the city you’re shipping to has characters that aren’t allowed. City
                name can only include spaces and hyphens.
              </List.Item>
            </List>
          </Banner>
        </Layout.Section>
      </Layout>
      <Layout>
        <Layout.Section variant="oneHalf">
          <Box padding="400">
            <BlockStack gap="200">
              <Text variant="headingMd" as="h6">
                Create New Spending Goal
              </Text>
              <BlockStack gap="200">
                <Text as="p"> Select</Text>
                <RadioButton label="Any product" id="any-product" name="product-selection" />
                <RadioButton
                  label="Specific product or collection"
                  id="specific-product"
                  name="product-selection"
                />
              </BlockStack>
              <ChoiceList
                title="Discount minimum requirements"
                choices={[
                  { label: 'None', value: 'none' },
                  { label: 'Minimum purchase', value: 'minimum_purchase' },
                  {
                    label: 'Minimum quantity',
                    value: 'minimum_quantity',
                    renderChildren,
                  },
                ]}
                selected={Radio}
                onChange={handleChoiceListChange}
              />
            </BlockStack>
          </Box>
        </Layout.Section>
        <Layout.Section variant="oneHalf"></Layout.Section>
      </Layout>
    </>
  );
}

export default SpendingGoalWidget;
