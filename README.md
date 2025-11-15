# 🌾 Uthra

**"Light of Communication between Farmers and Buyers"**

A farmer–buyer connecting platform that combines voice (IVR), SMS, and web technology to directly link farmers and buyers — ensuring transparency, fair pricing, and real-time access to crop demand.

---

## 🗄️ Database Architecture

**Separate Role-Based Collections** ✅

The platform uses MongoDB with **separate collections** for each user type:

- **`baseusers`** - Authentication & common data (mobile, name, email, role, pin/password, location)
- **`farmers`** - Farmer-specific data (farmSize, farmingType, crops, bankDetails)  
- **`buyers`** - Buyer-specific data (buyerType, businessName, companyName, numberOfEmployees)
- **`admins`** - Admin-specific data (adminLevel, permissions)

**Benefits:**
- ✅ Clean data separation by role
- ✅ No embedded documents or null fields
- ✅ Efficient queries (fetch only needed data)
- ✅ Easy to extend role-specific features

---

## 🌟 Overview

Uthra empowers even the simplest mobile user to participate in the digital economy. The platform features conversational intelligence powered by NLP models that understand spoken crop names and messages, with ML logic that learns from interactions to improve recognition, crop classification, and buyer–farmer matchmaking.
______________________________________________________________________________________________

🧩 System Roles
👨‍💼 Admin

Has full control of the system.

Manages user data, crops, transactions, and reports.

Monitors call logs, request statuses, and analytics dashboards.

🚜 Farmer

Registers once via web dashboard using a unique mobile number and sets a PIN.

From the next time onward, can access the system by calling the Uthra number (or toll-free).

Interacts through an IVR system — by pressing keypad options or speaking crop details.

Can:

Register new crops

Manage existing crop listings

View buyer requests and respond

Speak directly to a human agent when needed

🧺 Buyer

Browses or searches available crops through the web dashboard or mobile interface.

Can request a specific quantity, offer a price, and track confirmation.

Receives SMS updates about acceptance, rejection, or counteroffers from the farmer.

💝 Donator (Coming Soon)

Support the platform's growth and development through donations.

Features (Planned):
- Donation dashboard with transaction history
- Multiple payment options (UPI, Net Banking, Cards)
- Tax receipt generation for eligible donations
- Recognition badge on profile
- Platform development updates and progress reports

Benefits:
- Contribute to agricultural technology advancement
- Support farmers' digital transformation
- Receive regular updates on platform impact
- Tax deductions as per applicable laws
- Community recognition for contributions

Status: Backend implementation planned for future release.
______________________________________________________________________________________________

🔁 IVR User Flow (Voice Interaction)
1️⃣ Farmer Login

Farmer calls the Uthra number.

System asks to enter mobile number.

If valid → asks for PIN.

If authenticated → greets by name, e.g.,
“Vanakkam, Mr. Rajendran! Welcome to Uthra.”

Main menu:

Press 1 → Enter new crop

Press 2 → Manage crop details

Press 3 → View requests received

Press 4 → Talk to agent

Press 9 → Return to Home

2️⃣ Entering a New Crop

System: “Please tell your crop name.”

The NLP model detects the spoken crop (e.g., “Tomato”, “Paddy”).

System confirms: “You said Tomato. Press 1 to confirm, 2 to retry.”

Then asks:

“Enter available quantity in kilograms or tons.”

“Enter the price per kilogram.”

“Enter expected delivery date range.”

Data is stored in the central database and visible to buyers.

SMS confirmation is sent to the farmer.

3️⃣ Manage Crop Details

Farmer selects from listed crops.

Options:

1 → Modify details (quantity, price, date)

2 → Remove crop

9 → Return to home

4️⃣ See Requests Received

Lists buyer requests (1, 2, 3…)

On selection:

System narrates:
“A buyer from Coimbatore is requesting 500 kg of Tomato at ₹25 per kg.”

Options:

Press 1 → Accept

Press 2 → Reject

Press 3 → Demand higher price

If farmer demands higher price → enters new price.

Buyer gets instant SMS with update.

5️⃣ Automated Call Handling

If farmer doesn’t attend:

Retry after 2 hours,

Then twice the next day.

After 5 missed attempts → mark status as Pending.
______________________________________________________________________________________________

💬 SMS Chat System

Farmers and buyers can exchange short messages via SMS.

Every message passes through an NLP text classifier that:

Detects intent (request, inquiry, confirmation).

Extracts entities (crop, price, quantity).

