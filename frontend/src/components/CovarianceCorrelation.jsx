import React, { useEffect, useMemo } from 'react';
import useGetCovarianceCorrelationMatrices from '../hooks/getCorCovMatrices';
import ErrorBanner from './ErrorBanner';
import Loader from './Loader';

const CovarianceCorrelation = ({ assetInfo, matricesRef }) => {
    const {
        getCovarianceCorrelationMatrices,
        covarianceMatrix,
        correlationMatrix,
        matrix_loading,
        matrix_error
    } = useGetCovarianceCorrelationMatrices();

    const tickers_ls = useMemo(() => Object.keys(assetInfo), [assetInfo]);

    useEffect(() => {
        if (tickers_ls && tickers_ls.length > 0) {
            getCovarianceCorrelationMatrices(tickers_ls);
        }
    }, [tickers_ls]);

    if (matrix_error) {
        return (
            <div className="flex justify-center items-center my-8">
                <ErrorBanner all_error={matrix_error} />
            </div>
        );
    }

    if (matrix_loading) {
        return <Loader />;
    }
    
    // Function to conditionally set color based on correlation value
    const getColorForCorrelation = (value) => {
        if (value > 0.75) return 'bg-green-500'; // Strong positive correlation
        if (value > 0.675) return 'bg-green-400';
        if (value > 0.5) return 'bg-green-300'; // Moderate positive correlation
        if (value > 0.25) return 'bg-yellow-300'; // Weak positive correlation
        if (value > 0.1) return 'bg-yellow-200';
        if (value > 0) return 'bg-gray-300';
        if (value > -0.1) return 'bg-gray-300'
        if (value > -0.25) return 'bg-orange-300'; // Neutral correlation
        if (value > -0.5) return 'bg-orange-400'; // Weak negative correlation
        if (value > -0.675) return 'bg-red-400';
        if (value > -0.75) return 'bg-red-500'; // Moderate negative correlation
        return 'bg-red-500'; // Strong negative correlation
    };

    return (
        <div className='my-[5rem]'>
            <p className='text-3xl flex justify-center font-bold text-white border-b-2 border-t-2 my-[3rem]'>Matrices</p>
            <div className="flex flex-wrap justify-center gap-10 w-full mb-[5rem]" id='matrices'>
                <div className="w-2/3 flex flex-col justify-center">
                    {covarianceMatrix && <h2 className="text-3xl font-bold mb-2 text-center text-blue-500">Covariance Matrix</h2>}
                    {covarianceMatrix && (
                        <table className="text-xl table-auto border-collapse border border-gray-300 w-full text-center my-4">
                            <thead>
                                <tr>
                                    {/* Empty top-left corner */}
                                    <th className="border border-gray-300 px-4 py-2 bg-transparent"></th>
                                    {/* Column Headers */}
                                    {covarianceMatrix.columns.map((col, i) => (
                                        <th
                                            key={i}
                                            className="border border-gray-300 px-4 py-2 text-white bg-gray-800 font-semibold"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody ref={matricesRef}>
                                {/* Row Data */}
                                {covarianceMatrix.data.map((row, i) => (
                                    <tr key={i}>
                                        {/* Row Header */}
                                        <th className="border border-gray-300 px-4 py-2 bg-gray-800 text-white font-semibold">
                                            {covarianceMatrix.index[i]}
                                        </th>
                                        {/* Data Cells */}
                                        {row.map((cell, j) => (
                                            <td key={j} className="border border-gray-300 px-4 py-2 bg-white">
                                                {(cell * 100).toFixed(3)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="w-2/3 flex flex-col justify-center">
                    {correlationMatrix && <h2 className="text-3xl font-bold mb-2 text-center text-blue-500">Correlation Matrix</h2>}
                    {correlationMatrix && (
                        <table className="text-xl table-auto border-collapse border border-gray-300 w-full text-center my-4">
                            <thead>
                                <tr>
                                    {/* Empty top-left corner */}
                                    <th className="border border-gray-300 px-4 py-2"></th>
                                    {/* Column Headers */}
                                    {correlationMatrix.columns.map((col, i) => (
                                        <th
                                            key={i}
                                            className="border border-gray-300 px-4 py-2 text-white bg-gray-800 font-semibold"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row Data */}
                                {correlationMatrix.data.map((row, i) => (
                                    <tr key={i}>
                                        {/* Row Header */}
                                        <th className="border border-gray-300 px-4 py-2 bg-gray-800 text-white font-semibold">
                                            {correlationMatrix.index[i]}
                                        </th>
                                        {/* Data Cells */}
                                        {row.map((cell, j) => (
                                            <td
                                                key={j}
                                                className={`border border-gray-300 px-4 py-2 ${getColorForCorrelation(
                                                    cell
                                                )}`}
                                            >
                                                {cell.toFixed(3)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CovarianceCorrelation;
