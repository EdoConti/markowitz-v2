import React, { useRef, useState, useMemo } from 'react';
import Weights from './Weights';
import useGetOptimizedPortfolio from '../hooks/getOptimizedPortfolio';
import MarkowitzChart from './MarkowitzChart';

const ConstraintsComponent = ({assetInfo}) => {
    // State to manage risk-free rate options and constraints
    const [weights, setWeights] = useState({});
    const [riskFreeType, setRiskFreeType] = useState('USD');
    const [riskFree, setRiskFree] = useState(0);
    const [liquidityFactor,setLiquidityFactor] = useState(50);
    const {
        getOptimizedPortfolio,
        optimalPortfolio,
        portfolioLoading,
        portfolioError,
    } = useGetOptimizedPortfolio();

    const tickers_ls = useMemo(() => Object.keys(assetInfo), [assetInfo]);
    
    const handleOptimization = () => {
        if (tickers_ls && tickers_ls.length > 1) {
            // Define the parameters before using them in the function call
            getOptimizedPortfolio(tickers_ls, weights, riskFree, liquidityFactor);
        }
    };

    // Function to handle risk-free rate selection
    const handleRiskFreeTypeChange = (e) => {
        setRiskFreeType(e.target.value);
        setRiskFree(0);
    };

    // Function to handle incremental change
    const handleIncrement = (amount) => {
        if (liquidityFactor >= 100) return;
            setLiquidityFactor(prev => Math.min(prev+amount,100));
    };

    // Function to handle decremental change
    const handleDecrement = (amount) => {
        if (liquidityFactor <= 0) return;
            setLiquidityFactor(prev => Math.max(prev-amount,0));
    };

    return (
        <div className="p-6 bg-slate-600 rounded-lg shadow-md mb-8 flex flex-col space-y-5" id='constraints'>
            <div className='flex my-5 mx-5 justify-between'>
                <div className='px-5 bg-slate-800 p-2 rounded align-middle'>
                    <h2 className="text-2xl font-bold mb-4 text-white">Set Constraints for Optimization</h2>
                    {/* Risk-Free Rate Selection */}
                    <div className="mb-6">
                        <h3 className="flex text-lg font-bold mb-2 text-white space-x-2"><p>Select Your Preferred</p><p className='text-blue-500'>Risk-Free Rate</p></h3>
                        <div className="flex flex-col space-y-2">
                            {/* T-Bill option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeType"
                                    value="USD"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeType === 'USD'}
                                    onChange={handleRiskFreeTypeChange}
                                />
                                <span className="ml-2 text-white">US10Y (4.014%)</span>
                            </label>

                            {/* Europe Risk-Free option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeType"
                                    value="STR"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeType === "STR"}
                                    onChange={handleRiskFreeTypeChange}
                                />
                                <span className="ml-2 text-white">€STR (3.413%)</span>
                            </label>

                            {/* Custom Rate option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeType"
                                    value="custom"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeType === 'custom'}
                                    onChange={handleRiskFreeTypeChange}
                                />
                                <span className="ml-2 text-white">Custom Rate:</span>
                                <input
                                    type="number"
                                    placeholder="Enter custom rate"
                                    className={`ml-4 p-2 border border-gray-300 rounded ${riskFreeType === 'custom' ? '' : 'opacity-50'}`}
                                    value={riskFree}
                                    onChange={(e) => setRiskFree(e.target.value)}
                                    disabled={riskFreeType !== 'custom'}
                                />
                            </label>
                        </div>
                    </div>

                    {/*Illiquidity Factor*/}
                    <div className='mb-6 bg-slate-800 p-2 rounded align-middle space-y-4'>
                        <h3 className="text-lg font-semibold text-white">Liquidity Factor: (% of portfolio)</h3>
                        <div className='flex items-center space-x-1'>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor>=10 ? 'hover:bg-red-400':''}`}
                            disabled={liquidityFactor < 10}
                            onClick = {() => handleDecrement(10)}
                            >
                            -10
                            </button>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor>=5 ? 'hover:bg-red-400':''}`}
                            disabled={liquidityFactor < 5}
                            onClick = {() => handleDecrement(5)}
                            >
                            -5
                            </button>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor>0 ? 'hover:bg-red-400':''}`}
                            disabled={liquidityFactor <= 0}
                            onClick = {() => handleDecrement(1)}
                            >
                            -1
                            </button>
                            <span className='px-10 py-1 text-white font-medium'>{liquidityFactor}%</span>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor<100 ? 'hover:bg-green-400':''}`}
                            disabled={liquidityFactor >= 100}
                            onClick={() => handleIncrement(1)}
                            >
                            +1
                            </button>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor<=95 ? 'hover:bg-green-400':''}`}
                            disabled={liquidityFactor > 95}
                            onClick={() => handleIncrement(5)}
                            >
                            +5
                            </button>
                            <button
                            className={`px-2 py-1 rounded bg-gray-700 ${liquidityFactor<=90 ? 'hover:bg-green-400':''}`}
                            disabled={liquidityFactor > 90}
                            onClick={() => handleIncrement(10)}
                            >
                            +10
                            </button>
                        </div>
                    </div>

                    {/* Other Constraints */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">Additional Constraints</h3>
                        <div className="flex flex-col space-y-2">
                        {/* Short Selling Option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="shortSell"
                                    className="form-checkbox h-4 w-4 text-indigo-600 opacity-75 cursor-not-allowed"
                                    disabled={true}
                                />
                                <span className="ml-2 flex items-center space-x-2 text-gray-100 opacity-75"><p>Allow Shortselling</p></span>
                            </label>

                            {/* Transaction Costs Option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="transactionCosts"
                                    className="form-checkbox h-4 w-4 text-indigo-600 opacity-75 cursor-not-allowed"
                                    disabled={true}
                                    
                                />
                                <span className="ml-2 flex items-center space-x-2 text-gray-100 opacity-75"><p>Include Transaction Costs</p></span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                </div>
                <Weights assetInfo={assetInfo} weights={weights} setWeights={setWeights}/>
            </div>

            {tickers_ls.length >= 2 && (
                <button 
                className='text-white px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700'>
                    Apply Constraints and Get Optimal Portfolio
                </button>
            )}

            {optimalPortfolio.length == 0 && (
                <MarkowitzChart optimalPortfolio={optimalPortfolio} portfolioError={portfolioError} portfolioLoading={portfolioLoading}/>
            )}
        </div>
    );
};

export default ConstraintsComponent;
