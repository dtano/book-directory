import React, {useState} from 'react';
import MenuItems from './MenuItems';
import './NavBar.css';

// const NavBarStyle = {
//     overflow: 'hidden',
//     backgroundColor: '#e9e9e9',
// }

const NavBarItemsStyle = {
    background: 'green',
    height: '80px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
}

const NavBarLogoStyle = {
    color: 'white',
    justifySelf: 'start',
    marginLeft: '20px',
    cursor: 'pointer',
}

const FaReactStyle = {
    marginLeft: '0.5rem',
    fontSize: '1.6rem',
}

const NavMenuStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3,auto)',
    gridGap: '10px',
    listStyle: 'none',
    textAlign: 'center',
    width: '70vw',
    justifyContent: 'end',
    marginRight: '2rem',
}

// const NavLinksStyle = {
//     color: 'white',
//     textDecoration: 'none',
//     padding: '0.5rem 1rem',
// }

// const LogoStyle = {
//     marginRight: 'auto',
// }

// const LogoLinkStyle = {
//     fontWeight: 'bold',
//     color: 'red',
//     fontSize: '24px',
//     textAlign: 'center',
// }

// const NavButtonsStyle = {
//     margin: 0,
//     padding: 0,
// }

// const NavLinksMenuStyle = {
//     display: 'inline-block',
//     padding: '0px 20px',
//     listStyleType: 'none',
// }

// const BarLinkStyle = {
//     fontSize: '16px',
//     textDecoration: 'none',
//     color: 'red',
//     textTransform: 'uppercase',
//     borderRadius: '3px',
//     padding: '3px 13px',
// }

const NavBar = () => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    }
    
    return (
        // <div class='nav-bar' style={NavBarStyle}>
        //     <div class='logo' style={LogoStyle}>
        //         <a href='http://google.com/' style={LogoLinkStyle}>MyBrary</a>
        //     </div>
        //     <div class='search-bar'>
        //         <input type='text' placeholder='Search..'/>
        //     </div>
        //     <div class='nav-buttons' style={NavButtonsStyle}>
        //         <ul class="nav_links" style={NavLinksMenuStyle}>
        //             <li><a href="/home/" style={BarLinkStyle}>Home</a></li>
        //             <li><a href="/trips/" style={BarLinkStyle}>Notifications</a></li>
        //             <li><a href="/about/" style={BarLinkStyle}>Profile</a></li>
        //         </ul>
        //     </div>
        // </div>
        <nav className='NavBarItems' style={NavBarItemsStyle}>
            <h1 className='navbar-logo' style={NavBarLogoStyle}>MyBrary<i className="fab fa-react" style={FaReactStyle}></i></h1>
            <div className='menu-icon' onClick={handleClick}>
                <i className={isClicked ? 'fas fa-times' : 'fas fa-bars'}></i>
            </div>
            <ul className={isClicked ? 'nav-menu active' : 'nav-menu'} style={NavMenuStyle}>
                {MenuItems.map((item, index) => {
                    return (
                        <li key={index}><a className={item.cName} href={item.url}>{item.title}</a></li>
                    )
                })}
                
            </ul>
        </nav>
    );
}

export default NavBar;