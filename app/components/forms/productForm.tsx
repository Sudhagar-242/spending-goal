// import React, { useCallback, useState } from 'react';
// import { Card, BlockStack, TextField, InlineStack, Button, Text, Select } from '@shopify/polaris';
// import ProductSelectionWidget from '../ProductSelectionWidget';
// import { ProductFormRadio, ProductFormRadioLabels } from 'app/enums/formSelectContents';
// import type { ProductGQL } from 'app/types/app_create-goal';
// import { DiscountKind } from 'app/enums/discount-goals';

// interface ProductGoalFormProps {
//   fetcher: any;
//   currencyCode: string;
// }

// interface ProductGoalPayload {
//   id: string;
//   type: 'product';
//   title: string;
//   message: {
//     success: string;
//     progress: string;
//   };
//   conditions: {
//     minimumSpent: number;
//     appliesTo: ProductFormRadio;
//     selectedProducts?: ProductGQL[];
//   };
//   discount: {
//     type: 'percentage' | 'fixed';
//     value: number;
//     appliesTo: DiscountKind.PRODUCT;
//   };
// }

// export default function ProductGoalForm({ fetcher, currencyCode }: ProductGoalFormProps) {
//   // Form state
//   const [goalName, setGoalName] = useState('Holiday Sale');
//   const [goal, setGoal] = useState('5000'); // cents → $50.00
//   const [discountKind, setDiscountKind] = useState<'percentage' | 'fixed'>('percentage');
//   const [discountValue, setDiscountValue] = useState('10');
//   const [successMessage, setSuccessMessage] = useState('Congrats! You unlocked {discount}% off 🎉');
//   const [progressMessage, setProgressMessage] = useState(
//     'Spend {amountLeft} more to save {discount}%'
//   );
//   const [goalError] = useState<string | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Product selection state
//   const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
//   const [selectedTypeFromWidget, setSelectedTypeFromWidget] = useState<ProductFormRadio>(ProductFormRadio.ANY);
//   const [isProductModalOpen, setIsProductModalOpen] = useState(false);

//   const handleSelectedProducts = useCallback((products: ProductGQL[], type: ProductFormRadio) => {
//     setSelectedProducts(products);
//     setSelectedTypeFromWidget(type);
//   }, []);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const payload: ProductGoalPayload = {
//       id: crypto.randomUUID(),
//       type: 'product',
//       title: goalName,
//       message: {
//         success: successMessage,
//         progress: progressMessage,
//       },
//       conditions: {
//         minimumSpent: Number(goal),
//         appliesTo: selectedTypeFromWidget,
//         selectedProducts: selectedProducts.length > 0 ? selectedProducts : undefined,
//       },
//       discount: {
//         type: discountKind,
//         value: discountKind === 'percentage' ? Number(discountValue) : Number(discountValue) * 100, // Convert to cents for fixed amount
//         appliesTo: DiscountKind.PRODUCT,
//       },
//     };

//     console.log('🎯 Product Goal Payload:', payload);

//     // Use fetcher to submit the form data
//     const formData = new FormData();
//     formData.append('goalData', JSON.stringify(payload));
//     fetcher.submit(formData, { method: 'post' });

//     setSubmitting(false);
//   };

//   const productWidgetContent = [
//     { label: ProductFormRadioLabels[ProductFormRadio.ANY], value: ProductFormRadio.ANY },
//     {
//       label: ProductFormRadioLabels[ProductFormRadio.SPECIFIC],
//       value: ProductFormRadio.SPECIFIC,
//       modal: {
//         open: isProductModalOpen,
//         onClose: () => setIsProductModalOpen(false),
//       },
//     },
//   ];

//   return (
//     <BlockStack gap="400">
//       <ProductSelectionWidget<ProductFormRadio>
//         contents={productWidgetContent}
//         onSelectionCompletes={handleSelectedProducts}
//       />
//       <Card>
//         <BlockStack gap="400">
//           <Text as="p" variant="bodyMd">
//             Add multiple goal/discount pairs. Each pair is appended to the metafield array.
//           </Text>
//           <form onSubmit={handleSubmit}>
//             <BlockStack gap="400">
//               <TextField
//                 label="Cart goal Name"
//                 name="goal_name"
//                 value={goalName}
//                 onChange={(value) => setGoalName(value)}
//                 autoComplete="off"
//                 inputMode="text"
//                 helpText="Goal Name"
//               />
//               <TextField
//                 label="Cart goal (cents)"
//                 name="cart_goal"
//                 value={goal}
//                 onChange={(value) => setGoal(value)}
//                 autoComplete="off"
//                 inputMode="numeric"
//                 helpText="Saved as amount (integer, cents)"
//                 error={goalError || ''}
//               />
//               <Select
//                 label="Discount type"
//                 options={[
//                   { label: 'Percentage', value: 'percentage' },
//                   { label: 'Fixed amount (USD)', value: 'fixed' },
//                 ]}
//                 value={discountKind}
//                 onChange={(value) => setDiscountKind(value as 'percentage' | 'fixed')}
//               />
//               <TextField
//                 label={discountKind === 'percentage' ? 'Discount %' : `Discount ${currencyCode}`}
//                 value={discountValue}
//                 onChange={(value) => setDiscountValue(value)}
//                 inputMode="numeric"
//                 autoComplete="off"
//                 suffix={discountKind === 'percentage' ? '%' : currencyCode}
//                 max={discountKind === 'percentage' ? 100 : undefined}
//                 step={1}
//                 type="number"
//               />
//               <TextField
//                 label="Success Message"
//                 name="success_message"
//                 value={successMessage}
//                 onChange={(value) => setSuccessMessage(value)}
//                 autoComplete="off"
//                 helpText="Shown when a goal is reached. Use {discount} for discount value."
//               />
//               <TextField
//                 label="Progress Message"
//                 name="progress_message"
//                 value={progressMessage}
//                 onChange={(value) => setProgressMessage(value)}
//                 autoComplete="off"
//                 helpText="Shown before reaching a goal. Use {amountLeft}, {discount}, {percent}."
//               />
//               <InlineStack align="end">
//                 <Button submit loading={submitting} variant="primary">
//                   Add goal & discount
//                 </Button>
//               </InlineStack>
//             </BlockStack>
//           </form>
//         </BlockStack>
//       </Card>
//     </BlockStack>
//   );
// }

