import React from 'react'
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';
import Chart from './Chart';

const MarkowitzChart = ({optimalPortfolio, portfolioError, portfolioLoading, tickers_ls, riskFree}) => {

    if (portfolioError) {
        return (
            <div className="flex justify-center items-center my-8">
                <ErrorBanner all_error={portfolioError} />
            </div>
        );
    }

    if (portfolioLoading) {
        return <Loader />;
    }
    
    return (
        <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Efficient Frontier</h2>
            <div className="flex justify-center flex-col space-y-5">
                <div className="bg-gray-200 p-8 rounded items-center">
                    <div className=''><strong>Optimal Return:</strong> {optimalPortfolio.optimalReturn}%</div>
                    <div>
                        <strong>Optimal Weights:</strong>
                        <p>
                            {optimalPortfolio.optimalWeights && (
                                <ul>
                                    {optimalPortfolio.optimalWeights && Object.entries(optimalPortfolio.optimalWeights).map(([ticker, w]) => (
                                        <li key={ticker}>
                                        {ticker} — {w}%
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </p>
                    </div>
                    <div className=''><strong>Optimal Risk:</strong> {optimalPortfolio.optimalRisk}%</div>
                    <div className=''><strong>Optimal Sharpe:</strong> {optimalPortfolio.optimalSharpe}</div>
                </div>
                <div>
                    {optimalPortfolio.efficientFrontier && <Chart riskFree={optimalPortfolio.riskFree_c} efficientFrontier={optimalPortfolio.efficientFrontier}/>}
                </div>
            </div>
        </div>
    );
};

export default MarkowitzChart;
