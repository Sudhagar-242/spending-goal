// import React, { useState } from 'react';
// import {
//   Card,
//   BlockStack,
//   TextField,
//   Select,
//   InlineStack,
//   Button,
//   Text,
//   Form,
// } from '@shopify/polaris';
// import { DiscountKind } from 'app/enums/discount-goals';

// interface OrderGoalFormProps {
//   fetcher: any;
//   currencyCode: string;
// }

// interface OrderGoalPayload {
//   id: string;
//   type: 'order';
//   title: string;
//   message: {
//     success: string;
//     progress: string;
//   };
//   conditions: {
//     minimumSpent: number;
//     appliesTo: DiscountKind.ORDER;
//   };
//   discount: {
//     type: 'percentage' | 'fixed';
//     value: number;
//     appliesTo: DiscountKind.ORDER;
//   };
// }

// export default function OrderGoalForm({ fetcher, currencyCode }: OrderGoalFormProps) {
//   const [goalName, setGoalName] = useState('Spend & Save');
//   const [orderThreshold, setOrderThreshold] = useState('5000'); // cents → $50
//   const [discountKind, setDiscountKind] = useState<'percentage' | 'fixed'>('percentage');
//   const [discountValue, setDiscountValue] = useState('10');
//   const [successMessage, setSuccessMessage] = useState('You saved {discount} 🎉');
//   const [progressMessage, setProgressMessage] = useState(
//     'Spend {amountLeft} more to unlock {discount}'
//   );
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setSubmitting(true);

//     const payload: OrderGoalPayload = {
//       id: crypto.randomUUID(),
//       type: 'order',
//       title: goalName,
//       message: {
//         success: successMessage,
//         progress: progressMessage,
//       },
//       conditions: {
//         minimumSpent: Number(orderThreshold),
//         appliesTo: DiscountKind.ORDER,
//       },
//       discount: {
//         type: discountKind,
//         value: discountKind === 'percentage' ? Number(discountValue) : Number(discountValue) * 100, // Convert to cents for fixed amount
//         appliesTo: DiscountKind.ORDER,
//       },
//     };

//     console.log('🛒 Order Goal Payload:', payload);

//     // Use fetcher to submit the form data
//     const formData = new FormData();
//     formData.append('goalData', JSON.stringify(payload));
//     fetcher.submit(formData, { method: 'post' });

//     setSubmitting(false);
//   };

//   return (
//     <Card>
//       <BlockStack gap="400">
//         <Text as="h3" variant="headingMd">
//           Order Goal
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
//               value={orderThreshold}
//               onChange={(value) => setOrderThreshold(value)}
//               autoComplete="off"
//               inputMode="numeric"
//             />
//             <Select
//               label="Discount type"
//               options={[
//                 { label: 'Percentage', value: 'percentage' },
//                 { label: 'Fixed amount (USD)', value: 'fixed' },
//               ]}
//               value={discountKind}
//               onChange={(value) => setDiscountKind(value as 'percentage' | 'fixed')}
//             />
//             <TextField
//               label={discountKind === 'percentage' ? 'Discount %' : `Discount ${currencyCode}`}
//               value={discountValue}
//               onChange={(value) => setDiscountValue(value)}
//               inputMode="numeric"
//               type="number"
//               suffix={discountKind === 'percentage' ? '%' : currencyCode}
//               autoComplete="off"
//             />
//             <TextField
//               label="Success message"
//               value={successMessage}
//               onChange={(value) => setSuccessMessage(value)}
//               autoComplete="off"
//             />
//             <TextField
//               label="Progress message"
//               value={progressMessage}
//               onChange={(value) => setProgressMessage(value)}
//               autoComplete="off"
//             />
//             <InlineStack align="end">
//               <Button submit loading={submitting} variant="primary">
//                 Save Order Goal
//               </Button>
//             </InlineStack>
//           </BlockStack>
//         </Form>
//       </BlockStack>
//     </Card>
//   );
// }


// OrderGoalForm.tsx
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
import { DiscountKind } from 'app/enums/discount-goals';

interface OrderGoalFormProps {
  fetcher: any;
  currencyCode: string;
}

export default function OrderGoalForm({ fetcher, currencyCode }: OrderGoalFormProps) {
  const [goalName, setGoalName] = useState('Spend & Save');
  const [orderThreshold, setOrderThreshold] = useState('5000'); // cents → $50
  const [discountKind, setDiscountKind] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [successMessage, setSuccessMessage] = useState('You saved {discount} 🎉');
  const [progressMessage, setProgressMessage] = useState(
    'Spend {amountLeft} more to unlock {discount}'
  );

  const submitting = fetcher.state === 'submitting';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = {
      id: crypto.randomUUID(),
      type: 'order',
      title: goalName,
      message: {
        success: successMessage,
        progress: progressMessage,
      },
      conditions: {
        minimumSpent: Number(orderThreshold),
        appliesTo: DiscountKind.ORDER,
      },
      discount: {
        type: discountKind,
        value: discountKind === 'percentage' ? Number(discountValue) : Number(discountValue) * 100,
        appliesTo: DiscountKind.ORDER,
      },
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const formData = new FormData();
    formData.append('goalData', JSON.stringify(payload));
    fetcher.submit(formData, { method: 'post' });
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          Order Goal
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
              value={orderThreshold}
              onChange={(value) => setOrderThreshold(value)}
              autoComplete="off"
              inputMode="numeric"
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
              type="number"
              suffix={discountKind === 'percentage' ? '%' : currencyCode}
              autoComplete="off"
            />
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
                Save Order Goal
              </Button>
            </InlineStack>
          </BlockStack>
        </Form>
      </BlockStack>
    </Card>
  );
}
