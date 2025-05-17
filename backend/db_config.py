from os import getenv
import logging
from dotenv import load_dotenv
from pymongo import MongoClient, errors

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)

try:
    # Get the MongoDB URI from the environment variable
    mongo_uri = getenv("MONGODB_URI")
    if not mongo_uri:
        raise ValueError("MONGO_URI is not set in environment variables.")

    # Try to connect to MongoDB
    client = MongoClient(mongo_uri)
    logging.info("Connecting to MongoDB...")

    # Test the connection
    client.admin.command('ping')  # This will raise an error if the connection fails

    # Select the database
    db = client["cluster-markowitz"]
    logging.info("MongoDB connected and listening...")

except errors.ConnectionFailure as e:
    logging.error("Failed to connect to MongoDB: %s", e)
except errors.ConfigurationError as e:
    logging.error("MongoDB configuration error: %s", e)
except ValueError as e:
    logging.error("Environment variable error: %s", e)
except Exception as e:
    logging.error("An unexpected error occurred: %s", e)
