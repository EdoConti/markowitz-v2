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
                <div className="w-3/4 bg-gray-200 p-8 rounded flex justify-center">
                    <div>{optimalPortfolio.data}</div>
                </div>
            </div>
        </div>
    );
};

export default MarkowitzChart;
