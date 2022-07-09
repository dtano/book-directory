import React, {useState} from 'react';
import {MenuItems, LeftMenuItems} from './MenuItems';
import './NavBar.css';

const NavBar = () => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    }
    
    return (
        <nav className='NavBarItems'>
            <div className='navbar-left'>
                <h1 className='navbar-logo'>MyBrary<i className="fas fa-book-open"></i></h1>
                <ul>
                    {LeftMenuItems.map((item, index) => {
                        return (
                            <li key={index}><a className={item.cName} href={item.url}>{item.title}</a></li>
                        )
                    })}
                </ul>
                <div className='search-bar'>
                    <input type="text" placeholder="Search books"/>
                </div>
            </div>
            <div className={isClicked ? 'nav-menu active' : 'nav-menu'}>
                <ul>
                    {MenuItems.map((item, index) => {
                        return (
                            <li key={index}><a className={item.cName} href={item.url}><i className={item.icon}></i></a></li>
                        )
                    })}
                </ul>
            </div>
            <button className='hamburger' onClick={handleClick}>
                <span/>
                <span/>
                <span/>
            </button>
        </nav>
    );
}

export default NavBar;