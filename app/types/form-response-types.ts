// ====================
// Imports
// ====================
import type { ProductFormRadio, ShippingFormRadio } from 'app/enums/formSelectContents';
import type { ProductGQL } from './app_create-goal';
import type { DiscountKind } from 'app/enums/discount-goals';


// ====================
// Shared Types
// ====================

interface FormMessages {
  success: string;
  progress: string;
}

/**
 * Generic base interface for all form goals.
 * Helps enforce correct 'type' field in discriminated unions.
 */
export interface BaseFormGoalResponse<T extends 'product' | 'order' | 'shipping'> {
  id: string;
  type: T;
  title: string;
  message?: FormMessages;
}


// ====================
// Product Form
// ====================

export interface ProductForm extends BaseFormGoalResponse<'product'> {
  conditions: ProductGoalConditions;
  discount: ProductGoalDiscount;
}

type ProductGoalConditions = {
  minimumSpent: number;
  appliesTo: ProductFormRadio.ANY | ProductFormRadio.SPECIFIC;
  selectedProducts?: ProductGQL[]; // Required if appliesTo === SPECIFIC
};

type ProductGoalDiscount = {
  type: 'percentage' | 'fixed_amount';
  value: number;
  appliesTo: DiscountKind.PRODUCT;
};


// ====================
// Order Form
// ====================

export interface OrderForm extends BaseFormGoalResponse<'order'> {
  conditions: OrderGoalConditions;
  discount: OrderGoalDiscount;
}

type OrderGoalConditions = {
  minimumSpent: number;
  appliesTo: DiscountKind.ORDER; // Could use a separate enum if needed
};

type OrderGoalDiscount = {
  type: 'percentage' | 'fixed_amount';
  value: number;
  appliesTo: DiscountKind.ORDER;
};


// ====================
// Shipping Form
// ====================

export interface ShippingForm extends BaseFormGoalResponse<'shipping'> {
  conditions: ShippingGoalConditions;
  discount: ShippingGoalDiscount;
}

type ShippingGoalConditions = {
  minimumSpent: number;
  appliesTo:
    | ShippingFormRadio.ANY
    | ShippingFormRadio.SPECIFIC
    | ShippingFormRadio.NOTELIGIBLE;
  selectedProducts?: ProductGQL[]; // Required if appliesTo === SPECIFIC
};

type ShippingGoalDiscount = {
  type: 'free' | 'rate';
  value: number;
  appliesTo: DiscountKind.SHIPPING;
};


// ====================
// Unified Type
// ====================

export type GoalFormResType = ProductForm | OrderForm | ShippingForm;
