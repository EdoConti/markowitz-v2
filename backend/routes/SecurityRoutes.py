from flask import Blueprint, jsonify, request
from utils.fetchAndStore import _fetch_and_store_security
from utils.getSecurityInfo import _get_security_info
from utils.getOptimalPortfolio import _get_optimal_portfolio
import numpy as np
from pathlib import Path
import json
from db_config import db
from pymongo import ASCENDING
import pandas as pd

db.securities.create_index([("ticker", ASCENDING)], unique=True)
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
        
        min_l = min(len(sec_ret[ticker]) for ticker in sec_ret.keys())
        adj_sec_ret = {ticker: sec_ret[ticker][:min_l] for ticker in sec_ret.keys()}

        # Create a DataFrame from the dictionary, aligning by dates and filling missing data with NaN
        to_covary = pd.DataFrame(adj_sec_ret).fillna(value=np.nan)


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


def _normalize_securities_json(data):
    """
    Accepts either:
      - { "tickers": [ {ticker,label,proxy_category}, ... ] }
      - [ {ticker,label,proxy_category}, ... ]
      - { "SPY": {"label":"liquid","proxy_category":null}, ... }  (mapping form)
      - [ "SPY", "QQQ", ... ]  (list of strings)
    Returns: list of dicts with keys: ticker, label, proxy_category
    """
    items = []

    if isinstance(data, dict):
        if "tickers" in data and isinstance(data["tickers"], list):
            src = data["tickers"]
        else:
            # mapping form
            src = []
            for k, v in data.items():
                if isinstance(v, dict):
                    src.append({"ticker": k, **v})
                else:
                    src.append({"ticker": k, "label": v, "proxy_category": None})
    elif isinstance(data, list):
        src = data
    else:
        return items

    for x in src:
        if isinstance(x, str):
            items.append({"ticker": x.upper(), "label": None, "proxy_category": None})
            continue
        if not isinstance(x, dict):
            continue
        t = (x.get("ticker") or x.get("symbol") or "").upper()
        if not t:
            continue
        items.append({
            "ticker": t,
            "label": x.get("label"),
            "proxy_category": x.get("proxy_category") or x.get("proxy")
        })
    return items

from pathlib import Path

def _find_securities_json(explicit: str | None = None) -> Path:
    here = Path(__file__).resolve()

    # If caller supplied a path (absolute or relative to this file), try it first
    if explicit:
        p = Path(explicit)
        if not p.is_absolute():
            p = (here.parent / p).resolve()
        if p.exists():
            return p
        raise FileNotFoundError(f"Explicit path not found: {p}")

    # Common candidates (ordered)
    candidates = [
        here.parent.parent / "routes" / "securities.json",  # ../routes/securities.json
        here.parent / "securities.json",                    # ./securities.json (same dir as this file)
        here.parent.parent / "models" / "securities.json",  # ../models/securities.json (old location)
        Path.cwd() / "routes" / "securities.json",          # CWD/routes/securities.json
        Path.cwd() / "securities.json",                     # CWD/securities.json
    ]
    for p in candidates:
        p = p.resolve()
        if p.exists():
            return p

    tried = "\n".join(str(c.resolve()) for c in candidates)
    raise FileNotFoundError(f"securities.json not found. Tried:\n{tried}")


@security_bp.route("/securities/bulk-from-file", methods=["GET", "POST"])
def bulk_from_file():
    try:
        dry_run = request.method == "GET" or request.args.get("dry_run", "false").lower() == "true"
        override_path = request.args.get("path")  # e.g., ../routes/securities.json

        json_path = _find_securities_json(override_path)
        with open(json_path, "r", encoding="utf-8") as f:
            raw = json.load(f)

        items = _normalize_securities_json(raw)
        if not items:
            return jsonify({"status": "error", "message": "No valid tickers found"}), 400

        if dry_run:
            return jsonify({
                "status": "ok",
                "message": f"Dry run; using {str(json_path)}",
                "count": len(items),
                "sample": items[:5]
            }), 200

        results = []
        for it in items:
            tkr = it["ticker"]
            label = it.get("label")
            proxy_category = it.get("proxy_category")

            # fetch & store
            try:
                resp, status = _fetch_and_store_security(tkr)
            except Exception as e:
                resp, status = {"error": str(e)}, 500

            # tag metadata
            db.securities.update_one(
                {"ticker": tkr},
                {"$set": {"liquidity_label": label, "proxy_category": proxy_category}},
                upsert=True
            )

            results.append({"ticker": tkr, "status": int(status)})

        # ✅ Always return a response here
        return jsonify({
            "status": "ok",
            "count": len(results),
            "inserted": results
        }), 207  # or 200 if you prefer

    except FileNotFoundError as e:
        return jsonify({"status": "error", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



@security_bp.route("/securities/wipe", methods=["POST"])
def wipe_securities():
    """
    Removes all documents from the securities collection.
    """
    try:
        res = db.securities.delete_many({})
        return jsonify({
            "status": "ok",
            "deleted_count": res.deleted_count
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@security_bp.route("/__ping", methods=["GET"])
def _ping():
    return "ok", 200