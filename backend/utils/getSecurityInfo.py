from db_config import db
import numpy as np

def _get_security_info(ticker):
    try:
        if not ticker:
            return {"error": "Ticker is required as query parameters."}, 400
        
        # Check if the security is already in the database
        security_data = db.securities.find_one({"ticker": ticker})

        if security_data:
            daily_return = np.array(security_data["daily_return"])
            expected_return = daily_return.mean()*250*100
            variance_pct = daily_return.var()*250*100
            std_dev = np.sqrt(daily_return.var()*250)*100
             
            # Security found in the database
            return {
                "ticker": security_data["ticker"],
                "long_name": security_data["long_name"],
                "daily_returns": daily_return.tolist(),
                "expected_return": expected_return,
                "variance_pct": variance_pct,
                "std_dev": std_dev,
                "fetched_on": security_data["fetched_on"],
                "liquidity_label": security_data['liquidity_label'],
                'proxy_category':security_data['proxy_category']
            }, 200            

    except Exception as e:
        # Handle any errors (e.g., invalid ticker, network issues, etc.)
        return {"error": str(e)}, 500