// ProductGoalForm.tsx
import React, { useCallback, useState } from 'react';
import { Card, BlockStack, TextField, InlineStack, Button, Text, Select } from '@shopify/polaris';
import ProductSelectionWidget from '../ProductSelectionWidget';
import { ProductFormRadio, ProductFormRadioLabels } from 'app/enums/formSelectContents';
import type { ProductGQL } from 'app/types/app_create-goal';
import { DiscountKind } from 'app/enums/discount-goals';

interface ProductGoalFormProps {
  fetcher: any;
  currencyCode: string;
}

export default function ProductGoalForm({ fetcher, currencyCode }: ProductGoalFormProps) {
  const [goalName, setGoalName] = useState('Holiday Sale');
  const [goal, setGoal] = useState('5000');
  const [discountKind, setDiscountKind] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [successMessage, setSuccessMessage] = useState('Congrats! You unlocked {discount}% off 🎉');
  const [progressMessage, setProgressMessage] = useState(
    'Spend {amountLeft} more to save {discount}%',
  );
  const [goalError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<ProductGQL[]>([]);
  const [selectedTypeFromWidget, setSelectedTypeFromWidget] = useState<ProductFormRadio>(
    ProductFormRadio.ANY,
  );
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const submitting = fetcher.state === 'submitting';

  const handleSelectedProducts = useCallback((products: ProductGQL[], type: ProductFormRadio) => {
    setSelectedProducts(products);
    setSelectedTypeFromWidget(type);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      id: crypto.randomUUID(),
      type: 'product',
      title: goalName,
      message: {
        success: successMessage,
        progress: progressMessage,
      },
      conditions: {
        minimumSpent: Number(goal),
        appliesTo: selectedTypeFromWidget,
        selectedProducts: selectedProducts.length > 0 ? selectedProducts : undefined,
      },
      discount: {
        type: discountKind,
        value: discountKind === 'percentage' ? Number(discountValue) : Number(discountValue) * 100,
        appliesTo: DiscountKind.PRODUCT,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append('goalData', JSON.stringify(payload));
    fetcher.submit(formData, { method: 'post' });
  };

  const productWidgetContent = [
    { label: ProductFormRadioLabels[ProductFormRadio.ANY], value: ProductFormRadio.ANY },
    {
      label: ProductFormRadioLabels[ProductFormRadio.SPECIFIC],
      value: ProductFormRadio.SPECIFIC,
      modal: {
        open: isProductModalOpen,
        onClose: () => setIsProductModalOpen(false),
      },
    },
  ];

  return (
    <BlockStack gap="400">
      <Card>
        <ProductSelectionWidget<ProductFormRadio>
          contents={productWidgetContent}
          onSelectionCompletes={handleSelectedProducts}
        />
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd">
            Add multiple goal/discount pairs. Each pair is appended to the metafield array.
          </Text>
          <form onSubmit={handleSubmit}>
            <BlockStack gap="400">
              <TextField
                label="Cart goal Name"
                name="goal_name"
                value={goalName}
                onChange={(value) => setGoalName(value)}
                autoComplete="off"
                inputMode="text"
                helpText="Goal Name"
              />
              <TextField
                label="Minimum Goal amount"
                name="cart_goal"
                value={goal}
                onChange={(value) => setGoal(value)}
                autoComplete="off"
                inputMode="numeric"
                helpText="Saved as amount (integer, cents)"
                error={goalError || ''}
              />
              <Select
                label="Discount type"
                options={[
                  { label: 'Percentage', value: 'percentage' },
                  { label: 'Fixed amount (USD)', value: 'fixed' },
                ]}
                value={discountKind}
                onChange={(value) => setDiscountKind(value as 'percentage' | 'fixed')}
              />
              <TextField
                label={discountKind === 'percentage' ? 'Discount %' : `Discount ${currencyCode}`}
                value={discountValue}
                onChange={(value) => setDiscountValue(value)}
                inputMode="numeric"
                autoComplete="off"
                suffix={discountKind === 'percentage' ? '%' : currencyCode}
                max={discountKind === 'percentage' ? 100 : undefined}
                step={1}
                type="number"
              />
              <TextField
                label="Success Message"
                name="success_message"
                value={successMessage}
                onChange={(value) => setSuccessMessage(value)}
                autoComplete="off"
                helpText="Shown when a goal is reached. Use {discount} for discount value."
              />
              <TextField
                label="Progress Message"
                name="progress_message"
                value={progressMessage}
                onChange={(value) => setProgressMessage(value)}
                autoComplete="off"
                helpText="Shown before reaching a goal. Use {amountLeft}, {discount}, {percent}."
              />
              <InlineStack align="end">
                <Button submit loading={submitting} variant="primary">
                  Add goal & discount
                </Button>
              </InlineStack>
            </BlockStack>
          </form>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
