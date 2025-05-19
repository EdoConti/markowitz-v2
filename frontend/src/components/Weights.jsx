import React, { useState, useEffect, useRef } from 'react'
import Loader from './Loader';

const Weights = ({ assetInfo, error, loading, weights, setWeights }) => {
    const incrementRefs = useRef({});
    const decrementRefs = useRef({});

    // Initialize weights to 0
    useEffect(() => {
        if (assetInfo) {
            const initial = Object.keys(assetInfo).reduce((acc, t) => {
            acc[t] = 0;
            return acc;
            }, {});
            setWeights(initial);
        }
    }, [assetInfo]);

    // Calculate sum of allocated weights
    const totalAllocated = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const remaining = 100 - totalAllocated;


    const handleIncrement = (ticker) => {
        setWeights(prev => {
            // compute total from the *current* state object
            const total = Object.values(prev).reduce((sum, w) => sum + w, 0);
            if (total >= 100) return prev;      // never go above 100
            
            return {
            ...prev,
            [ticker]: prev[ticker] + 1,       // guaranteed to be safe by the guard
            };
        });
    };

    const handleDecrement = (ticker) => {
        if (weights[ticker] <= 0) return;
            setWeights((prev) => ({
            ...prev,
            [ticker]: Math.max(prev[ticker] - 1, 0),
        }));
    };

    const startContinuous = (ticker, type) => {
        // do one immediate tick via the same handlers:
        type === 'inc' ? handleIncrement(ticker) : handleDecrement(ticker);

        // then schedule repeats
        const id = setInterval(() => {
            // call through our guarded handlers
            type === 'inc' ? handleIncrement(ticker) : handleDecrement(ticker);

            // also check total inside the loop and clear ourselves out
            setWeights(prev => {
                const tot = Object.values(prev).reduce((sum, w) => sum + w, 0);
                if (tot >= 100 && type === 'inc') {
                    clearInterval(id);
                }
                return prev;
            });
        }, 150);

        if (type === 'inc') incrementRefs.current[ticker] = id;
        else decrementRefs.current[ticker] = id;
    };


    // Stop continuous change
    const stopContinuous = (ticker, type) => {
        const id = type === 'inc' ? incrementRefs.current[ticker] : decrementRefs.current[ticker];
        clearInterval(id);
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
            <h2 className='text-2xl font-bold mb-4 text-white'>Choose your <span className='text-blue-500'>starting weights</span> or <span className='text-blue-500'>leave as-is</span> for random weights:</h2>
            <p className='text-xl font-bold mb-4 text-slate-800'>Remaining to allocate:  <span className='text-blue-300'> {remaining}% </span></p>
            {assetInfo && (
                <div className='mt-4 space-y-2'>
                    {Object.keys(assetInfo).map((ticker) => (
                        <div key={ticker} className='flex items-center justify-between bg-gray-800 p-2 rounded'>
                            <span className='text-white font-semibold mx-3'>{ticker}</span>
                            <div className='flex items-center space-x-5'>
                                <button
                                    className='px-2 py-1 rounded bg-gray-700 hover:bg-red-400'
                                    disabled={weights[ticker] <= 0}
                                    onMouseDown={() => startContinuous(ticker, 'dec')}
                                    onMouseUp={() => stopContinuous(ticker, 'dec')}
                                    onMouseLeave={() => stopContinuous(ticker, 'dec')}
                                    onTouchStart={() => startContinuous(ticker, 'dec')}
                                    onTouchEnd={() => stopContinuous(ticker, 'dec')}
                                >
                                    -
                                </button>
                                <span className='text-white font-medium w-[20px]'>{weights[ticker]}%</span>
                                <button
                                className='px-2 py-1 rounded bg-gray-700 hover:bg-green-400'
                                disabled={remaining <= 0}
                                onMouseDown={() => startContinuous(ticker, 'inc')}
                                onMouseUp={() => stopContinuous(ticker, 'inc')}
                                onMouseLeave={() => stopContinuous(ticker, 'inc')}
                                onTouchStart={() => startContinuous(ticker, 'inc')}
                                onTouchEnd={() => stopContinuous(ticker, 'inc')}
                                >
                                +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Weights;
