import React from 'react'
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';
import Chart from './Chart';
import PortfolioComposition from './PortfolioComposition';

const MarkowitzChart = ({optimalPortfolio, portfolioError, portfolioLoading, tickers_ls, riskFree}) => {

    if (portfolioError) {
        return (
            <div className="flex justify-center items-center my-8">
                <ErrorBanner all_error={portfolioError} />
            </div>
        );
    };

    if (portfolioLoading) {
        return <Loader />;
    };

    // Utility to download the CSV
    const downloadCSV = () => {
        const efficientFrontier = optimalPortfolio.efficientFrontier;
        
        if (!efficientFrontier?.length) return;

        // 1) Build CSV header and rows
        const keys = Object.keys(efficientFrontier[0]); 
        // e.g. ['w_AAPL','w_GOOG',...,'Risk','Return']
        const header = keys.join(',');
        const rows = efficientFrontier.map(row =>
        keys.map(k => row[k]).join(',')
        );
        const csvContent = [header, ...rows].join('\n');

        // 2) Create a Blob and URL
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);

        // 3) Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href        = url;
        link.setAttribute('download', 'efficient_frontier.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    
    return (
        <div className="bg-white p-6 shadow-md rounded-lg">
            <div className='flex justify-between items-center mb-4'>
                <h2 className="text-xl font-semibold">Efficient Frontier</h2>
                <button
                    onClick={downloadCSV}
                    className='bg-gray-400 px-4 py-2 rounded hover:bg-gray-600'
                >
                    <i className='fa-solid fa-download'></i>
                </button>
            </div>
            <div className="flex justify-center flex-col space-y-5">
                <div className="bg-gray-200 p-8 rounded items-center space-y-10">
                    <div className='flex justify-center space-x-16'>
                        <div className='space-y-2'>
                            <p className='text-2xl font-semibold'>Optimal Return</p>
                            <p className='flex text-xl font-semibold text-white bg-slate-600 px-2 py-4 rounded items-center justify-center'>
                                {optimalPortfolio.optimalReturn}%
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-2xl font-semibold'>Optimal Risk</p>
                            <p className='flex text-xl font-semibold text-white bg-slate-600 px-2 py-4 rounded items-center justify-center'>
                                {optimalPortfolio.optimalRisk}%
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-2xl font-semibold'>Liquidity Target</p>
                            <p className='flex text-xl font-semibold text-white bg-slate-600 px-2 py-4 rounded items-center justify-center'>
                                {optimalPortfolio.liquidityTarget}%
                            </p>
                        </div>
                        <div className='space-y-2'>
                            <p className='text-2xl font-semibold'>Liquidity Achieved</p>
                            <p className='flex text-xl font-semibold text-white bg-slate-600 px-2 py-4 rounded items-center justify-center'>
                                {optimalPortfolio.liquidShare}%
                            </p>
                        </div>
                    </div>
                    <div>
                        {optimalPortfolio.optimalWeights && <PortfolioComposition weights={optimalPortfolio.optimalWeights}/>}
                    </div>
                </div>
                <div>
                    {optimalPortfolio.efficientFrontier && <Chart riskFree={optimalPortfolio.riskFree_c} efficientFrontier={optimalPortfolio.efficientFrontier}/>}
                </div>
            </div>
        </div>
    );
};

export default MarkowitzChart;
