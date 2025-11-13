from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import sys

# MongoDB connection configuration
MONGODB_URI = "mongodb://naresh:123456789@localhost:27017/"
DATABASE_NAME = "Uthra"

# Alternative URI format for MongoDB Atlas (cloud):
# MONGODB_URI = "mongodb+srv://naresh:123456789@cluster.mongodb.net/?retryWrites=true&w=majority"

class Database:
    def __init__(self):
        self.client = None
        self.db = None
    
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(MONGODB_URI)
            # Test the connection
            self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            print(f"✅ MongoDB Connected Successfully to database: {DATABASE_NAME}")
            print(f"📍 Server Info: {self.client.server_info()['version']}")
            return self.db
        except ConnectionFailure as e:
            print(f"❌ MongoDB Connection Error: {e}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            sys.exit(1)
    
    def get_database(self):
        """Return the database instance"""
        if self.db is None:
            self.connect()
        return self.db
    
    def close(self):
        """Close the MongoDB connection"""
        if self.client:
            self.client.close()
            print("🛑 MongoDB connection closed")

# Create a singleton instance
db_instance = Database()

def get_db():
    """Helper function to get database connection"""
    return db_instance.get_database()

# Usage example
if __name__ == "__main__":
    # Test the connection
    db = get_db()
    print(f"📊 Available collections: {db.list_collection_names()}")
    db_instance.close()
