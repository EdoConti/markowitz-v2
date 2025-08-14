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

def _liquid_mask_from_labels(tickers, labels_override):
    """
    Build a mask aligned to `tickers` using labels passed from the client.
    labels_override can be:
      { "AAPL":"liquid", "ARKK":"illiquid_proxy", ... }  OR
      { "AAPL": {liquidity_label:"liquid", ...}, ... }
    """
    def is_liquid(v):
        if isinstance(v, dict):
            lab = (v.get("liquidity_label") or v.get("label") or "").strip().lower()
        else:
            lab = str(v or "").strip().lower()
        return 1.0 if lab == "liquid" else 0.0

    lab_map = {}
    if isinstance(labels_override, dict):
        for k, v in labels_override.items():
            lab_map[str(k).upper()] = is_liquid(v)

    return np.array([lab_map.get(t, 0.0) for t in tickers], dtype=float)

def _project_w_ge_target(w, mask, target):
    """
    Project w to satisfy sum(w)=1 and dot(mask,w) >= target (≥).
    Keeps relative proportions within liquid/non-liquid buckets where possible.
    """
    w = np.asarray(w, dtype=float)
    w = np.clip(w, 0, None)
    w = w / w.sum() if w.sum() > 0 else np.ones_like(w) / len(w)

    m = mask.astype(float)
    cur = float(np.dot(w, m))
    target = float(np.clip(target, 0.0, 1.0))
    nL = int(m.sum())
    nN = len(w) - nL
    if target <= cur or nL == 0:
        return w  # already feasible or no liquid names

    if nN == 0:
        # all assets are liquid: already ≥ target for any target ≤ 1
        return w

    # Increase mass in liquid bucket up to 'target', preserving intra-bucket proportions
    wL = w * m
    wN = w * (1.0 - m)
    sL, sN = wL.sum(), wN.sum()
    if sL == 0 and nL > 0:
        wL[m == 1.0] = 1.0 / nL
        sL = wL.sum()
    if sN == 0 and nN > 0:
        wN[m == 0.0] = 1.0 / nN
        sN = wN.sum()

    need = target - sL
    take = min(need, sN)  # cannot exceed non-liquid mass
    if take > 0:
        # shift proportionally from non-liquid to liquid
        wL = wL + (wL / sL) * take if sL > 0 else wL + (m / m.sum()) * take
        wN = wN - (wN / sN) * take
    w_new = np.clip(wL + wN, 0, None)
    return w_new / w_new.sum()

def _get_optimal_portfolio(tickers, weights, risk_free, risk_free_type,
                           liquidity_factor=None, labels_override=None):

    if not tickers or len(tickers) < 2:
        return {"error": "Insufficient number of tickers"}, 400

    # --- risk-free ---
    risk_free = np.float64(risk_free) / 100.0
    if risk_free_type == '^TNX':
        risk_free = np.float64(yf.Ticker('^TNX').history(period='1d')['Close'].values[0] / 100.0)
    elif risk_free_type == 'STR':
        risk_free = euribor_rate()

    # --- build returns matrix from stored daily returns (aligned) ---
    portfolio = {t: _get_security_info(t)[0]['daily_returns'] for t in tickers}
    min_l = min(len(portfolio[t]) for t in tickers)
    adj = {t: portfolio[t][:min_l] for t in tickers}
    df = pd.DataFrame(adj)
    mu = df.mean()
    Sigma = df.cov()

    # --- initial weights aligned to tickers ---
    w0 = np.array([weights.get(t, 0.0) for t in tickers], dtype=float)
    if (w0 == 0).all():
        w0 = np.random.random(len(tickers))
    w0 = w0 / w0.sum() if w0.sum() > 0 else np.ones(len(tickers)) / len(tickers)

    # --- liquid mask from UI labels ---
    m_liq = _liquid_mask_from_labels(tickers, labels_override or {})
    n_liq = int(m_liq.sum())

    # --- target (percent or fraction) ---
    t_liq = None
    if liquidity_factor is not None:
        t = float(liquidity_factor)
        if t > 1.0:  # treat as %
            t = t / 100.0
        t_liq = float(np.clip(t, 0.0, 1.0))
        if n_liq == 0 and t_liq > 0:
            return {"error": f"Requested liquid share {t_liq:.2%} infeasible: no liquid tickers in selection."}, 400
        # warm start to satisfy ≥ target
        w0 = _project_w_ge_target(w0, m_liq, t_liq)

    # --- constraints & bounds ---
    constraints = [
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1.0},               # sum(w)=1
    ]
    if t_liq is not None:
        # >= target  →  np.dot(m_liq, w) - t_liq  >= 0
        constraints.append({'type': 'ineq',
                            'fun': lambda x, m=m_liq, t=t_liq: float(np.dot(x, m) - t)})

    bounds = ((0.0, 1.0),) * len(tickers)

    # --- solve min-variance subject to constraints ---
    res = minimize(
        _portfolio_risk,
        w0,
        args=(Sigma,),
        method="SLSQP",
        constraints=constraints,
        bounds=bounds,
        options={"ftol": 1e-9, "disp": False, "maxiter": 1000}
    )
    if not res.success:
        return {"error": f"SLSQP failed: {getattr(res,'message','Optimization failed')}"}, 400

    w_star = res.x
    ret_star = (1 + np.dot(w_star, mu)) ** 252 - 1
    risk_star = _portfolio_risk(w_star, Sigma) * np.sqrt(252)
    sharpe_star = (ret_star - risk_free) / risk_star if risk_star != 0 else None

    min_var_port = {
        'Optimal Weights': w_star,
        'Return': (ret_star + 1) ** (1/252) - 1,
        'Risk': risk_star / np.sqrt(252)
    }

    eff_front = _compute_efficient_frontier(
        tickers, mu, Sigma, min_var_port, num_points=500, bounds=bounds
    )

    liq_share = float(np.dot(w_star, m_liq))

    return {
        'riskFree': np.float64(risk_free),
        "optimal_weights": {tickers[i]: round(w * 100, 2) for i, w in enumerate(w_star.tolist())},
        "optimal_return": round(ret_star * 100, 2),
        "optimal_risk": round(risk_star * 100, 2),
        "optimal_sharpe": round(sharpe_star, 2) if sharpe_star is not None else None,
        "efficient_frontier": eff_front,
        "liquid_target_min": None if t_liq is None else round(t_liq * 100, 2),
        "liquid_share_achieved": round(liq_share * 100, 2)
    }, 200