Automatically updates system records accordingly.

SMS format examples:

BUYER: Need 100kg tomato @25/kg

FARMER: Ok accept → Marks order accepted

FARMER: Need 30/kg → Sends counteroffer
______________________________________________________________________________________________

🧠 ML & NLP Integration
1. NLP Crop Recognition Model

Recognizes spoken crop names during IVR.

Based on speech-to-text + NER (Named Entity Recognition).

Trained with dataset of Indian crop names, including multilingual variants (Tamil, Hindi, English).

Tech stack:

Google Speech-to-Text API or Vosk (offline ASR)

spaCy / HuggingFace Transformers (for crop name extraction)

2. SMS Intent Classifier

Detects action in text (e.g., “accept,” “reject,” “increase price”).

Model: Lightweight fine-tuned DistilBERT / Logistic Regression classifier.

3. Crop Recommendation (Optional Future ML)

Learns which crops sell faster based on region, season, and pricing.

Suggests ideal crops to farmers when they log in next.
______________________________________________________________________________________________

🏗️ Architecture Overview
          ┌───────────────────────┐
          │       Farmer          │
          │ (IVR / SMS / Web)     │
          └──────────┬────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │        Uthra Server         │
        │ (Node.js / Python Backend)  │
        └──────────┬──────────────────┘
                   │
   ┌───────────────┼──────────────────────────┐
   │               │                          │
   ▼               ▼                          ▼
IVR Gateway   SMS Gateway (Twilio/n8n)   Web Dashboard (React)
   │               │                          │
   ▼               ▼                          ▼
  NLP Engine       ML Classifier         MongoDB / PostgreSQL
(Speech/Text)     (Intent/Crop)          (User, Crop, Orders)
______________________________________________________________________________________________

⚙️ Tech Stack
Layer	Technology
Frontend	React.js (Web Dashboard)
Backend	Python (FastAPI / Flask) or Node.js (Express)
Database	MongoDB / PostgreSQL
Voice IVR	Twilio / Exotel / Asterisk integrated with n8n automation
SMS Gateway	Twilio or Gupshup
ML/NLP	Python, spaCy, Transformers, Scikit-learn
Automation	n8n for flow-based call handling and notifications
Deployment	Render / AWS / Vercel
Auth	JWT (for web) + Phone-based PIN (for IVR)
______________________________________________________________________________________________

🌐 Database Structure

Collections / Tables

Farmer → ID, name, mobile, pin, location, crops[]

Crop → ID, name, qty, price, validity, farmer_id

Buyer → ID, name, contact, requests[]

Requests → buyer_id, crop_id, qty, price, status

Call Logs → farmer_id, request_id, attempts, status
______________________________________________________________________________________________

---

## 🚀 Quick Start

### Prerequisites
- **MongoDB** running on `localhost:27017`
- **Node.js** (v14 or higher)
- **npm** package manager

### Start Backend
```powershell
node server.js
```
**Backend:** `http://localhost:5000`

### Start Frontend
```powershell
cd frontend
npm install  # First time only
npm start
```
**Frontend:** `http://localhost:3000`

---

## 🔐 Test Credentials

| Role   | Mobile      | Password |
|--------|-------------|----------|
| Admin  | 9876543210  | 123456   |
| Farmer | 9876543211  | 123456   |
| Buyer  | 9876543212  | 123456   |

---

## 📁 Project Structure

```
Uthra/
├── Backend/           # API controllers, routes, middleware
├── Database/          # Mongoose schemas
├── frontend/          # React + TypeScript application
├── server.js          # Backend entry point
├── .env               # Environment variables
├── README.md          # This file
└── HOW_TO_RUN.md     # Detailed instructions
```

---

## 📚 Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)** - Detailed setup and running instructions
- **[COMPLETION_SUMMARY.md](COMPLETION_SUMMARY.md)** - Full project implementation details

---

## ⚙️ Tech Stack

**Frontend:** React 18, TypeScript, Redux Toolkit, React Router v6  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication:** JWT + Role-based access control  
**Features:** IVR integration ready, SMS gateway ready, NLP/ML integration ready

---

## 💡 Future Enhancements

- Regional language voice support (Tamil, Hindi, Telugu)
- Smart pricing recommendation based on market trends
- Crop demand prediction using seasonal ML models
- Chatbot integration for WhatsApp
- Blockchain-based traceability for verified produce

---

**🌾 Uthra - Connecting Farmers and Buyers** ✨