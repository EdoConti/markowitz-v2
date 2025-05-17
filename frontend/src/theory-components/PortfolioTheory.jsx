import React from 'react'

const PortfolioTheory = () => {
    return (
        <div className='bg-white rounded-lg border border-slate-950 overflow-y-auto p-2 max-h-64 mt-4'>
            <p className='text-xl font-bold'>Columns Breakdown</p>
            <p>The table above shows summary metrics of the selected securities/assets</p>
            <ul>
                <li>
                    <p>
                        <span className='font-semibold'>1. Ticker</span>: Shows the ticker symbol for each asset (e.g., "AAPL" for Apple Inc., "GLD" for SPDR Gold Shares). The ticker is a shorthand identifier used in financial markets.
                    </p>
                </li>
                <li>
                    <p>
                        <span className='font-semibold'>2. Long Name</span>: Displays the full name of each security, giving users a more detailed description of what each ticker represents (e.g., "Apple Inc." for AAPL).
                    </p>
                </li>
                <li>
                    <p>
                        <span className='font-semibold'>3. Expected Return</span>: Indicates the anticipated annual return for each asset, expressed as a percentage (e.g., 33.20% for AAPL). This helps users gauge the potential profit associated with holding the asset.
                    </p>
                </li>
                <li>
                    <p>
                        <span className='font-semibold'>4. Variance</span>: Shows the variance of the asset's returns, which measures the dispersion of the returns around the expected return (e.g., 9.96% for AAPL). Higher variance indicates higher risk.
                    </p>
                </li>
                <li>
                    <p>
                        <span className='font-semibold'>5. Standard Deviation</span>: Provides the standard deviation of the asset's returns, which is another measure of risk. It represents the average deviation from the expected return (e.g., 31.56% for AAPL). This is often used as a metric to assess the volatility of the asset.
                    </p>
                </li>
            </ul>
        </div>
    )
}

export default PortfolioTheory
