import numpy as np

def _portfolio_risk(w, cov_m):
    return np.sqrt(np.dot(w.T, np.dot(cov_m, w)))