import numpy as np
import pandas as pd
from scipy.optimize import minimize
from backend.utils.negateSharpe import _negate_sharpe
from backend.utils.portfolioRisk import _portfolio_risk
from backend.utils.getSecurityInfo import _get_security_info

def _get_optimal_portfolio(returns, asset_bounds, target_return, risk_free, w=[], opt_type="port_risk"):
    try:
        # Validate returns data
        if not returns:
            return {"error": "Return object is not populated!"}, 400
        
        # Set default weights if not provided
        if not w:
            w = np.random.random(len(returns.keys()))
            # Normalize weights so their sum equals 1
            w = w / np.sum(w)
        
        # Align data length across all assets
        min_l = min(len(returns[ticker]) for ticker in returns.keys())
        returns_adj = {ticker: returns[ticker][:min_l] for ticker in returns.keys()}

        # Calculate log returns
        try:
            returns_df = pd.DataFrame(returns_adj)
            log_returns_df = returns_df

            if log_returns_df.empty:
                return {"error": "Log returns are empty after dropna()."}, 400
            
        except Exception as e:
            raise e

        # Calculate average log returns and covariance matrix
        avg_log_returns = log_returns_df.mean()
        covariance_matrix = log_returns_df.cov()

        # Define constraints: weights must sum to 1, return constraint
        constraints = [
            {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Sum of weights is 1
            {'type': 'ineq', 'fun': lambda x: np.dot(x, avg_log_returns) - target_return}  # Expected return meets target
        ]
        
        # Define bounds for asset weights
        bounds = tuple(asset_bounds)

        # Select optimization type
        if opt_type == "neg_sharpe":
            result = minimize(
                _negate_sharpe, 
                w, 
                args=(avg_log_returns, covariance_matrix, risk_free), 
                method="SLSQP", 
                constraints=constraints, 
                bounds=bounds
            )
        elif opt_type == "port_risk":
            result = minimize(
                _portfolio_risk, 
                w, 
                args=(covariance_matrix,), 
                method="SLSQP", 
                constraints=constraints, 
                bounds=bounds
            )
        
        """# Check for successful optimization
        if not result.success:
            return {"error": "Optimization did not converge."}, 500"""
        
        # Calculate optimal portfolio values
        optimal_weights = result.x
        optimal_return = np.dot(optimal_weights, avg_log_returns) * 252  # Annualize the log return
        optimal_risk = _portfolio_risk(optimal_weights, covariance_matrix) * np.sqrt(252)  # Annualize the risk
        optimal_sharpe = (optimal_return - risk_free) / optimal_risk if optimal_risk != 0 else None
        
        # Return results in a structured JSON-friendly format
        return {
            "optimal_weights": optimal_weights.tolist(),
            "optimal_return": optimal_return,
            "optimal_risk": optimal_risk,
            "optimal_sharpe": optimal_sharpe
        }, 200

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        return {"error": f"An error occurred: {error_details}"}, 500
