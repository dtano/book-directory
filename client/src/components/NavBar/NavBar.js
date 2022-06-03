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
            {/* <div className='menu-icon' onClick={handleClick}>
                <i className={isClicked ? 'fas fa-times' : 'fas fa-bars'}></i>
            </div> */}
            <div className={isClicked ? 'nav-menu active' : 'nav-menu'}>
                <ul>
                    {MenuItems.map((item, index) => {
                        return (
                            <li key={index}><a className={item.cName} href={item.url}><i className={item.icon}></i></a></li>
                        )
                    })}
                </ul>
            </div>
            <div className='search-icon'>
                <i className="fas fa-search"></i>
            </div>
            <div className='minimized-menu'>
                <i className='fas fa-bars'></i>
            </div>
            {/* <Button>Sign Up</Button> */}
        </nav>
    );
}

export default NavBar;