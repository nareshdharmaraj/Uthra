// Load environment variables first\nrequire('dotenv').config();\n\n// Simple test to check environment variables
console.log('📋 Environment Variables Check:');
console.log('EMAILJS_SERVICE_ID:', process.env.EMAILJS_SERVICE_ID);
console.log('EMAILJS_TEMPLATE_ID:', process.env.EMAILJS_TEMPLATE_ID); 
console.log('EMAILJS_PUBLIC_KEY:', process.env.EMAILJS_PUBLIC_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);