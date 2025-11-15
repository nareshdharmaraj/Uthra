📄 WhatsApp Chatbot Specification Prompt
Prompt Title: Uthra WhatsApp Chatbot User Flow and Data Specification
Goal: Create a comprehensive user flow and data specification for the Uthra WhatsApp Chatbot. This document will serve as the guide for the n8n implementation.
Key Principle: The chatbot's flow must closely mimic the existing IVR (Interactive Voice Response) flow for a seamless user experience. All data collected must be stored in the local MongoDB.
Part 1: Prerequisites & Data Structures (for MongoDB)
The chatbot will utilize the following MongoDB collections:
baseusers: (Existing) Used for Mobile Number and PIN validation.
crops: (Existing) The final destination for successfully registered crop listings.
whatsapp_conversations (NEW - State Management):
Fields to Store:
mobileNumber (String, Primary Key)
currentStep (String, e.g., 'AWAITING_PIN', 'AWAITING_CROP_NAME')
tempData (JSON Object, Stores all answers collected so far, e.g., { crop: "Tomato", qty: 500 })
Part 2: Main Conversational Flow (Farmer Login)
This is the mandatory first part of any interaction, ensuring the user is a registered Farmer.
Step (Chatbot)	State (currentStep)	Chatbot Action (Prompt)	User Input Expected	Validation/Logic
1. Greeting	START	"Welcome to Uthra! To access your account, please reply with your registered 10-digit mobile number."	[Mobile Number]	Must be a 10-digit number.
2. Mobile Check	AWAITING_MOBILE	(If number found in baseusers) "Thank you! Please enter your 6-digit PIN to continue."	[PIN]	Check against baseusers PIN.
3. Login Failure	AWAITING_MOBILE / AWAITING_PIN	(If number/PIN is incorrect) "Login failed. Please check your details and reply with your 10-digit mobile number to try again."	[Mobile Number]	Reset state back to AWAITING_MOBILE.
4. Main Menu	AWAITING_MENU_CHOICE	"Vanakkam, [Farmer Name]! Welcome to Uthra. How can I help you today? \n\n1 → Enter new crop\n2 → Manage crop details (Coming Soon)\n3 → View requests received (Coming Soon)\n4 → Talk to agent (Coming Soon)\n9 → Exit"	1, 2, 3, 4, or 9	Must be a valid menu option.
Part 3: Feature Flow - Enter New Crop (User replies with '1')
This flow collects all necessary data to create a listing in the crops collection. The answers are temporarily stored in whatsapp_conversations.tempData during the process.
Step (Chatbot)	State (currentStep)	Chatbot Action (Prompt)	User Input Expected	Data Field Collected (in tempData)
1. Crop Name	AWAITING_CROP_NAME	"Please reply with the name of your crop (e.g., Tomato, Paddy)."	[Crop Name]	cropName
2. Quantity	AWAITING_QUANTITY	"What is the available quantity? Please reply with the number only in kilograms (kg)."	[Number]	quantity
3. Unit Price	AWAITING_PRICE	"What is the expected price? Please reply with the rate per kg (number only)."	[Number]	unitPrice
4. Delivery Date	AWAITING_DELIVERY_DATE	"What is the earliest expected delivery date? Please reply in the format DD/MM/YYYY."	[Date]	deliveryDate
5. Confirmation	AWAITING_CONFIRMATION	"You entered: [CropName], [Quantity]kg at ₹[Price]/kg, available on [Date]. Reply YES to confirm and list your crop, or NO to restart."	YES or NO	(YES triggers final MongoDB write)
6. Final Store	COMPLETED	(If YES) "Success! Your crop is now listed. Buyer requests will be sent to this number. Thank you." (If NO) "Listing cancelled. Returning to Main Menu. \n\n1 → Enter new crop..."	(None)	Final data moved from tempData to crops collection. State is deleted from whatsapp_conversations.
Part 4: Error Handling
Invalid Input: If a user is on AWAITING_PIN and replies with letters, the bot should say: "That was an invalid PIN. Please try again with your 6-digit PIN." and keep the state at AWAITING_PIN.
Menu Jump: If a user sends a message like "Paddy" while the state is AWAITING_PRICE, the bot should politely remind them: "Please provide the unit price first before moving to the next question."
Exit: If a user replies with 9 at the main menu, the bot should send a farewell message and delete their record from whatsapp_conversations.