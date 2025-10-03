// String enum for logic
export enum ProductFormRadio {
  ANY = 'any-product',
  SPECIFIC = 'specific-product',
}

// Labels for UI
export const ProductFormRadioLabels = {
  [ProductFormRadio.ANY]: 'Any products',
  [ProductFormRadio.SPECIFIC]: 'Specific products',
};

// String enum for logic
export enum ShippingFormRadio {
  ANY = 'any-product',
  SPECIFIC = 'specific-product',
  NOTELIGIBLE= 'not-eligible'
}

// Labels for UI
export const ShippingFormRadioLabels = {
  [ShippingFormRadio.ANY]: 'Any products',
  [ShippingFormRadio.SPECIFIC]: 'Specific products',
  [ShippingFormRadio.NOTELIGIBLE]: 'Not Eligible Products'
};