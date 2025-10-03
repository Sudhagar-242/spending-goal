import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData, useNavigate, useNavigation } from '@remix-run/react';
import {
  Card,
  Page,
  Text,
  BlockStack,
  Button,
  TextField,
  EmptyState,
  InlineStack,
  Modal,
  Frame,
  Select,
  SkeletonBodyText,
  SkeletonDisplayText,
  Toast,
  Banner,
  Layout,
  SkeletonPage,
  ContextualSaveBar,
} from '@shopify/polaris';
import { apiVersion, authenticate } from '../models/shopify.server';
import { useCallback, useEffect, useState } from 'react';
import {
  CREATE_OR_UPDATE_METAFIELD,
  SET_GOAL_DISCOUNTS_METAFIELD,
  SHOP_AND_GOAL_QUERY,
} from 'app/graphql/meta_fields';
import type { GoalDiscountsValue, ProductGQL, ShopData } from 'app/types/app_create-goal';
import { requestMutation, requestQuery } from 'app/utils/requestGQL';
import type { GoalFormResType } from 'app/types/form-response-types';
import { DiscountGoals, DiscountKind } from 'app/enums/discount-goals';
import { ensureDiscountExists } from 'app/utils/create-discount-function-existance';
import { fetchAllProducts } from 'app/utils/fetchAllProducts';
import { addGoals, removeGoal, editGoal } from 'app/utils/goalOperations';
import OrderGoalForm from 'app/components/forms/orderForm';
import ProductGoalForm from 'app/components/forms/productForm';
import ShippingGoalForm from 'app/components/forms/shippingForm';
import { ProductsContextProvider } from 'app/context/productsContext';
import { SpendingGoalsResourceList } from 'app/components/goals_lister';
import { SaveBar, useAppBridge } from '@shopify/app-bridge-react';
import { Mode } from 'app/enums/mode.enum';
import InlineEditableText from 'app/components/form-components/inline-Editable-Text';

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  try {
    const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
    if (shop) {
      const { id: shopId, url, currencyCode, goalDiscounts, discountId } = shop;
      const { products, pageInfo } = await fetchAllProducts(admin, 200, null);
      return {
        shopId,
        currencyCode,
        goalDiscountArray: goalDiscounts
          ? (JSON.parse(goalDiscounts?.value as string) as GoalDiscountsValue[])
          : [],
        discountId,
        url,
        accessToken: session?.accessToken,
        apiVersion,
        products,
        pageInfo,
        error: '',
      };
    }
    return {
      shopId: '',
      currencyCode: '',
      goalDiscountArray: [],
      discountId: '',
      products: null,
      pageInfo: null,
      error: 'Shop metafield not available',
    };
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error in loader:', error.message);
    }
    return {
      shopId: '',
      currencyCode: '',
      goalDiscountArray: [],
      discountId: '',
      products: null,
      pageInfo: null,
      error: 'Shop metafield not available',
    };
  }
}
export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  // Get the shop data
  const { shop } = await requestQuery<ShopData>(admin, SHOP_AND_GOAL_QUERY);
  const { goalDiscounts, discountId, id: shopId } = shop;

  // Parse existing goals or initialize empty array
  let goalDiscountsArray: GoalDiscountsValue[] = goalDiscounts?.value
    ? JSON.parse(goalDiscounts.value as string)
    : [];

  // Handle goal form submission from any of the forms
  const goalData = formData.get('goalData')?.toString();
  if (goalData) {
    try {
      // Parse the goal data from the form
      const newGoal = JSON.parse(goalData);

      // Validate the goal data based on its type
      if (!newGoal.type || !['order', 'product', 'shipping'].includes(newGoal.type)) {
        return json({ ok: false, error: 'Invalid goal type' }, { status: 400 });
      }

      // Add metadata
      newGoal.id = newGoal.id ?? crypto.randomUUID();
      newGoal.active = true;
      newGoal.createdAt = new Date().toISOString();
      newGoal.updatedAt = new Date().toISOString();

      console.log('ensures', discountId);
      // Ensure discount exists
      if (discountId) {
        await ensureDiscountExists(admin, discountId.value, shopId);
      }
      // Add the new goal to the array
      goalDiscountsArray.push(newGoal);

      // Save the updated goals array to Shopify
      const { metafieldsSet } = await requestMutation<{
        metafieldsSet: { userErrors: any[]; metafields: any[] };
      }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
        variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
      });

      const userErrors = metafieldsSet?.userErrors ?? [];
      if (userErrors.length > 0) {
        return json({ ok: false, userErrors }, { status: 400 });
      }

      return json({ ok: true, goalDiscounts: goalDiscountsArray });
    } catch (error) {
      console.error('Error processing goal submission:', error);
      return json({ ok: false, error: 'Failed to process goal submission' }, { status: 400 });
    }
  }

  // Handle other actions (ADD, REMOVE, EDIT)
  const actionType = formData.get('actionType')?.toString() ?? '';
  if (
    [DiscountGoals.ADD, DiscountGoals.REMOVE, DiscountGoals.EDIT].includes(actionType as any) &&
    (!discountId || !discountId.id)
  ) {
    await ensureDiscountExists(admin, discountId?.id, shopId);
  }

  switch (actionType) {
    case DiscountGoals.ADD:
      goalDiscountsArray.push(addGoals(formData, goalDiscountsArray) as GoalDiscountsValue);
      break;
    case DiscountGoals.REMOVE:
      const indexToRemove = removeGoal(formData);
      if (indexToRemove >= 0 && indexToRemove < goalDiscountsArray.length) {
        goalDiscountsArray.splice(indexToRemove, 1);
      }
      break;
    case DiscountGoals.EDIT:
      const { idx, goal } = editGoal(formData);
      if (idx >= 0 && idx < goalDiscountsArray.length) {
        goalDiscountsArray[idx] = {
          ...goalDiscountsArray[idx],
          ...goal,
          // updatedAt: new Date().toISOString(),
        };
      }
      break;
    default:
      return json({ ok: false, userErrors: [{ message: 'Invalid action type' }] }, { status: 400 });
  }

  // Save the updated goals array to Shopify
  const { metafieldsSet } = await requestMutation<{
    metafieldsSet: { userErrors: any[]; metafields: any[] };
  }>(admin, SET_GOAL_DISCOUNTS_METAFIELD, {
    variables: { ownerId: shopId, value: JSON.stringify(goalDiscountsArray) },
  });

  const userErrors = metafieldsSet?.userErrors ?? [];
  const metafields = metafieldsSet?.metafields ?? [];
  if (userErrors.length > 0) {
    return json({ ok: false, userErrors }, { status: 400 });
  }
  return json({ ok: true, metafields, goalDiscounts: goalDiscountsArray });
}

