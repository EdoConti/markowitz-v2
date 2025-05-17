from datetime import datetime
import yfinance as yf
import numpy as np
import pandas as pd

class Security:
    def __init__(self, ticker):
        self.ticker = yf.Ticker(ticker)
        self.long_name = self.get_longName()
        self.returns_data = self.get_5y_returns()
        self.close_date = self.returns_data.index.date if not self.returns_data.empty else []
        self.daily_returns = self.get_Log_returns()
        self.fetched_on = datetime.now()

    # Method to fetch the long name of the company
    def get_longName(self):
        return self.ticker.info.get("longName") or self.ticker.info.get("shortName", "N/A")

    def get_5y_returns(self):
        # Attempt to download data
        data = yf.download(self.ticker.ticker, period="5y")
        
        # Check if data was fetched successfully
        if data.empty or "Adj Close" not in data.columns:
            print(f"No data found for ticker {self.ticker.ticker}. It may be delisted or unavailable.")
            return pd.Series(dtype=float)  # Return empty Series if no data is found

        # Return the adjusted close prices
        return data["Adj Close"]
    
    def get_Log_returns(self):
        # Check if returns_data is not empty before calculating log returns
        if self.returns_data.empty:
            print(f"No returns data available for {self.ticker.ticker}")
            return pd.Series(dtype=float)
        
        # Calculate log returns using the Pandas shift method
        log_returns = np.log(self.returns_data / self.returns_data.shift(1))
        return log_returns
