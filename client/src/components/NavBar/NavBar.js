import React, {useState} from 'react';
import {Link} from 'react-router-dom'
import {MenuItems, LeftMenuItems} from './MenuItems';
import SearchBar from '../SearchBar/SearchBar';
import './NavBar.css';

const NavBar = () => {
    const [isClicked, setIsClicked] = useState(false);
    const [showAccountDropdown, setShowAccountDropdown] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    }

    const handleDropdown = () => {
        setShowAccountDropdown(!showAccountDropdown);
    }

    return (
        <React.Fragment>
            <nav className='NavBarItems'>
                <div className='navbar-left'>
                    <h1 className='navbar-logo'>MyBrary<i className="fas fa-book-open"></i></h1>
                    <ul>
                        {LeftMenuItems.map((item, index) => {
                            return (
                                <li key={index}><Link to={item.url} className={item.cName}>{item.title}</Link></li>
                            )
                        })}
                    </ul>
                    <SearchBar />
                </div>
                <div className='nav-menu'>
                    <ul>
                        {MenuItems.map((item, index) => {
                            return (
                                <li key={index}><a className={item.cName} href={item.url}><i className={item.icon}></i></a></li>
                            )
                        })}
                        <li className="dropdown">
                            <button className='dropbtn' onClick={handleDropdown}><i className='far fa-user'></i></button>
                            <div className={showAccountDropdown ? 'dropdown-content' : 'dropdown-content-hidden'}>
                                <Link to="/profile" onClick={handleDropdown}>Profile</Link>
                                <Link to="/logout" onClick={handleDropdown}>Logout</Link>
                            </div>
                        </li>
                    </ul>
                </div>
                <button className='hamburger' onClick={handleClick}>
                    <span/>
                    <span/>
                    <span/>
                </button>
            </nav>
            <nav className={isClicked ? 'collapsible-menu-active' : 'collapsible-menu'}>
                <div>
                    <ul>
                        <li><a href='/#'>Home</a></li>
                        <li><a href='/#'>My Books</a></li>
                        <li><a href='/#'>Notifications</a></li>
                    </ul>
                </div>
                <hr/>
                <div>
                    <ul>
                        <li><a href='/#'>Account settings</a></li>
                        <li><a href='/#'>Sign in</a></li>
                        <li><a href='/#'>Register</a></li>
                        <li><a href='/#'>Logout</a></li>
                    </ul>
                </div>
            </nav>
        </React.Fragment>
    );
}

export default NavBar;