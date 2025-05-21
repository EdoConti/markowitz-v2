import numpy as np
import pandas as pd
import yfinance as yf
import requests as req
from bs4 import BeautifulSoup
from functools import lru_cache
from scipy.optimize import minimize
from utils.portfolioRisk import _portfolio_risk
from utils.getSecurityInfo import _get_security_info
from utils.getEfficientFrontier import _compute_efficient_frontier

@lru_cache
def euribor_rate():
    res = req.get('https://www.euribor-rates.eu/en/current-euribor-rates/')
    if res.status_code == 200:
        soup = BeautifulSoup(res.text, 'html.parser')
    for tr in soup.find_all("tr"):
        th = tr.find("th")
        if th and th.find("a", href='/en/current-euribor-rates/4/euribor-rate-12-months/'):
            euribor = np.float64(tr.find('td').text.replace(' %',''))
    return np.float64(euribor/100)

def _get_optimal_portfolio(tickers, weights, risk_free, risk_free_type, liquidity_factor=None):

    if not tickers or len(tickers)<2:
        return {"error": "Insufficient number of tickers"}, 400
    risk_free = np.float64(risk_free)/100

    if risk_free_type == '^TNX':
        risk_free = np.float64(yf.Ticker(f'{risk_free_type}').history(period='1d')['Close'].values[0]/100)
    elif risk_free_type == 'STR':
        risk_free = euribor_rate()
    
    assert len(tickers) == len(weights)

    portfolio = {ticker:_get_security_info(ticker)[0]['daily_returns'] for ticker in tickers}
    min_l = min(len(portfolio[ticker]) for ticker in portfolio.keys())
    adj_portfolio = {ticker: portfolio[ticker][:min_l] for ticker in portfolio.keys()}
    #log_portfolio = {key:np.log1p(np.array(val)) for key,val in portfolio_adj.items()}

    adj_portfolio_returns_df = pd.DataFrame(adj_portfolio)
    avg_adj_returns = adj_portfolio_returns_df.mean()
    covariance_matrix = adj_portfolio_returns_df.cov()

    weights = np.array([w for w in weights.values()])

    if (weights == 0).all():
        weights = np.random.random(len(portfolio.keys()))
        weights = weights / np.sum(weights)
    
    constraints = [
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Sum of weights is 1
    ]
    n = len(weights) 
    bounds = ((0.0, 1.0) ,)*n
    result = minimize(
                _portfolio_risk, 
                weights, 
                args=(covariance_matrix,), 
                method="SLSQP", 
                constraints=constraints, 
                bounds=bounds,
                options={"ftol":1e-9, "disp": False, "maxiter": 1000}
            )
        
    # Calculate optimal portfolio values
    optimal_weights = result.x
    optimal_return = (1+np.dot(optimal_weights, avg_adj_returns))**252 - 1  # Annualize the return
    optimal_risk = _portfolio_risk(optimal_weights, covariance_matrix)*np.sqrt(252)  # Annualize the risk
    optimal_sharpe = (optimal_return - risk_free) / optimal_risk if optimal_risk != 0 else None

    min_var_port = {
        'Optimal Weights':optimal_weights,
        'Return':(optimal_return+1)**(1/252)-1,
        'Risk':optimal_risk/np.sqrt(252)
    }

    efficient_frontier = _compute_efficient_frontier(tickers,avg_adj_returns,covariance_matrix,min_var_port,num_points=500, bounds=bounds)
        
    # Return results in a structured JSON-friendly format
    return {
        'riskFree':np.float64(risk_free),
        "optimal_weights": {f'{tickers[idx]}':round(w*100,2) for idx,w in enumerate(optimal_weights.tolist())},
        "optimal_return": round(optimal_return*100,2),
        "optimal_risk": round(optimal_risk*100,2),
        "optimal_sharpe": round(optimal_sharpe,2),
        "efficient_frontier": efficient_frontier
    }, 200