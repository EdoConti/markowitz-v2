import React, { useState } from 'react';
import usePostAsset from '../hooks/postAsset';
import PostSecurity from './PostSecurity';
import SecuritiesDropdown from './SecuritiesDropDown';
import useGetAllSecurities from '../hooks/getAllSecurities';
import Loader from './Loader';
// import PortfolioInputsTheory from '../theory-components/PortfolioInputsTheory';
// import PortfolioTheory from '../theory-components/PortfolioTheory';

const PortfolioInputForm = ({ assetInfo, getAssetInfo, setAssetInfo, loading, error, portfolioInputRef, portfolioRef}) => {
    const [ticker, setTicker] = useState('');
    const [isPostAssetVisible, setPostAssetVisibility] = useState(false);
    const { postAsset, assets_error, assets_loading, successMessage } = usePostAsset();
    const { securities, all_loading, all_error } = useGetAllSecurities();
    const [selectedSecurities, setSelectedSecurities] = useState([]);
    const [isShowPIInfo, setShowPIInfo] = useState(false);
    // const [isShowPInfo, setShowPInfo] = useState(false);

    const handlePostSecurity = async (e) => {
        e.preventDefault();
        await postAsset(ticker);
        if (successMessage) { 
            setPostAssetVisibility(false); // Hide the modal after adding
        }
    };


    return (
        <div className="bg-slate-600 p-6 shadow-md rounded-lg mb-8 space-y-2">
            <div className='flex justify-between items-center'>
                <h2 className="text-3xl font-semibold mb-4 text-white flex items-center gap-2" ref={portfolioInputRef} id='portfolioInputs'>Portfolio Inputs {/*<i onClick={()=> {setShowPIInfo(!isShowPIInfo)}} className="fa-solid fa-circle-info hover:opacity-75"></i>*/}</h2>
                <button className='bg-yellow-500 text-white px-4 py-2 rounded hover:opacity-75' onClick={() => {setPostAssetVisibility(true)}}>Post a New Security</button>
                {isPostAssetVisible && <PostSecurity setTicker={setTicker} handlePostSecurity={handlePostSecurity} loading={loading} error={error} successMessage={successMessage} setAssetInfo={setAssetInfo} getAssetInfo={getAssetInfo}/>}
            </div>
            <div>
                {/*{isShowPIInfo && <PortfolioInputsTheory/>}*/}
                <SecuritiesDropdown securities={securities} all_error={all_error} all_loading={all_loading} selectedSecurities={selectedSecurities} setSelectedSecurities={setSelectedSecurities} getAssetInfo={getAssetInfo} setAssetInfo={setAssetInfo}/>
                <table className="w-full">
                    <thead>
                        <tr className="px-8 py-4">
                            <th className="text-white font-semibold text-lg py-4">
                                <div className="flex items-center justify-center bg-gray-400 rounded-md p-4">Ticker</div>
                            </th>
                            <th className="text-white font-semibold text-lg py-4">
                                <div className="flex items-center justify-center bg-gray-400 rounded-md p-4">Long Name</div>
                            </th>
                            <th className="text-white font-semibold text-lg py-4">
                                <div className="flex items-center justify-center bg-gray-400 rounded-md p-4">Expected return</div>
                            </th>
                            <th className="text-white font-semibold text-lg py-4">
                                <div className="flex items-center justify-center bg-gray-400 rounded-md p-4">Variance</div>
                            </th>
                            <th className="text-white font-semibold text-lg py-4">
                                <div className="flex items-center justify-center bg-gray-400 rounded-md p-4">Standard Deviation</div>
                            </th>
                            {/*<th className='text-gray-400 font-semibold py-4'>
                                <i className="fa-solid fa-circle-info hover:opacity-75 text-3xl" onClick={()=>{setShowPInfo(!isShowPInfo)}}></i>
                            </th>*/}
                            <th className="py-4"></th>
                        </tr>
                    </thead>
                    <tbody ref={portfolioRef} id='portfolio'>
                        {assets_loading ? (<Loader/>):(
                            Object.keys(assetInfo).map((ticker, index) => {
                            const asset = assetInfo[ticker]; // Get the asset info for the current ticker
                            return (
                            <tr key={index} className='bg-gray-800 px-6 py-2 border-b border-gray-300'>
                                <td className="text-white font-semibold border-r-2 border-white text-center py-2">
                                {ticker}
                                </td>
                                <td className="text-white font-semibold border-r-2 border-white text-center py-2">
                                {asset.long_name}
                                </td>
                                <td className="text-white font-semibold border-r-2 border-white text-center py-2">
                                {asset.expected_return.toFixed(2)}%
                                </td>
                                <td className="text-white font-semibold border-r-2 border-white text-center py-2">
                                {asset.variance_pct.toFixed(2)}%
                                </td>
                                <td className="text-white font-semibold border-r-2 border-white text-center py-2">
                                {asset.std_dev.toFixed(2)}%
                                </td>
                                <td className='flex justify-center space-x-2 py-2'>
                                <button className='bg-red-500 p-2 rounded-md hover:opacity-75'>
                                    <p className='text-white font-semibold'>Remove Asset</p>
                                </button>
                                </td>
                            </tr>
                            );
                        }))}
                    </tbody>
                </table>
                {/*{isShowPInfo && <PortfolioTheory/>}*/}
            </div>
        </div>
    );
};

export default PortfolioInputForm;
