// Utility functions for quantity conversion

export interface Quantity {
  value: number;
  unit: string;
}

export interface ConvertedQuantity {
  value: number;
  unit: string;
  original: Quantity;
}

// Convert any quantity to kg
export const convertToKg = (value: number, unit: string): number => {
  if (!value || !unit) return 0;
  
  const conversions: Record<string, number> = {
    'kg': 1,
    'quintal': 100,
    'ton': 1000,
    'tonne': 1000,
    'piece': 0, // Cannot convert pieces to kg
    'dozen': 0,
    'liter': 1 // Approximate for liquids
  };
  
  const multiplier = conversions[unit.toLowerCase()] || 1;
  return multiplier > 0 ? value * multiplier : value;
};

// Format quantity with proper display
export const formatQuantity = (quantity: any): string => {
  if (!quantity || typeof quantity !== 'object') {
    return '0 kg';
  }
  
  const value = quantity.value || 0;
  const unit = quantity.unit || 'kg';
  
  // If already in kg or convertible units, convert to kg for consistency
  if (['kg', 'quintal', 'ton', 'tonne'].includes(unit.toLowerCase())) {
    const kgValue = convertToKg(value, unit);
    return `${kgValue.toFixed(2)} kg`;
  }
  
  // For non-weight units (piece, dozen, liter), keep original
  return `${value} ${unit}`;
};

// Get converted quantity object
export const convertAndFormatQuantity = (quantity: any): ConvertedQuantity => {
  if (!quantity || typeof quantity !== 'object') {
    return {
      value: 0,
      unit: 'kg',
      original: { value: 0, unit: 'kg' }
    };
  }
  
  const originalValue = quantity.value || 0;
  const originalUnit = quantity.unit || 'kg';
  
  // If weight unit, convert to kg
  if (['kg', 'quintal', 'ton', 'tonne'].includes(originalUnit.toLowerCase())) {
    const valueInKg = convertToKg(originalValue, originalUnit);
    return {
      value: valueInKg,
      unit: 'kg',
      original: { value: originalValue, unit: originalUnit }
    };
  }
  
  // For non-weight units, keep original
  return {
    value: originalValue,
    unit: originalUnit,
    original: { value: originalValue, unit: originalUnit }
  };
};

// Format price with currency
export const formatPrice = (price: any): string => {
  if (!price || typeof price !== 'object') {
    return '₹0';
  }
  
  const value = price.value || 0;
  return `₹${value.toLocaleString('en-IN')}`;
};

// Format price with unit
export const formatPriceWithUnit = (price: any): string => {
  if (!price || typeof price !== 'object') {
    return '₹0/kg';
  }
  
  const value = price.value || 0;
  const unit = price.unit || 'per_kg';
  
  // Clean up unit display
  const unitDisplay = unit.replace('per_', '/');
  return `₹${value.toLocaleString('en-IN')}${unitDisplay}`;
};
