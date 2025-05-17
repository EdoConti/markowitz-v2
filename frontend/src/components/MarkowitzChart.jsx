import React, {useMemo} from 'react'
import useGetOptimizedPortfolio from '../hooks/getOptimizedPortfolio';
import Loader from './Loader';
import ErrorBanner from './ErrorBanner';

const MarkowitzChart = ({chartsRef, assetInfo}) => {

    const {
        getOptimizedPortfolio,
        optimalPortfolio,
        portfolioLoading,
        portfolioError
    } = useGetOptimizedPortfolio();

    const tickers_ls = useMemo(() => Object.keys(assetInfo), [assetInfo]);

    const handleOptimization = () => {
        if (tickers_ls && tickers_ls.length > 0) {
            // Define the parameters before using them in the function call
            const weights = []
            const riskFree = 0.03;
            const targetReturn = 0.07;
            const shorting = true;
            const optType = "port_risk";
            
            getOptimizedPortfolio(tickers_ls, weights, riskFree, targetReturn, shorting, optType);
        }
    };
    

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
        <div className="bg-white p-6 shadow-md rounded-lg" ref={chartsRef} id='charts'>
            <h2 className="text-xl font-semibold mb-4">Efficient Frontier</h2>
            <div className="flex justify-center flex-col space-y-5">
                <div className='flex justify-center'>
                    <button className='bg-blue-600 text-white font-semibold hover:opacity-75 rounded-lg p-3' onClick={handleOptimization}>Efficient Portfolio</button>
                </div>
                <div className="w-3/4 bg-gray-200 p-8 rounded flex justify-center">
                    <p className="text-gray-600 text-center">Efficient Frontier Chart Will Appear Here</p>
                    <div>{optimalPortfolio.data}</div>

                </div>
            </div>
        </div>
    );
};

export default MarkowitzChart;
