import { useState } from 'react';
import axios from 'axios';

const useGetCovarianceCorrelationMatrices = () => {
    const [matrix_loading, setLoading] = useState(false);
    const [matrix_error, setError] = useState(null);
    const [covarianceMatrix, setCovarianceMatrix] = useState(null);
    const [correlationMatrix, setCorrelationMatrix] = useState(null);

    const getCovarianceCorrelationMatrices = async (tickers) => {
        setLoading(true);
        setError(null);
        setCovarianceMatrix(null);
        setCorrelationMatrix(null);

        try {
        // Make the GET request to fetch the covariance and correlation matrices
        const response = await axios.get(
            'https://markowitz-optimization.onrender.com/api/securities/Covariance&Correlation', 
            { // Pass tickers as query params
            params: { tickers },
            paramsSerializer: params => {
                return params.tickers.map(t => `tickers=${encodeURIComponent(t)}`).join('&');
            }});
        
            const parsedCovarianceMatrix = JSON.parse(response.data.covariance_matrix);
            const parsedCorrelationMatrix = JSON.parse(response.data.correlation_matrix);

            // Set the parsed matrices to state
            setCovarianceMatrix(parsedCovarianceMatrix);
            setCorrelationMatrix(parsedCorrelationMatrix);

        } catch (err) {
        // Handle any errors
        setError(err.response ? err.response.data.error : 'An error occurred');
        } finally {
        setLoading(false);
        }
    };

    return {
        getCovarianceCorrelationMatrices,
        covarianceMatrix,
        correlationMatrix,
        matrix_loading,
        matrix_error
    };
};

export default useGetCovarianceCorrelationMatrices;
