import React from 'react';
import BookGrid from "./BookGrid";
import useFetch from '../hooks/useFetch';
import bookApi from '../API/bookApi';

const FeaturedBooksStyle = {
    margin: 'auto',
    width: '75%',
    border: '1px solid red',
    paddingBottom: '1em',
    textAlign: 'center',
}

const FeaturedBooks = () => {
    console.log("Mounting FeaturedBooks");
    const { data, error } = useFetch(bookApi.getAllBooks);

    if(error) console.log(error);

    return(
        <div className="featured-books" style={FeaturedBooksStyle}>
            <h2>Featured Books</h2>
            <BookGrid books={data}/>
        </div>
    )
}

export default FeaturedBooks;