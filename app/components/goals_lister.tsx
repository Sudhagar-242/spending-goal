// import React from 'react';
// import {
//   ResourceList,
//   ResourceItem,
//   Box,
//   InlineStack,
//   BlockStack,
//   Text,
//   Badge,
//   Button
// } from '@shopify/polaris';
// import { EditIcon, DeleteIcon } from '@shopify/polaris-icons';

// const goals = [
//   {
//     id: 'goal-1',
//     title: 'New Spending Goal 1',
//     discountText: '10% discount',
//     threshold: '$100 threshold',
//     infoText: 'Circle progress',
//   },
//   {
//     id: 'goal-2',
//     title: 'New Spending Goal 2',
//     discountText: '10% discount',
//     threshold: '$200 threshold',
//     infoText: 'Circle progress',
//   },
//   {
//     id: 'goal-3',
//     title: 'New Spending Goal 3',
//     discountText: '$100 discount',
//     threshold: '$200 threshold',
//     infoText: 'Circle progress',
//   },
//   {
//     id: 'goal-4',
//     title: 'New Spending Goal 4',
//     discountText: '10% discount',
//     threshold: '$100 threshold',
//     infoText: 'Circle progress',
//   },
// ];

// export function SpendingGoalsResourceList() {
//   return (
//     <Box>
//       <ResourceList
//         resourceName={{ singular: 'goal', plural: 'goals' }}
//         items={goals}
//         renderItem={(goal) => {
//           const { id, title, discountText, threshold, infoText } = goal;

//           return (
//             <ResourceItem id={id} accessibilityLabel={`View details for ${title}`} key={id} onClick={() => console.log("Clicked", id)}>
//               <InlineStack align="space-evenly" wrap={false}>
//                 <Box
//                 >
//                   <Text as='p' variant="bodyMd" fontWeight="bold">
//                     G
//                   </Text>
//                 </Box>

//                 <BlockStack>
//                   <Text as='h3'>{title}</Text>
//                   <InlineStack align="center">
//                     <Badge tone="success">
//                       {discountText}
//                     </Badge>
//                     <Text as="span">
//                       {threshold}
//                     </Text>
//                     <Badge tone="info">
//                       {infoText}
//                     </Badge>
//                   </InlineStack>
//                 </BlockStack>

//                 <InlineStack>
//                   <Button variant='plain' icon={EditIcon} accessibilityLabel="Edit goal" />
//                   <Button variant='plain' icon={DeleteIcon} accessibilityLabel="Delete goal" />
//                 </InlineStack>
//               </InlineStack>
//             </ResourceItem>
//           );
//         }}
//       />
//     </Box>
//   );
// }




import React, { useState, useCallback } from 'react';
import {
  ResourceList,
  ResourceItem,
  Box,
  InlineStack,
  BlockStack,
  Text,
  Badge,
  Button,
  TextField,
  Modal,
  FormLayout,
  Select,
  Card,
  Layout,
  Tag,
  Form,
} from '@shopify/polaris';
import { EditIcon, DeleteIcon } from '@shopify/polaris-icons';
import type { ProductGQL } from 'app/types/app_create-goal';


