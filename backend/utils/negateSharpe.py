import numpy as np
from backend.utils.portfolioRisk import _portfolio_risk

def _negate_sharpe(w, exp_ret, cov_m, r_free):
        portfolio_ret = np.dot(w, exp_ret)
        portfolio_std_dev = np.sqrt(_portfolio_risk(w, cov_m))
        sharpe_ratio = (portfolio_ret - r_free) / portfolio_std_dev
        return -sharpe_ratio