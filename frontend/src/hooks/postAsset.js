import { useState } from 'react';
import axios from 'axios';

const usePostAsset = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const postAsset = async (ticker) => {
        setLoading(true);
        setError(null);
        setSuccessMessage('');

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/securities', 
        {
            "ticker": ticker
        }, {
            headers: {
            'Content-Type': 'application/json',
            },
        });
            setSuccessMessage(response.data.message);  // Extract the success message
            return response.data.security_data;        // Return the recorded asset data
        } catch (err) {
            setError(err.response ? err.response.data.error : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

  return { postAsset, loading, error, successMessage };
};

export default usePostAsset;
