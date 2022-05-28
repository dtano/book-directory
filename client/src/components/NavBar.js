import React from 'react';

const NavBarStyle = {
    overflow: 'hidden',
    backgroundColor: '#e9e9e9',
}

const LogoStyle = {
    marginRight: 'auto',
}

const LogoLinkStyle = {
    fontWeight: 'bold',
    color: 'red',
    fontSize: '24px',
    textAlign: 'center',
}

const NavButtonsStyle = {
    margin: 0,
    padding: 0,
}

const NavLinksMenuStyle = {
    display: 'inline-block',
    padding: '0px 20px',
    listStyleType: 'none',
}

const BarLinkStyle = {
    fontSize: '16px',
    textDecoration: 'none',
    color: 'red',
    textTransform: 'uppercase',
    borderRadius: '3px',
    padding: '3px 13px',
}

const NavBar = () => {
    return (
        <div class='nav-bar' style={NavBarStyle}>
            <div class='logo' style={LogoStyle}>
                <a href='http://google.com/' style={LogoLinkStyle}>MyBrary</a>
            </div>
            <div class='search-bar'>
                <input type='text' placeholder='Search..'/>
            </div>
            <div class='nav-buttons' style={NavButtonsStyle}>
                <ul class="nav_links" style={NavLinksMenuStyle}>
                    <li><a href="/home/" style={BarLinkStyle}>Home</a></li>
                    <li><a href="/trips/" style={BarLinkStyle}>Notifications</a></li>
                    <li><a href="/about/" style={BarLinkStyle}>Profile</a></li>
                </ul>
            </div>
        </div>
    );
}

export default NavBar;