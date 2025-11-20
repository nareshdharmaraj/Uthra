// Utility functions for quantity conversion

// Convert any quantity to kg
const convertToKg = (value, unit) => {
  if (!value || !unit) return 0;
  
  const conversions = {
    'kg': 1,
    'quintal': 100,
    'ton': 1000,
    'piece': 0, // Cannot convert pieces to kg
    'dozen': 0,
    'liter': 1 // Approximate for liquids
  };
  
  const multiplier = conversions[unit] || 1;
  return multiplier > 0 ? value * multiplier : value;
};

// Format quantity with unit
const formatQuantity = (quantity) => {
  if (!quantity || typeof quantity !== 'object') return { value: 0, unit: 'kg' };
  return {
    value: quantity.value || 0,
    unit: quantity.unit || 'kg'
  };
};

// Convert quantity to kg and format
const convertAndFormatQuantity = (quantity) => {
  const formatted = formatQuantity(quantity);
  const valueInKg = convertToKg(formatted.value, formatted.unit);
  return {
    value: valueInKg,
    unit: 'kg',
    original: formatted
  };
};

module.exports = {
  convertToKg,
  formatQuantity,
  convertAndFormatQuantity
};
