import logging
from backend.db_config import db
from backend.models.SecurityModel import Security

def _fetch_and_store_security(ticker):
    """
    Fetch and store security data for a given ticker.
    """
    try:
        logging.info("Checking if security already exists in the database for ticker: %s", ticker)
        
        # Check if the security already exists in the database
        existing = db.securities.find_one({"ticker": ticker})
        if existing:
            logging.warning("Security already exists in the database.")
            return {"error": "Security is already in the DB."}, 400

        # Create a Security instance and fetch the data
        logging.info("Creating Security instance for ticker: %s", ticker)
        security = Security(ticker)

        # Prepare data for MongoDB, ensuring JSON compatibility
        security_data = {
            "ticker": ticker,
            "long_name": security.long_name,
            "close_date": [date.strftime("%Y-%m-%d") for date in security.close_date[1:]],  # Convert dates to strings
            "daily_return": security.daily_returns.tolist()[1:],  # Convert numpy array to list
            "fetched_on": security.fetched_on.strftime("%Y-%m-%d %H:%M:%S")
        }

        # Insert data into MongoDB
        logging.info("Inserting security data into MongoDB for ticker: %s", ticker)
        result = db.securities.insert_one(security_data)
        security_data["_id"] = str(result.inserted_id)

        logging.info("Security data recorded successfully for ticker: %s", ticker)
        return {"message": "Security data recorded successfully!", "security_data": security_data}, 201

    except Exception as e:
        logging.error("An error occurred: %s", str(e))
        return {"error": str(e)}, 500
    