// --- Types ---
interface GoalType {
  id: string;
  name: string;
}
interface SectionType {
  id: string;
  name: string;
  goals: GoalType[];
}

// --- Component ---
export default function Index() {
  const [mode, setMode] = useState<Mode>(Mode.IDLE);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [addingGoalSectionId, setAddingGoalSectionId] = useState<string | null>(null);
  const [tempGoalName, setTempGoalName] = useState('');

  // --- Section logic ---
  const handleAddSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        name: `Section ${sections.length + 1}`,
        goals: [],
      },
    ]);
    setMode(Mode.EDIT);
  };

  const handleRenameSection = (id: string, newName: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, name: newName } : s)));
  };

  // --- Goal logic ---
  const handleAddGoal = (sectionId: string) => {
    setAddingGoalSectionId(sectionId);
    setTempGoalName('');
  };

  const handleSaveGoal = () => {
    if (addingGoalSectionId) {
      setSections(
        sections.map((section) =>
          section.id === addingGoalSectionId
            ? {
                ...section,
                goals: [
                  ...section.goals,
                  { id: Date.now().toString(), name: tempGoalName || 'New Goal' },
                ],
              }
            : section,
        ),
      );
    }
    setAddingGoalSectionId(null);
    setTempGoalName('');
  };

  // --- Mode toggles ---
  const handleEditMode = () => setMode(Mode.EDIT);
  const handleSaveMode = () => setMode(Mode.IDLE);

  // --- UI rendering ---
  const renderSections = () => {
    if (sections.length === 0) {
      return (
        <EmptyState
          heading="No sections yet"
          action={{ content: 'Add Section', onAction: handleAddSection }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <Text as="p">Add sections to get started.</Text>
        </EmptyState>
      );
    }

    return (
      <BlockStack gap="400">
        {sections.map((section) => (
          <Card key={section.id}>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <InlineEditableText
                  value={section.name}
                  onSave={(newVal) => handleRenameSection(section.id, newVal)}
                />
              </InlineStack>

              {/* Goals list */}
              <BlockStack gap="200">
                {section.goals.length === 0 ? (
                  <Text as="p">No goals yet. Click "Add Goal" to create one.</Text>
                ) : (
                  section.goals.map((goal) => (
                    <SpendingGoalsResourceList
                      initialGoals={[]} 
                      key={goal.id}
                    />
                  ))
                )}
              </BlockStack>

              {mode === Mode.EDIT && (
                <Button fullWidth onClick={() => handleAddGoal(section.id)}>
                  Add Goal
                </Button>
              )}
            </BlockStack>
          </Card>
        ))}
      </BlockStack>
    );
  };

  return (
    <>
      <Page
        title="Sections and Goals"
        primaryAction={{
          content: mode === Mode.IDLE ? 'Edit Mode' : 'Save',
          onAction: mode === Mode.IDLE ? handleEditMode : handleSaveMode,
        }}
        secondaryActions={
          mode === Mode.EDIT
            ? [
                {
                  content: 'Add Section',
                  onAction: handleAddSection,
                },
              ]
            : undefined
        }
      >
        {renderSections()}

        {/* Modal for adding goal */}
        <Modal
          open={!!addingGoalSectionId}
          onClose={() => setAddingGoalSectionId(null)}
          title="Add Goal 121"
          primaryAction={{ content: 'Save', onAction: handleSaveGoal }}
          secondaryActions={[{ content: 'Cancel', onAction: () => setAddingGoalSectionId(null) }]}
        >
          <Modal.Section>
            <TextField
              label="Goal Name"
              value={tempGoalName}
              onChange={setTempGoalName}
              autoComplete="off"
            />
          </Modal.Section>
        </Modal>

        {/* Save bar */}
        <SaveBar open={mode === Mode.EDIT}>
          <button variant="primary" onClick={handleSaveMode}>
            Save
          </button>
          <button onClick={handleSaveMode}>Discard</button>
        </SaveBar>
      </Page>
    </>
  );
}

