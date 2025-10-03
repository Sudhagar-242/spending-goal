// import React, { useCallback, useState } from 'react';
// import type { FormEvent } from 'react';
// import {
//   Card,
//   BlockStack,
//   TextField,
//   Select,
//   InlineStack,
//   Button,
//   Text,
//   Form
// } from '@shopify/polaris';
// import SpendingGoalWidget from '../ProductSelectionWidget';
// import { ShippingFormRadio, ShippingFormRadioLabels } from 'app/enums/formSelectContents';
// import type { ProductGQL } from 'app/types/app_create-goal';
// import { DiscountKind } from 'app/enums/discount-goals';

// interface ShippingGoalFormProps {
//   fetcher: any;
//   currencyCode: string;
// }

// interface ShippingGoalPayload {
//   id: string;
//   type: 'shipping';
//   title: string;
//   message: {
//     success: string;
//     progress: string;
//   };
//   conditions: {
//     minimumSpent: number;
//     appliesTo: ShippingFormRadio;
//     selectedProducts?: ProductGQL[];
//   };
//   discount: {
//     type: 'free' | 'rate';
//     value: number;
//     appliesTo: DiscountKind.SHIPPING;
//   };
// }

// export default function ShippingGoalForm({ fetcher, currencyCode }: ShippingGoalFormProps) {
//   // Form state
//   const [goalName, setGoalName] = useState('Free Shipping Goal');
//   const [cartThreshold, setCartThreshold] = useState('3000'); // $30 in cents
//   const [shippingReward, setShippingReward] = useState<'free' | 'reduced'>('free');
//   const [reducedAmount, setReducedAmount] = useState('2.99');
//   const [successMessage, setSuccessMessage] = useState('You unlocked free shipping 🎉');
//   const [progressMessage, setProgressMessage] = useState(
//     'Spend {amountLeft} more to unlock free shipping'
//   );
//   const [submitting, setSubmitting] = useState(false);

//   // Product selection state
//   const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
//   const [selectedTypeFromWidget, setSelectedTypeFromWidget] = useState<ShippingFormRadio>(ShippingFormRadio.ANY);
//   const [isProductModalOpen, setIsProductModalOpen] = useState(false);

//   const handleSelectedProducts = useCallback((products: ProductGQL[], type: ShippingFormRadio) => {
//     setSelectedProducts(products);
//     setSelectedTypeFromWidget(type);
//   }, []);

//   const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const payload: ShippingGoalPayload = {
//       id: crypto.randomUUID(),
//       type: 'shipping',
//       title: goalName,
//       message: {
//         success: successMessage,
//         progress: progressMessage,
//       },
//       conditions: {
//         minimumSpent: Number(cartThreshold),
//         appliesTo: selectedTypeFromWidget,
//         selectedProducts: selectedProducts.length > 0 ? selectedProducts : undefined,
//       },
//       discount: {
//         type: shippingReward === 'free' ? 'free' : 'rate',
//         value: shippingReward === 'free' ? 0 : Math.round(Number(reducedAmount) * 100), // Convert to cents
//         appliesTo: DiscountKind.SHIPPING,
//       },
//     };

//     console.log('🚀 Shipping Goal Payload:', payload);

//     // Submit using Remix fetcher
//     const formData = new FormData();
//     formData.append('goalData', JSON.stringify(payload));
//     fetcher.submit(formData, { method: 'post' });

//     setSubmitting(false);
//   }, [
//     goalName,
//     cartThreshold,
//     shippingReward,
//     reducedAmount,
//     successMessage,
//     progressMessage,
//     selectedTypeFromWidget,
//     selectedProducts,
//     fetcher
//   ]);

//   const shippingWidgetContent = [
//     { label: ShippingFormRadioLabels[ShippingFormRadio.ANY], value: ShippingFormRadio.ANY },
//     {
//       label: ShippingFormRadioLabels[ShippingFormRadio.NOTELIGIBLE],
//       value: ShippingFormRadio.NOTELIGIBLE,
//       modal: {
//         open: isProductModalOpen,
//         onClose: () => setIsProductModalOpen(false),
//       },
//     },
//   ];

//   return (
//     <Card>
//       <SpendingGoalWidget<ShippingFormRadio>
//         contents={shippingWidgetContent}
//         onSelectionCompletes={handleSelectedProducts}
//       />
//       <BlockStack gap="400">
//         <Text as="h3" variant="headingMd">
//           Shipping Goal
//         </Text>
//         <Form onSubmit={handleSubmit}>
//           <BlockStack gap="400">
//             <TextField
//               label="Goal name"
//               value={goalName}
//               onChange={(value) => setGoalName(value)}
//               autoComplete="off"
//             />
//             <TextField
//               label="Cart spend threshold (cents)"
//               value={cartThreshold}
//               onChange={(value) => setCartThreshold(value)}
//               autoComplete="off"
//               inputMode="numeric"
//               helpText="Amount in cents (e.g., 3000 = $30.00)"
//             />
//             <Select
//               label="Shipping reward"
//               options={[
//                 { label: 'Free shipping', value: 'free' },
//                 { label: 'Reduced rate', value: 'reduced' },
//               ]}
//               value={shippingReward}
//               onChange={(value) => setShippingReward(value as 'free' | 'reduced')}
//             />
//             {shippingReward === 'reduced' && (
//               <TextField
//                 label={`Reduced shipping amount (${currencyCode})`}
//                 value={reducedAmount}
//                 onChange={(value) => setReducedAmount(value)}
//                 inputMode="decimal"
//                 type="number"
//                 min="0"
//                 step={0.01}
//                 autoComplete="off"
//               />
//             )}
//             <TextField
//               label="Success message"
//               value={successMessage}
//               onChange={(value) => setSuccessMessage(value)}
//               autoComplete="off"
//               helpText="Use {discount} for dynamic values"
//             />
//             <TextField
//               label="Progress message"
//               value={progressMessage}
//               onChange={(value) => setProgressMessage(value)}
//               autoComplete="off"
//               helpText="Use {amountLeft} for dynamic values"
//             />
//             <InlineStack align="end">
//               <Button submit loading={submitting} variant="primary">
//                 Save Shipping Goal
//               </Button>
//             </InlineStack>
//           </BlockStack>
//         </Form>
//       </BlockStack>
//     </Card>
//   );
// }


