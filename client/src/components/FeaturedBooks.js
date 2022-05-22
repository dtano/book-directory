import React, { useEffect } from 'react';
import BookGrid from "./BookGrid";
import useApi from '../hooks/useApi';
import bookApi from '../API/bookApi';

const FeaturedBooksStyle = {
    margin: 'auto',
    width: '75%',
    border: '1px solid red',
    paddingBottom: '1em',
    textAlign: 'center',
}

const FeaturedBooks = () => {
    const getFeaturedBooks = useApi(bookApi.getAllBooks);
  
    useEffect(() => {
        getFeaturedBooks.request();
    }, []);

    return(
        <div className="featured-books" style={FeaturedBooksStyle}>
            <h2>Featured Books</h2>
            <BookGrid books={getFeaturedBooks.data}/>
        </div>
    )
}

export default FeaturedBooks;