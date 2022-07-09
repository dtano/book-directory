import { useState, useEffect } from 'react';
//import axios from 'axios';
// import client from '../API/client';

const useFetch = (apiFunc) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    console.log("Use fetch");

    useEffect(() => {
        console.log("Use effect");
        setLoading(true);
        apiFunc()
            .then((response) => {
                setData(response.data);
            })
            .catch((err) => {
                setError(err);
            })
            .finally(() => setLoading(false));
    }, [apiFunc]);

    return {data, error, loading};
}

export default useFetch;