// ShippingGoalForm.tsx
import React, { useState } from 'react';
import {
  Card,
  BlockStack,
  TextField,
  Select,
  InlineStack,
  Button,
  Text,
  Form
} from '@shopify/polaris';
import SpendingGoalWidget from '../ProductSelectionWidget';
import { ShippingFormRadio, ShippingFormRadioLabels } from 'app/enums/formSelectContents';
import type { ProductGQL } from 'app/types/app_create-goal';
import { DiscountKind } from 'app/enums/discount-goals';

interface ShippingGoalFormProps {
  fetcher: any;
  currencyCode: string;
}

export default function ShippingGoalForm({ fetcher, currencyCode }: ShippingGoalFormProps) {
  const [goalName, setGoalName] = useState('Free Shipping Goal');
  const [cartThreshold, setCartThreshold] = useState('3000'); // $30
  const [shippingReward, setShippingReward] = useState<'free' | 'reduced'>('free');
  const [reducedAmount, setReducedAmount] = useState('2.99');
  const [successMessage, setSuccessMessage] = useState('You unlocked free shipping 🎉');
  const [progressMessage, setProgressMessage] = useState(
    'Spend {amountLeft} more to unlock free shipping'
  );
  const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
  const [selectedTypeFromWidget, setSelectedTypeFromWidget] = useState<ShippingFormRadio>(ShippingFormRadio.ANY);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const submitting = fetcher.state === 'submitting';

  const handleSelectedProducts = (products: ProductGQL[], type: ShippingFormRadio) => {
    setSelectedProducts(products);
    setSelectedTypeFromWidget(type);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      id: crypto.randomUUID(),
      type: 'shipping',
      title: goalName,
      message: {
        success: successMessage,
        progress: progressMessage,
      },
      conditions: {
        minimumSpent: Number(cartThreshold),
        appliesTo: selectedTypeFromWidget,
        selectedProducts: selectedProducts.length > 0 ? selectedProducts : undefined,
      },
      discount: {
        type: shippingReward === 'free' ? 'free' : 'rate',
        value: shippingReward === 'free' ? 0 : Math.round(Number(reducedAmount) * 100),
        appliesTo: DiscountKind.SHIPPING,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append('goalData', JSON.stringify(payload));
    fetcher.submit(formData, { method: 'post' });
  };

  const shippingWidgetContent = [
    { label: ShippingFormRadioLabels[ShippingFormRadio.ANY], value: ShippingFormRadio.ANY },
    {
      label: ShippingFormRadioLabels[ShippingFormRadio.NOTELIGIBLE],
      value: ShippingFormRadio.NOTELIGIBLE,
      modal: {
        open: isProductModalOpen,
        onClose: () => setIsProductModalOpen(false),
      },
    },
  ];

  return (
    <Card>
      <SpendingGoalWidget<ShippingFormRadio>
        contents={shippingWidgetContent}
        onSelectionCompletes={handleSelectedProducts}
      />
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Shipping Goal
        </Text>
        <Form onSubmit={handleSubmit}>
          <BlockStack gap="400">
            <TextField
              label="Goal name"
              value={goalName}
              onChange={(value) => setGoalName(value)}
              autoComplete="off"
            />
            <TextField
              label="Minimum Goal Amount"
              value={cartThreshold}
              onChange={(value) => setCartThreshold(value)}
              autoComplete="off"
              inputMode="numeric"
            />
            <Select
              label="Shipping reward"
              options={[
                { label: 'Free shipping', value: 'free' },
                { label: 'Reduced rate', value: 'reduced' },
              ]}
              value={shippingReward}
              onChange={(value) => setShippingReward(value as 'free' | 'reduced')}
            />
            {shippingReward === 'reduced' && (
              <TextField
                label={`Reduced shipping amount (${currencyCode})`}
                value={reducedAmount}
                onChange={(value) => setReducedAmount(value)}
                inputMode="decimal"
                type="number"
                min="0"
                step={0.01}
                autoComplete="off"
              />
            )}
            <TextField
              label="Success message"
              value={successMessage}
              onChange={(value) => setSuccessMessage(value)}
              autoComplete="off"
            />
            <TextField
              label="Progress message"
              value={progressMessage}
              onChange={(value) => setProgressMessage(value)}
              autoComplete="off"
            />
            <InlineStack align="end">
              <Button submit loading={submitting} variant="primary">
                Save Shipping Goal
              </Button>
            </InlineStack>
          </BlockStack>
        </Form>
      </BlockStack>
    </Card>
  );
}