// interface GoalType {
//   id: string;
//   name: string;
// }

// interface SectionType {
//   id: string;
//   name: string;
//   goals: GoalType[];
// }

// export default function Index() {
//   const { goalDiscountArray } = useLoaderData<typeof loader>();

//   const [mode, setMode] = useState<'idle' | 'edit'>('idle');
//   const [sections, setSections] = useState<SectionType[]>([]);
//   const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
//   const [tempSectionName, setTempSectionName] = useState('');


//   // Switch modes
//   const handleEditMode = () => {
//     console.log("editting");
//     setMode('edit');
//     handleSaveSection();
//   };
//   const handleSaveMode = () => {
//     console.log("idle...");
//     setMode('idle');
//   };

//   // Section add/edit logic
//   const handleAddSection = () => {
//     setEditingSectionId(null);
//     setTempSectionName('');
//     setSections([
//       ...sections,
//       {
//         id: Date.now().toString(),
//         name: `Section ${sections.length + 1}`,
//         goals: [],
//       },
//     ]);
//   };

//   const handleEditSection = (id: string, currentName: string) => {
//     setEditingSectionId(id);
//     setTempSectionName(currentName);
//   };

//   const handleSaveSection = () => {
//     if (editingSectionId) {
//       setSections(
//         sections.map((section) =>
//           section.id === editingSectionId ? { ...section, name: tempSectionName } : section,
//         ),
//       );
//     }
//     setEditingSectionId(null);
//     setTempSectionName('');
//   };

//   const renderSections = () => {
//     if (sections.length === 0) {
//       return (
//         <EmptyState
//           heading="No sections yet"
//           action={{ content: 'Add Section', onAction: handleAddSection }}
//           image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
//         >
//           <Text as="p">Add sections to get started.</Text>
//         </EmptyState>
//       );
//     }

//     return (
//       <BlockStack gap="400">
//         {sections.map((section) => (
//           <Card key={section.id}>
//             <BlockStack gap="200">
//               <InlineStack align="space-between">
//                 <Text variant="headingMd" as="h3">
//                   {section.name}
//                 </Text>
//                 {mode === 'edit' && (
//                   <Button onClick={() => handleEditSection(section.id, section.name)}>Edit</Button>
//                 )}
//               </InlineStack>
//               <BlockStack gap="200">
//                 {section.goals.length === 0 ? (
//                   <Text as="p">No goals yet. Click "Add Goal" to create one.</Text>
//                 ) : (
//                   section.goals.map((goal, id) => (
//                     <SpendingGoalsResourceList initialGoals={goalDiscountArray} key={id} />
//                   ))
//                 )}
//               </BlockStack>
//               {mode === 'edit' && <Button fullWidth>Add Goal</Button>}
//             </BlockStack>
//           </Card>
//         ))}
//       </BlockStack>
//     );
//   };

