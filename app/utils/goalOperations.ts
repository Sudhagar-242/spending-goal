import type { GoalDiscountsValue } from "app/types/app_create-goal";


export function addGoals(formData: FormData, goalDiscountsArray: GoalDiscountsValue[]) {
  const goalName = formData.get('goal_name') ?? '';
  const amountRaw = formData.get('cart_goal') ?? '';
  const discountRaw = formData.get('discount_percent') ?? '';
  const successMessageRaw = formData.get('success_message') ?? '';
  const progressMessageRaw = formData.get('progress_message') ?? '';
  const amountInt = Number.parseInt(amountRaw as string, 10) * 100;
  const discountInt = Number.parseInt(discountRaw as string, 10);
  if (
    Number.isFinite(amountInt) &&
    Number.isFinite(discountInt) &&
    !goalDiscountsArray.some((pair) => pair.amount === amountInt)
  ) {
    return {
      name: goalName.toString(),
      amount: amountInt,
      discount: discountInt,
      successMessage: successMessageRaw.toString(),
      progressMessage: progressMessageRaw.toString(),
    };
  }
}

export function removeGoal(formData: FormData) {
  return Number(formData.get('removeIdx'));
}

export function editGoal(formData: FormData) {
  const editingIndexRaw = formData.get('editingIndex');
  const editingIndex = typeof editingIndexRaw === 'string' ? parseInt(editingIndexRaw, 10) : NaN;
  const cartGoalName = formData.get('goal_name') ?? '';
  const cartGoalRaw = formData.get('cart_goal') ?? '';
  const discountPercentRaw = formData.get('discount_percent') ?? '';
  const successMessageRaw = formData.get('success_message') ?? '';
  const progressMessageRaw = formData.get('progress_message') ?? '';
  return {
    idx: editingIndex,
    goal: {
      name: cartGoalName.toString(),
      amount: Number.parseInt(cartGoalRaw as string, 10) * 100,
      discount: Number.parseInt(discountPercentRaw as string, 10),
      successMessage: successMessageRaw.toString(),
      progressMessage: progressMessageRaw.toString(),
    },
  };
}
