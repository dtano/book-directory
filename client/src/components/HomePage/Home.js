import React from 'react';
import FeaturedBooks from '../FeaturedBooks/FeaturedBooks';
import './Home.css';

import sampleCover from '../../images/logo192.png';

const Home = () => {
    return (
        <div className='home-all'>
            <div className='home-container'>
            <FeaturedBooks />
            <div className='currently-reading'>
                <h3>Currently reading</h3>
                <ul className='currently-reading-books-list'>
                    <li>
                        <h3 className='book-title'>The Dark Forest</h3>
                        <p className='book-author'>Cixin Liu</p>
                    </li>
                </ul>
            </div>
            <div className='borrow-status'>
                <h3>Books borrowed</h3>
            </div>
            <div className='tbr-container'>
                <h3>TBR</h3>
                <ul className='tbr-book-list'>
                    <li key="1" className='tbr-book-card'>
                        <img className='small-cover' src={sampleCover}></img>
                        <div className='book-details'>
                            <h3>A Gentleman in Moscow</h3>
                            <p>Amor Towles</p>
                        </div>
                    </li> 
                    <li key="2" className='tbr-book-card'>
                        <img className='small-cover' src={sampleCover}></img>
                        <div className='book-details'>
                            <h3>The Guest List</h3>
                            <p>Lucy Foley</p>
                        </div>
                    </li> 
                    <li key="3" className='tbr-book-card'>
                        <img className='small-cover' src={sampleCover}></img>
                        <div className='book-details'>
                            <h3>Good Omens</h3>
                            <p>Neil Gaiman and Terry Pratchet</p>
                        </div>
                    </li> 
                </ul>
                <button className='view-all-button'>View all</button>
            </div>
        </div>
        </div>
    );
}

export default Home;