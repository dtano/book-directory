import React from 'react';
import BookGrid from "../BookGrid";
import useFetch from '../../hooks/useFetch';
import bookApi from '../../API/bookApi';
import './FeaturedBooks.css';

const FeaturedBooks = () => {
    console.log("Mounting FeaturedBooks");
    const { data, error } = useFetch(bookApi.getAllBooks);

    if(error) console.log(error);

    return(
        <div className="featured-books">
            <h2>Featured Books</h2>
            <BookGrid books={data} maxAmount={4}/>
        </div>
    )
}

export default FeaturedBooks;