//   return (
//     <>
//       <Page
//         title="Sections and Goals"
//         primaryAction={{
//           content: mode === 'idle' ? 'Edit Mode' : 'Save',
//           onAction: mode === 'idle' ? handleEditMode : handleSaveMode,
//         }}
//       >
//         {renderSections()}
//         <SaveBar id='edit-save-bar' open={mode === 'edit'} onShow={() => console.log("Showing Save Bar")} onHide={() => console.log("Hiding Save Bar")}>
//           <button variant='primary' onClick={handleSaveMode}>Save</button>
//           <button onClick={handleEditMode}>Discard</button>
//         </SaveBar>
//       </Page>
//     </>
//   );
// }

// export default function Index() {
//   const { shopId, currencyCode, goalDiscountArray, products, error } =
//     useLoaderData<typeof loader>();
//   const fetcher = useFetcher<typeof action>();
//   const [mode, setMode] = useState<boolean>(false); // "idle" = false | "edit" = true
//   const [sections, setSections] = useState<SectionType[]>([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
//   const [tempSectionName, setTempSectionName] = useState('');

//   const handleSaveMode = () => {
//     setMode(false);
//     handleSaveSection();
//   };
//   const handleEditMode = () => {
//     setMode(true);
//   };

//   const handleAddSection = () => {
//     setIsEditing(true);
//     setEditingSectionId(null);
//     setTempSectionName('');
//   };

//   const handleEditSection = (sectionId: string, currentName: string) => {
//     setIsEditing(true);
//     setEditingSectionId(sectionId);
//     setTempSectionName(currentName);
//   };

//   const handleSaveSection = () => {
//     if (editingSectionId === null) {
//       const newSection: SectionType = {
//         id: Date.now().toString(),
//         name: tempSectionName || `Section ${sections.length + 1}`,
//         goals: [],
//       };
//       setSections([...sections, newSection]);
//     } else {
//       setSections(
//         sections.map((section) =>
//           section.id === editingSectionId ? { ...section, name: tempSectionName } : section,
//         ),
//       );
//     }
//     setIsEditing(false);
//     setEditingSectionId(null);
//     setTempSectionName('');
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     setEditingSectionId(null);
//     setTempSectionName('');
//   };

//   const renderSections = () => {
//     if (isEditing) {
//       return (
//         <Modal
//           open={isEditing}
//           onClose={handleCancelEdit}
//           title={editingSectionId ? 'Edit Section' : 'Add Section'}
//           primaryAction={{
//             content: 'Save',
//             onAction: handleSaveSection,
//           }}
//           secondaryActions={[{ content: 'Cancel', onAction: handleCancelEdit }]}
//         >
//           <Modal.Section>
//             <TextField
//               label="Section Name"
//               value={tempSectionName}
//               onChange={setTempSectionName}
//               autoComplete="off"
//             />
//           </Modal.Section>
//         </Modal>
//       );
//     }

//     if (sections.length === 0) {
//       return (
//         <EmptyState
//           heading="No sections yet"
//           action={{ content: 'Add Section', onAction: handleAddSection }}
//           image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
//         >
//           <Text as="p">Add sections to get started.</Text>
//         </EmptyState>
//       );
//     }

//     return (
//       <BlockStack gap="400">
//         {sections.map((section) => (
//           <Card key={section.id}>
//             <BlockStack gap="200">
//               <InlineStack align="space-between">
//                 <Text variant="headingMd" as="h3">
//                   {section.name}
//                 </Text>
//                 {mode && (
//                   <Button onClick={() => handleEditSection(section.id, section.name)}>Edit</Button>
//                 )}
//               </InlineStack>
//               <BlockStack gap="200">
//                 {section.goals.length === 0 ? (
//                   <Text as="p">No goals yet. Click "Add Goal" to create one.</Text>
//                 ) : (
//                   section.goals.map((goal, id) => (
//                     <SpendingGoalsResourceList initialGoals={goalDiscountArray} key={id} />
//                   ))
//                 )}
//               </BlockStack>
//               <Button fullWidth>Add Goal</Button>
//             </BlockStack>
//           </Card>
//         ))}
//       </BlockStack>
//     );
//   };

//   return (
//     <Page
//       title="Sections and Goals"
//       primaryAction={{
//         content: mode ? 'Add Section' : 'save',
//         onAction: mode ? handleSaveMode : handleEditMode,
//       }}
//     >
//       {renderSections()}
//     </Page>
//   );
// }
