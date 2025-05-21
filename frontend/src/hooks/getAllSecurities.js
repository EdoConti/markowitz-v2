import { useState, useEffect } from "react";
import axios from "axios";

const useGetAllSecurities = () => {
    const [securities, setSecurities] = useState([]);
    const [all_loading, setLoading] = useState(true);
    const [all_error, setError] = useState(null);

    useEffect(() => {
        // Fetch securities from the backend
        const fetchSecurities = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/api/securities/all");
            setSecurities(response.data.data); // Adjust the path based on your API response structure
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
        };

        fetchSecurities();
    }, []);

    return { securities, all_loading, all_error };
};

export default useGetAllSecurities;
