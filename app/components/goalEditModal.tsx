import React, { useState } from 'react'
import { Modal,TextField, BlockStack, Button, InlineStack,Form, FormLayout } from '@shopify/polaris'
import { GoalDiscountsValue } from 'app/types/app_create-goal';

interface modalProps {
  editModalOpen: boolean;
  setEditModalOpen: (open: boolean) => void;
  goal: GoalDiscountsValue;
  setGoal: (event: React.FormEvent,goal: GoalDiscountsValue) => void;
}


export default function GoalEditModal({editModalOpen,setEditModalOpen,goal,setGoal}: modalProps) {

    const [editGoal, setEditGoal] = useState((Number(goal.amount)/100).toString());
    const [editDiscount, setEditDiscount] = useState(goal.discount.toString());
    const [editSuccessMessage, setEditSuccessMessage] = useState(goal.successMessage );
    const [editProgressMessage, setEditProgressMessage] = useState(goal.progressMessage );

    function Footer() {
  return (
    <p>Make sure to save changes before closing the modal.</p>
  )
}

function handleSubmit(event: React.FormEvent) {
    const Goal = {
        amount: Number(editGoal),
        discount: Number(editDiscount),
        successMessage: editSuccessMessage,
        progressMessage: editProgressMessage
    };
    console.log({...Goal});
    setGoal(event,Goal);
    setEditModalOpen(false);
    event.preventDefault();
}

  return (
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Goal/Discount Pair"
        footer={<Footer />}
      >
        <Form action='edit' onSubmit={handleSubmit}>
            <FormLayout>
          <BlockStack gap="400">
            <TextField
              label={`Cart goal`}
              name="cart_goal"
              value={editGoal}
              onChange={setEditGoal}
              autoComplete="off"
              inputMode="numeric"
              helpText="Saved as amount (integer, cents)"
            />
            <TextField
              label="Discount percentage (integer)"
              name="discount_percent"
              value={editDiscount}
              onChange={setEditDiscount}
              autoComplete="off"
              inputMode="numeric"
              helpText="Saved as discount (integer, percent)"
            />
            <TextField
              label="Success Message"
              name="success_message"
              value={editSuccessMessage}
              onChange={setEditSuccessMessage}
              autoComplete="off"
              helpText="Shown when a goal is reached. Use {discount} for discount value."
            />
            <TextField
              label="Progress Message"
              name="progress_message"
              value={editProgressMessage}
              onChange={setEditProgressMessage}
              autoComplete="off"
              helpText="Shown before reaching a goal. Use {amountLeft}, {discount}, {percent}."
            />
          </BlockStack>
          </FormLayout>
          <InlineStack align='end' gap='200' blockAlign='center'>
        <Button onClick={() => setEditModalOpen(false)}>Close</Button>
        <Button variant='primary' role='submit' submit>
          Save
        </Button>
    </InlineStack>
        </Form>
      </Modal>
  )
}
