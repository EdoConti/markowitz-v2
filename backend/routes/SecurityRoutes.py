from flask import Blueprint, jsonify, request
from utils.fetchAndStore import _fetch_and_store_security
from utils.getSecurityInfo import _get_security_info
from utils.getOptimalPortfolio import _get_optimal_portfolio
from scipy.optimize import minimize
from models.SecurityModel import Security
import yfinance as yf
import numpy as np
from math import sqrt
from db_config import db
import pandas as pd

security_bp = Blueprint("security_bp", __name__)

# Route to post new securities in the db.
@security_bp.route("/securities", methods=["POST"])
def post_new_security():
    data = request.json
    ticker = data.get("ticker")

    if not ticker:
        return jsonify({"error": "Ticker symbol is required."}), 400

    response, status_code = _fetch_and_store_security(ticker)
    return jsonify(response), status_code


# Route to return securities basic infos.
@security_bp.route("/securities/<ticker>", methods=["GET"])
def get_security_info(ticker):
    response, status_code = _get_security_info(ticker)

    return jsonify(response), status_code

@security_bp.route("/securities/all", methods=["GET"])
def get_all_securities():
    securities_collection = db.securities
    
    try:
        # Fetch all securities from the collection, only include ticker and long_name fields
        securities = list(securities_collection.find({}, {'_id': 0, 'ticker': 1, 'long_name': 1}))
        
        return jsonify({
            "status": "success",
            "data": securities
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
# Route to compute covariance and correlation matrix for a set of tickers.
@security_bp.route("/securities/Covariance&Correlation", methods=["GET"])
def get_covariance_correlation_matrix():
    try:
        # Retrieve tickers from query params
        tickers = request.args.getlist('tickers')  # E.g., /securities/Covariance&Correlation?tickers=AAPL,GOOG,MSFT

        if not tickers:
            return jsonify({"error": "Tickers are required as query parameters."}), 400

        sec_ret = {}

        # Fetch daily returns for each ticker
        for ticker in tickers:
            security_data = db.securities.find_one({"ticker": ticker})

            if not security_data:
                # If the security is not found in the database, fetch and save it
                result = post_new_security(ticker)
                security_data = db.securities.find_one({"ticker": ticker})  # Fetch again after insertion

            if not security_data or 'daily_return' not in security_data:
                return jsonify({"error": f"Data for {ticker} could not be retrieved"}), 404

            # Store daily returns along with their dates (assuming they are stored like this)
            daily_returns = security_data["daily_return"]
            dates = security_data["close_date"]  # Assuming 'dates' field exists

            # Add to the dictionary with the date as the index
            sec_ret[ticker] = pd.Series(data=daily_returns, index=dates)

        # Create a DataFrame from the dictionary, aligning by dates and filling missing data with NaN
        to_covary = pd.DataFrame(sec_ret).fillna(value=np.nan)


        # Check if there are sufficient data points to compute covariance and correlation matrices
        if to_covary.empty or to_covary.shape[1] < 2:
            return jsonify({"error": "Not enough data to compute covariance or correlation matrices."}), 400

        # Calculate covariance and correlation matrices
        covariance_matrix = to_covary.cov()
        correlation_matrix = to_covary.corr()

        # Prepare the response data
        response_data = {
            "tickers": tickers,
            "covariance_matrix": covariance_matrix.to_json(orient="split"),  # Convert to list for JSON serialization
            "correlation_matrix": correlation_matrix.to_json(orient="split")  # Convert to list for JSON serialization
        }

        return jsonify(response_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@security_bp.route("/securities/optimal_portfolio", methods=["POST"])
def get_optimal_portfolio():
    try:
        # Parse JSON payload
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request must contain JSON data"}), 400

        # Extract parameters from the JSON payload
        tickers = data.get('tickers', [])
        weights = data.get('weights', [])
        risk_free = data.get('riskFree', 0.03)  # Default to 0.03 if not provided
        risk_free_type = data.get('riskFree_Type', 0.03)
        liquidity_factor = data.get('liquidityFactor',0.5)

        # Ensure tickers array is populated
        if not tickers:
            return jsonify({"error": "Tickers array is not populated!"}), 400

        # Call the function to calculate the optimal portfolio
        result, status_code = _get_optimal_portfolio(tickers, weights, risk_free, risk_free_type, liquidity_factor)

        return jsonify(result), status_code

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500






@security_bp.route("/securities/simulation", methods=["GET"])
def simulate_portfolios():
    n_portfolios = 50000
    tickers = request.args.getlist('tickers')  # Retrieve tickers as a list
    
    if not tickers:
        return jsonify({"error": "Tickers are required as query parameters."}), 400

    # Fetch and prepare data
    data = {
        ticker: result["daily_return"]
        for ticker in tickers
        if (result := db.securities.find_one({"ticker": ticker})) and "daily_return" in result
    }

    # Create a DataFrame for daily returns
    returns_df = pd.DataFrame(data)
    avg_returns = returns_df.mean().values  # Mean daily returns for each ticker
    cov_m = returns_df.cov().values  # Covariance matrix of daily returns

    # Initialize arrays for simulation results
    sim_weights = np.zeros((n_portfolios, len(tickers)))
    sim_returns = np.zeros(n_portfolios)
    sim_risks = np.zeros(n_portfolios)

    for idx in range(n_portfolios):
        # Generate random weights for each portfolio
        w = np.random.random(len(tickers))
        w /= np.sum(w)  # Normalize to ensure weights sum to 1

        # Store weights, returns, and risks for each simulated portfolio
        sim_weights[idx, :] = w
        sim_returns[idx] = np.dot(w, avg_returns) * 250  # Annualized return
        sim_risks[idx] = np.sqrt(np.dot(w.T, np.dot(cov_m * 250, w)))  # Annualized risk

    # Calculate Sharpe ratios (assumes no risk-free rate)
    sharpe_ratios = sim_returns / sim_risks

    # Prepare response data
    response = {
        "n_portfolios": n_portfolios,
        "sim_weights": sim_weights.tolist(),
        "sim_returns": sim_returns.tolist(),
        "sim_risks": sim_risks.tolist(),
        "sharpe_ratios": sharpe_ratios.tolist()
    }

    return jsonify(response), 200