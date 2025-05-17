import React, { useRef, useState } from 'react';
import Weights from './Weights';

const ConstraintsComponent = ({constraintRef, assetInfo}) => {
    // State to manage risk-free rate options and constraints
    const [riskFreeRate, setRiskFreeRate] = useState('');
    const [customRate, setCustomRate] = useState('');
    const [shortSell, isShortSellActive] = useState(false);
    const [transactionCosts, isTransactionCostsActive] = useState(false);

    // Function to handle risk-free rate selection
    const handleRiskFreeRateChange = (e) => {
        setRiskFreeRate(e.target.value);
    };

    // Function to handle constraints change
    

    return (
        <div ref={constraintRef} className="p-6 bg-slate-600 rounded-lg shadow-md mb-8 flex flex-col space-y-5" id='constraints'>
            <div className='flex mb-5'>
                <div className='border-r-2 px-5 mx-10'>
                    <h2 className="text-2xl font-bold mb-4 text-white">Set Constraints for Optimization</h2>
                    {/* Risk-Free Rate Selection */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-white">Select Your Preferred Risk-Free Rate</h3>
                        <div className="flex flex-col space-y-2">
                            {/* T-Bill option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeRate"
                                    value="T-Bill"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeRate === 'T-Bill'}
                                    onChange={handleRiskFreeRateChange}
                                />
                                <span className="ml-2 text-white">US10Y (4.014%)</span>
                            </label>

                            {/* Europe Risk-Free option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeRate"
                                    value="Europe's Risk-Free"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeRate === "Europe's Risk-Free"}
                                    onChange={handleRiskFreeRateChange}
                                />
                                <span className="ml-2 text-white">€STR (3.413%)</span>
                            </label>

                            {/* Custom Rate option */}
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="riskFreeRate"
                                    value="custom"
                                    className="form-radio h-4 w-4 text-indigo-600"
                                    checked={riskFreeRate === 'custom'}
                                    onChange={handleRiskFreeRateChange}
                                />
                                <span className="ml-2 text-white">Custom Rate:</span>
                                <input
                                    type="number"
                                    placeholder="Enter custom rate"
                                    className={`ml-4 p-2 border border-gray-300 rounded ${riskFreeRate === 'custom' ? '' : 'opacity-50'}`}
                                    value={customRate}
                                    onChange={(e) => setCustomRate(e.target.value)}
                                    disabled={riskFreeRate !== 'custom'}
                                />
                            </label>
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
                                    className="form-checkbox h-4 w-4 text-indigo-600"
                                    checked={shortSell}
                                    onChange={()=>{isShortSellActive(!shortSell)}}
                                />
                                <span className="ml-2 flex items-center space-x-2 text-gray-100"><p>Allow Shortselling</p></span>
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
                <Weights assetInfo={assetInfo} shortSell={shortSell}/>
            </div>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Apply Constraints and Weights
            </button>
        </div>
    );
};

export default ConstraintsComponent;
