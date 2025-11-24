// Test precision issues with crop quantities and prices
const testPrecisionIssue = () => {
  console.log('Testing floating point precision issues...\n');

  // Test cases based on user report
  const testCases = [
    { input: 1000, description: "User enters 1000 quantity" },
    { input: 10, description: "User enters 10 price" },
    { input: 999.99, description: "Edge case near 1000" },
    { input: 9.99, description: "Edge case near 10" }
  ];

  testCases.forEach(testCase => {
    console.log(`${testCase.description}:`);
    console.log(`  Original value: ${testCase.input}`);
    
    // Test parseFloat (used in frontend)
    const parsed = parseFloat(testCase.input);
    console.log(`  parseFloat: ${parsed}`);
    
    // Test JSON serialization (happens during API calls)
    const jsonSerialized = JSON.parse(JSON.stringify(testCase.input));
    console.log(`  JSON serialized: ${jsonSerialized}`);
    
    // Test MongoDB number storage simulation
    const mongoNum = Number(testCase.input);
    console.log(`  Number(): ${mongoNum}`);
    
    // Test if there's any rounding happening
    const rounded = Math.round(testCase.input * 100) / 100;
    console.log(`  Rounded to 2 decimals: ${rounded}`);
    
    // Test toFixed(2) then parse (common formatting pattern)
    const fixedParsed = parseFloat(testCase.input.toFixed(2));
    console.log(`  toFixed(2) then parse: ${fixedParsed}`);
    
    console.log('---');
  });

  // Check for specific patterns that could cause 1000 -> 998.00
  console.log('\nChecking for tax/fee deductions:');
  const originalPrice = 1000;
  const originalQuantity = 10;
  
  // Common deduction patterns
  const taxRates = [0.02, 0.018, 0.022]; // 2%, 1.8%, 2.2%
  taxRates.forEach(rate => {
    const afterTax = originalPrice * (1 - rate);
    console.log(`  ${originalPrice} - ${rate*100}% tax = ${afterTax}`);
    if (Math.abs(afterTax - 998) < 1) {
      console.log(`  ⚠️  POSSIBLE MATCH: ${rate*100}% deduction could cause 1000 -> 998`);
    }
  });

  // Check if price per unit calculations
  console.log('\nChecking quantity calculations:');
  const pricePerUnit = originalQuantity;
  const quantities = [99.8, 99.9, 100.2];
  quantities.forEach(qty => {
    const totalPrice = pricePerUnit * qty / 100; // If per 100 units
    console.log(`  ${pricePerUnit} * ${qty}/100 = ${totalPrice}`);
    if (Math.abs(totalPrice - 9.98) < 0.01) {
      console.log(`  ⚠️  POSSIBLE MATCH: Quantity calculation could cause 10 -> 9.98`);
    }
  });
};

// Test frontend number input handling
const testInputHandling = () => {
  console.log('\n\nTesting input field handling...\n');
  
  // Simulate user input -> parseFloat chain
  const userInputs = ['1000', '10', '1000.0', '10.0'];
  
  userInputs.forEach(input => {
    console.log(`User types: "${input}"`);
    const parsed = parseFloat(input);
    console.log(`  parseFloat result: ${parsed}`);
    
    // Simulate form submission
    const formData = {
      quantity: { value: parsed, unit: 'kg' },
      price: { value: parsed, unit: 'per_kg' }
    };
    console.log(`  Form data: ${JSON.stringify(formData)}`);
    console.log('---');
  });
};

console.log('🔍 Investigating precision issues with crop quantities and prices\n');
testPrecisionIssue();
testInputHandling();

console.log('\n📋 Summary:');
console.log('If no obvious precision issues found above, the problem might be:');
console.log('1. Database storage/retrieval precision');
console.log('2. Backend calculations (tax, fees, conversions)');
console.log('3. Frontend display formatting');
console.log('4. API response transformation');
console.log('\nNext steps: Check actual database values and API responses');