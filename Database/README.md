# Uthra Database Connection

## Configuration

**Database Name:** Uthra  
**Username:** naresh  
**Password:** 123456789  
**Host:** localhost (default)  
**Port:** 27017 (default)

## Files

- `connection.js` - MongoDB connection for Node.js projects
- `connection.py` - MongoDB connection for Python projects
- `.env.example` - Environment variables template

## Usage

### For Node.js (JavaScript)

```javascript
const connectDB = require('./database/connection');

// Connect to database
connectDB();

// Use in your app
const mongoose = require('mongoose');
// Your models and queries here
```

### For Python

```python
from database.connection import get_db

# Get database connection
db = get_db()

# Access collections
farmers = db.farmers
crops = db.crops
buyers = db.buyers
```

## Installation Requirements

### Node.js
```bash
npm install mongoose
```

### Python
```bash
pip install pymongo
```

## Security Note

⚠️ **Important:** Never commit sensitive credentials to version control. Use environment variables in production.

1. Copy `.env.example` to `.env`
2. Update with your actual credentials
3. Add `.env` to your `.gitignore` file
