import React, { useState, useEffect } from 'react';
import BookGrid from "./BookGrid";

const bookData = require('../data/bookData');
const FeaturedBooksStyle = {
    margin: 'auto',
    width: '75%',
    border: '1px solid red',
    paddingBottom: '1em',
    textAlign: 'center',
}

function FeaturedBooks(){
    let [allBooks, setAllBooks] = useState([]);
  
    useEffect(() => {
        setAllBooks(bookData);
    }, []);
    
    return(
        <div className="featured-books" style={FeaturedBooksStyle}>
            <h2>Featured Books</h2>
            <BookGrid books={allBooks}/>
        </div>
    )
}

export default FeaturedBooks;