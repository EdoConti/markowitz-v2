import React, {useMemo, useState, useEffect} from 'react'
import Loader from './Loader';

const Weights = (props) => {
    const {assetInfo, shortSell, error, loading} = props;
    const [weights, setWeights] = useState({});
    const [isRandom, setIsRandom] = useState(true);

    // Initialize weights based on the number of assets
    useEffect(() => {
        if (assetInfo) {
            if (!isRandom) {
                setEqualWeights();
            }
        }
    }, [assetInfo, isRandom]);

    const setEqualWeights = () => {
        const numAssets = Object.keys(assetInfo).length;
        const initialWeight = 100 / numAssets;
        const initialWeights = Object.keys(assetInfo).reduce((acc, ticker) => {
            acc[ticker] = initialWeight;
            return acc;
        }, {});
        setWeights(initialWeights);
    };


    const handleIncrement = (ticker) => {
        setWeights((prevWeights) => ({
            ...prevWeights,
            [ticker]: Math.min(prevWeights[ticker] + 1, 100),
        }));
    };

    const handleDecrement = (ticker) => {
        setWeights((prevWeights) => ({
            ...prevWeights,
            [ticker]: Math.max(prevWeights[ticker] - 1, 0),
        }));
    };


    if (loading){
        return <Loader/>
    };

    if (error) {
        return (
            <div className='flex justify-center items-center my-8'>
                <ErrorBanner all_error={error}/>
            </div>);
    }

    return (
        <div className='px-5 ml-10'>
            <h2 className='text-2xl font-bold mb-4 text-white'>Choose your <span className='text-blue-500'>starting weights</span> or <span className='text-blue-500'>leave blank</span> for random weights:</h2>
            <div>
                <div className='flex space-x-4 items-center'>
                    <input
                    type='radio'
                    className='form-radio h-4 w-4 text-indigo-600'
                    checked={!isRandom}
                    onChange={()=> {setIsRandom(false)}}
                    />
                    <span className="flex items-center space-x-2 text-gray-100 text-2xl font-semibold border-b mb-1"><p>Use Custom Weights</p></span>
                </div>
                {assetInfo && Object.keys(assetInfo).map((ticker, index) => {
                    const asset = assetInfo[ticker];
                    const weight = weights[ticker] || 0;
                    return (
                        <div className='flex flex-col py-2'>
                            <div key={index} className='flex gap-10 ml-8'>
                                <p className='text-white font-semibold'>{ticker}</p>
                                <div className="flex items-center justify-center space-x-5 text-sm">
                                    <input
                                    className='flex min-w-[0.5rem]'
                                    type='number'
                                    defaultValue={shortSell ? -100 : 0}
                                    min={shortSell ? -100:0}
                                    max={50}
                                    disabled={isRandom}
                                    />
                                    <i className="fa-solid fa-minus cursor-pointer font-semibold text-white"
                                    onClick={() => handleDecrement(ticker)}
                                    ></i>
                                    <p className="text-md font-semibold text-white">{weight}%</p>
                                    <i className="fa-solid fa-plus cursor-pointer font-semibold text-white"
                                    onClick={() => handleIncrement(ticker)}
                                    ></i>
                                    <input
                                    className='flex min-w-[0.5rem]'
                                    type='number'
                                    defaultValue={100}
                                    min={0}
                                    max={100}
                                    disabled={isRandom}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className='flex items-center space-x-4'>
                <input
                type='radio'
                className='form-radio h-4 w-4 text-indigo-600'
                checked={isRandom}
                onChange={()=> {setIsRandom(true)}}
                />
                <span className="flex items-center space-x-2 text-gray-100 text-2xl font-semibold border-b mb-1"><p>Use Random Weights</p></span>
            </div>
        </div>
    );
};

export default Weights;