export function SpendingGoalsResourceList({ initialGoals }: { initialGoals: ProductGQL[] | any }) {
  const [goals, setGoals] = useState(initialGoals);
  const [filter, setFilter] = useState('');
  const [activeEditId, setActiveEditId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'shipping',
    message: { success: '', progress: '' },
    conditions: { minimumSpent: 0, appliesTo: 'any-product' },
    discount: { type: 'free', value: 0, appliesTo: 'shipping' },
    active: true,
  });

  // Handle delete
  const handleDelete = useCallback((id) => {
    setGoals(goals.filter((goal) => goal.id !== id));
  }, [goals]);

  // Open edit modal
  const handleEdit = useCallback((id) => {
    const goal = goals.find((g) => g.id === id);
    setEditForm({ ...goal });
    setActiveEditId(id);
  }, [goals]);

  // Close edit modal
  const handleCloseEdit = useCallback(() => {
    setActiveEditId(null);
  }, []);

  // Save edited goal
  const handleSaveEdit = useCallback(() => {
    setGoals(goals.map((goal) =>
      goal.id === activeEditId ? { ...goal, ...editForm } : goal
    ));
    setActiveEditId(null);
  }, [goals, activeEditId, editForm]);

  // Handle form input change
  const handleFormChange = useCallback((field, value, subfield = null) => {
    if (subfield) {
      setEditForm((prev) => ({
        ...prev,
        [field]: { ...prev[field], [subfield]: value }
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  return (
    <Box padding="400">
      <BlockStack gap="400">
        <ResourceList
          resourceName={{ singular: 'goal', plural: 'goals' }}
          items={goals}
          renderItem={(goal) => (
            <ResourceItem id={goal.id} key={goal.id} onClick={() => {}}>
              <InlineStack align="space-evenly" blockAlign="center" gap="200">
                <Box padding="200" background="bg-surface-active" borderRadius="200">
                  <Text as="p" variant="bodyMd" fontWeight="bold" color="text-inverse">
                    {goal.type.charAt(0).toUpperCase()}
                  </Text>
                </Box>
                <BlockStack gap="100">
                  <Text as="h3" variant="bodyMd" fontWeight="semibold">
                    {goal.title}
                  </Text>
                  <InlineStack align="center" gap="200">
                    <Badge tone={goal.active ? 'success' : 'warning'}>
                      {goal.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Text as="span" variant="bodySm" color="text-subdued">
                      {goal.discount.type === 'free' ? 'Free Shipping' : `${goal.discount.value}% Off`}
                    </Text>
                    <Text as="span" variant="bodySm" color="text-subdued">
                      Min. Spend: ${goal.conditions.minimumSpent}
                    </Text>
                  </InlineStack>
                </BlockStack>
                <InlineStack gap="200">
                  <Button
                    variant="plain"
                    icon={EditIcon}
                    onClick={() => handleEdit(goal.id)}
                    accessibilityLabel="Edit goal"
                  />
                  <Button
                    variant="plain"
                    icon={DeleteIcon}
                    onClick={() => handleDelete(goal.id)}
                    accessibilityLabel="Delete goal"
                  />
                </InlineStack>
              </InlineStack>
            </ResourceItem>
          )}
        />
      </BlockStack>

      {/* Edit Modal */}
      <Modal
        open={Boolean(activeEditId)}
        onClose={handleCloseEdit}
        title="Edit Goal"
        primaryAction={{
          content: 'Save',
          onAction: handleSaveEdit,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleCloseEdit,
          },
        ]}
      >
        <Modal.Section>
          <Form>
            <FormLayout>
              <TextField
                label="Title"
                value={editForm.title}
                onChange={(value) => handleFormChange('title', value)}
                autoComplete="off"
              />
              <Select
                label="Type"
                options={[
                  { label: 'Shipping', value: 'shipping' },
                  { label: 'Order', value: 'order' },
                  { label: 'Product', value: 'product' },
                ]}
                value={editForm.type}
                onChange={(value) => handleFormChange('type', value)}
              />
              <TextField
                label="Success Message"
                value={editForm.message.success}
                onChange={(value) => handleFormChange('message', value, 'success')}
                autoComplete="off"
              />
              <TextField
                label="Progress Message"
                value={editForm.message.progress}
                onChange={(value) => handleFormChange('message', value, 'progress')}
                autoComplete="off"
              />
              <TextField
                label="Minimum Spend"
                type="number"
                value={editForm.conditions.minimumSpent.toString()}
                onChange={(value) => handleFormChange('conditions', value, 'minimumSpent')}
                autoComplete="off"
              />
              <Select
                label="Applies To"
                options={[
                  { label: 'Any Product', value: 'any-product' },
                  { label: 'Selected Products', value: 'selected-products' },
                  { label: 'Not Eligible', value: 'not-eligible' },
                ]}
                value={editForm.conditions.appliesTo}
                onChange={(value) => handleFormChange('conditions', value, 'appliesTo')}
              />
              <Select
                label="Discount Type"
                options={[
                  { label: 'Free', value: 'free' },
                  { label: 'Percentage', value: 'percentage' },
                ]}
                value={editForm.discount.type}
                onChange={(value) => handleFormChange('discount', value, 'type')}
              />
              <TextField
                label="Discount Value"
                type="number"
                value={editForm.discount.value.toString()}
                onChange={(value) => handleFormChange('discount', value, 'value')}
                autoComplete="off"
              />
              <Select
                label="Discount Applies To"
                options={[
                  { label: 'Shipping', value: 'shipping' },
                  { label: 'Orders', value: 'orders' },
                  { label: 'Products', value: 'products' },
                ]}
                value={editForm.discount.appliesTo}
                onChange={(value) => handleFormChange('discount', value, 'appliesTo')}
              />
              <Select
                label="Status"
                options={[
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false },
                ]}
                value={editForm.active}
                onChange={(value) => handleFormChange('active', value === 'true')}
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Box>
  );
}
