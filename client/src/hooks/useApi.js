import { useState } from "react";

// Custom hook from: https://betterprogramming.pub/clean-api-call-with-react-hooks-3bd6438a375a
const useApi = (apiFunc) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const request = async (...args) => {
        setLoading(true);
        try {
            const result = await apiFunc(...args);
            setData(result.data);
        } catch (err) {
            setError(err.message || "Unexpected Error!");
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        error,
        loading,
        request
    };
}

export default useApi;