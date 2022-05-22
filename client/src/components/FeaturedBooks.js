import React, { useState, useEffect } from 'react';
import BookGrid from "./BookGrid";
import axios from 'axios';

// const bookData = require('../data/bookData');
const FeaturedBooksStyle = {
    margin: 'auto',
    width: '75%',
    border: '1px solid red',
    paddingBottom: '1em',
    textAlign: 'center',
}

const FeaturedBooks = () => {
    let [featuredBooks, setFeaturedBooks] = useState([]);
  
    useEffect(() => {
        fetchFeaturedBooks();
    }, []);

    const fetchFeaturedBooks = () => {
        axios.get('http://localhost:5000/api/book/')
        .then((res) => {
            console.log(res.data);
            setFeaturedBooks(res.data);
        }).catch((err) => {
            console.log(err);
        });
    }

    return(
        <div className="featured-books" style={FeaturedBooksStyle}>
            <h2>Featured Books</h2>
            <BookGrid books={featuredBooks}/>
        </div>
    )
}

export default FeaturedBooks;