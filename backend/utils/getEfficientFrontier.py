import numpy as np
import pandas as pd
from scipy.optimize import minimize
from utils.portfolioRisk import _portfolio_risk

def _compute_efficient_frontier(tickers, mu, Sigma, min_var_port, num_points=1000, bounds=None):
    n = len(mu)
    if bounds is None:
        bounds = ((0.0, 1.0),) * n

    # 1) Seed with “pure” asset portfolios
    records = []
    for i in range(n):
        w = np.zeros(n)
        w[i] = 1.0
        if np.float64(mu.iloc[i]) >= 0:
            records.append({
                **{f"w_{tickers[j]}": np.float64(w[j]) for j in range(n)},
                "Return": (1+np.float64(mu.iloc[i]))**252-1,
                "Risk":   np.float64(_portfolio_risk(w,Sigma))*np.sqrt(252)
            })
    

    # 2) Global minimum‐variance portfolio (no return target)
    if not min_var_port:
        cons_minvar = [{"type":"eq", "fun": lambda w: w.sum() - 1}]
        w0 = np.ones(n) / n
        res_minvar = minimize(_portfolio_risk, w0, args=(Sigma,), method="SLSQP", bounds=bounds, constraints=cons_minvar)
        if res_minvar.success:
            w_mv = res_minvar.x
            min_var_port = {
                'Optimal Weights':w_mv,
                "Return": np.float64(w_mv @ mu),
                "Risk":   np.float64(_portfolio_risk(w_mv,Sigma))
            }

    w_mv = min_var_port['Optimal Weights'].tolist()
    
    records.append({
        **{f'w_{tickers[j]}':np.float64(min_var_port['Optimal Weights'][j]) for j in range(len(tickers))},
        'Return':(1+min_var_port['Return'])**252-1,
        'Risk':min_var_port['Risk']*np.sqrt(252)
    })

    # 3) Now sweep target returns **between** the min‐var return and max‐mu return
    ret_min = mu.min()
    ret_max = mu.max()
    targets = np.linspace(max(0,ret_min), ret_max, num_points)

    # 4) For each interior target, solve min‐var w/ return constraint
    last_w = w_mv.copy()
    for target in targets:
        cons = [
            {"type":"eq", "fun": lambda w: w.sum() - 1},
            {"type":"eq", "fun": lambda w, mu=mu, t=target: w @ mu - t}
        ]
        res = minimize(_portfolio_risk, last_w, args=(Sigma,), method="SLSQP", bounds=bounds, constraints=cons)
        if not res.success:
            continue
        last_w = res.x
        records.append({
            **{f"w_{tickers[j]}": np.float64(last_w[j]) for j in range(n)},
            "Return": (1+np.float64(last_w @ mu))**252-1,
            "Risk":   np.float64(_portfolio_risk(last_w, Sigma))*np.sqrt(252)
        })

    # Build DataFrame and drop duplicates (same corner might re‐appear)
    df = pd.DataFrame(records).drop_duplicates().reset_index(drop=True)

    return df.to_dict(orient='records')
