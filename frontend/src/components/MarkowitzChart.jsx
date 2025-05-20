import React, {useMemo} from 'react'
import useGetOptimizedPortfolio from '../hooks/getOptimizedPortfolio';
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';

const MarkowitzChart = ({optimalPortfolio, portfolioError, portfolioLoading}) => {

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
                    <div className='w-full'><strong>Optimal Return:</strong> {optimalPortfolio.optimalReturn}%</div>
                    <div>
                        <strong>Optimal Weights:</strong>
                        <p>
                            {optimalPortfolio.optimalWeights.map((w, i) => (
                            <li key={i}>{w}%</li>
                            ))}
                        </p>
                    </div>
                    <div><strong>Optimal Risk:</strong> {optimalPortfolio.optimalRisk}%</div>
                    <div><strong>Optimal Sharpe:</strong> {optimalPortfolio.optimalSharpe}</div>
                </div>
            </div>
        </div>
    );
};

export default MarkowitzChart;
