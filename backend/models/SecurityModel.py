from datetime import datetime, timezone
from pathlib import Path
import json
import yfinance as yf
import numpy as np
import pandas as pd

_SEC_MAP = None

def _load_securities_map():
    global _SEC_MAP
    if _SEC_MAP is not None:
        return _SEC_MAP

    json_path = Path(__file__).with_name("securities.json")
    sec_map = {}
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if isinstance(data, list):
            for item in data:
                if not isinstance(item, dict):
                    continue
                t = str(item.get("ticker", "")).upper()
                if not t:
                    continue
                sec_map[t] = {
                    "label": item.get("label"),
                    "proxy_category": item.get("proxy_category"),
                }
        elif isinstance(data, dict):
            for t, v in data.items():
                t_up = str(t).upper()
                if isinstance(v, dict):
                    sec_map[t_up] = {
                        "label": v.get("label"),
                        "proxy_category": v.get("proxy_category"),
                    }
                else:
                    sec_map[t_up] = {"label": v, "proxy_category": None}
    except FileNotFoundError:
        sec_map = {}
    except Exception as e:
        print(f"Warning: failed to load securities.json: {e}")
        sec_map = {}

    _SEC_MAP = sec_map
    return _SEC_MAP


class Security:
    def __init__(self, ticker: str):
        self.symbol = ticker.upper()
        self.ticker = yf.Ticker(self.symbol)

        meta = _load_securities_map().get(self.symbol, {})
        self.label = meta.get("label")
        self.proxy = meta.get("proxy_category")

        self.long_name = self.get_longName()

        # Prices (Series)
        self.returns_data = self.get_5y_returns()

        log_ret = self.get_Log_returns()

        # lists ready for Mongo
        self.daily_returns = log_ret.astype('float64')     # list[float]
        self.close_date = pd.to_datetime(log_ret.index).to_pydatetime()  # list[datetime]

        self.fetched_on = datetime.utcnow()  # naive UTC is fine for Mongo


    def get_longName(self):
        try:
            info = self.ticker.info
            return info.get("longName") or info.get("shortName") or self.symbol
        except Exception:
            return self.symbol

    def get_5y_returns(self) -> pd.Series:
        df = yf.download(
            tickers=self.symbol,
            period="5y",
            progress=False,
            auto_adjust=False,
            group_by="column",  # helps avoid MultiIndex
        )
        if df.empty:
            print(f"No data found for ticker {self.symbol}. It may be delisted or unavailable.")
            return pd.Series(dtype=float)

        # Prefer Adj Close; fall back to Close if needed
        if "Adj Close" in df.columns:
            s = df["Adj Close"]
        elif "Close" in df.columns:
            s = df["Close"]
        else:
            print(f"No (Adj) Close column for {self.symbol}")
            return pd.Series(dtype=float)

        # <-- This is the important bit: force Series if it's a 1-col DataFrame
        if isinstance(s, pd.DataFrame):
            s = s.squeeze("columns")

        s = s.astype("float64")
        s.index = pd.to_datetime(s.index, utc=False).tz_localize(None)
        s.name = "adj_close"
        return s


    def get_Log_returns(self) -> pd.Series:
        if self.returns_data is None or len(self.returns_data) == 0:
            print(f"No returns data available for {self.symbol}")
            return pd.Series(dtype=float)

        s = self.returns_data
        # In case something upstream left it as a DataFrame
        if isinstance(s, pd.DataFrame):
            s = s.squeeze("columns")

        lr = np.log(s).diff().dropna()
        lr.index = pd.to_datetime(lr.index, utc=False).tz_localize(None)
        lr.name = "daily_return"
        return lr

    def to_document(self) -> dict:
        """Doc ready for Mongo."""
        return {
            "ticker": self.symbol,
            "long_name": self.long_name,
            "daily_return": self.daily_returns,        # list[float]
            "close_date": self.close_date,             # list[str ISO date]
            "liquidity_label": self.label,
            "proxy_category": self.proxy,
            "fetched_on": self.fetched_on,             # datetime (UTC)
        }
