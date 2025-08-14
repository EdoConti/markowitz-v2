import { useState } from 'react';
import axios from 'axios';

const useGetAssetInfo = () => {
  const [assets_loading, setLoading] = useState(false);
  const [assets_error, setError] = useState(null);
  const [assetInfo, setAssetInfo] = useState({}); // Object to hold multiple assets' info

  const getAssetInfo = async (tickers) => {
    setLoading(true);
    setError(null);
    setAssetInfo({}); // Reset the assetInfo state

    try {
      // Make concurrent requests for all tickers
      const requests = tickers.map((ticker) =>
        axios.get(`http://127.0.0.1:5000/api/securities/${ticker}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.all(requests); // Wait for all requests to complete

      // Transform the response data into an object where keys are tickers and values are the asset info
      const assetsData = responses.reduce((acc, response, index) => {
        acc[tickers[index]] = response.data;
        return acc;
      }, {});

      setAssetInfo(assetsData); // Store the fetched data
      return assetsData;

    } catch (err) {
      setError(err.response ? err.response.data.error : `An error occurred: ${err}`); // Handle errors
    } finally {
      setLoading(false);
    }
  };
  return { getAssetInfo, setAssetInfo, assets_loading, assets_error, assetInfo };
};

export default useGetAssetInfo;
