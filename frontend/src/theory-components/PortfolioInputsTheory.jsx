import React from 'react'

const PortfolioInputsTheory = () => {
    return (
        <div className='bg-white rounded-lg border border-slate-950 overflow-y-auto p-2 max-h-64'>
            <p className=''>
                In this section, users can select up to 10 different securities from a list to include in their investment portfolio. The options available include a variety of asset types such as individual stocks (e.g., Apple Inc.: AAPL, Amazon.com, Inc.: AMZN), exchange-traded funds (ETFs) (e.g., SPDR S&P 500 ETF Trust: SPY, iShares Russell 2000 ETF: IWM), commodities (e.g., SPDR Gold Shares: GLD, Bitcoin USD: BTC-USD), bonds (e.g., iShares 20+ Year Treasury Bond ETF: TLT), and other financial instruments.<br/><br/>The interface provides checkboxes next to each security, allowing users to select their desired assets easily. There is a limit of 10 selections to ensure that the portfolio remains manageable for optimization. Once the user has made their choices, they can click the <span className='font-semibold'>"Confirm Choices"</span> button at the bottom to proceed with the portfolio construction.<br/><br/>Additionally, there is a <span className='font-semibold'>"Post a New Security"</span> button at the top right, which suggests that users may have the ability to request or add new securities to the list if a specific asset they want to include is not available in the current selection.<br/><br/>This input section is designed to facilitate the process of selecting assets for a Markowitz optimization, which aims to find the optimal portfolio allocation that balances risk and return based on the selected securities.<br/><br/>
            </p>
        </div>
    )
}

export default PortfolioInputsTheory
