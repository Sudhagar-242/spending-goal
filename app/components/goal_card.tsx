import React from 'react'
import { BlockStack, Button, Card, InlineStack, Text } from '@shopify/polaris'
import GoalEditModal from './goalEditModal'
import type { GoalDiscountsValue } from 'app/types/app_create-goal'

interface GoalCardProps {
  goal: GoalDiscountsValue;
  index: number;
  currencyCode: string;
  isOperational?: boolean;
  // Only required if operational
  isEditModalOpen?: boolean;
  editingIndex?: number | null;
  setEditModalOpen?: (open: boolean) => void;
  onEditClick?: (index: number) => void;
  removingIndex?: number | null;
  setRemovingIndex?: (index: number) => void;
  fetcher?: any;
  shopId?: string;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  index,
  currencyCode,
  isOperational = true,
  isEditModalOpen,
  editingIndex,
  setEditModalOpen,
  onEditClick,
  removingIndex,
  setRemovingIndex,
  fetcher,
  shopId,
}) => (
  <Card key={index} padding="400">
    <BlockStack gap="200">
      <Text as="h4" variant="bodySm" tone="success">
        Goal Name: {goal?.name ?? ''}
      </Text>
      <Text as="h4" variant="headingSm">
        Amount:{' '}
        {goal
          ? new Intl.NumberFormat(
              typeof navigator !== 'undefined' ? navigator.language : 'en-IN',
              {
                style: 'currency',
                currency: currencyCode,
              },
            ).format(Number(goal.amount) / 100)
          : '-'}
      </Text>
      <Text as="h4" variant="headingSm" tone="success">
        Discount: {goal ? goal.discount : '-'}%
      </Text>
      <Text as="p" variant="bodySm" tone="subdued">
        Progress Message:{' '}
        <span style={{ fontStyle: 'italic' }}>
          {goal?.progressMessage ?? ''}
        </span>
      </Text>
      <Text as="p" variant="bodySm" tone="success">
        Success Message:{' '}
        <span style={{ fontWeight: 500 }}>
          {goal?.successMessage ?? ''}
        </span>
      </Text>
      {isOperational && onEditClick && setRemovingIndex && fetcher && shopId !== undefined ? (
        <InlineStack align="end">
          <Button variant="secondary" onClick={() => onEditClick(index)}>
            Edit
          </Button>
          <fetcher.Form method="post" onSubmit={() => setRemovingIndex(index)}>
            <input type="hidden" name="ownerId" value={shopId ?? ''} />
            <input type="hidden" name="actionType" value="remove" />
            <input type="hidden" name="removeIdx" value={index} />
            <Button
              submit
              variant="tertiary"
              loading={removingIndex === index && fetcher.state !== 'idle'}
            >
              Remove
            </Button>
          </fetcher.Form>
        </InlineStack>
      ) : null}
    </BlockStack>
  </Card>
)

export default GoalCard