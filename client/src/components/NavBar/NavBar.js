import React, {useState} from 'react';
import MenuItems from './MenuItems';
//import { Button } from '../Button';
import './NavBar.css';

// const NavBarItemsStyle = {
//     background: 'green',
//     height: '80px',
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     fontSize: '1.2rem',
// }

// const NavBarLogoStyle = {
//     color: 'white',
//     justifySelf: 'start',
//     marginLeft: '20px',
//     cursor: 'pointer',
// }

// const FaReactStyle = {
//     marginLeft: '0.5rem',
//     fontSize: '1.6rem',
// }

// const NavMenuStyle = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(3,auto)',
//     gridGap: '10px',
//     listStyle: 'none',
//     textAlign: 'center',
//     width: '70vw',
//     justifyContent: 'end',
//     marginRight: '2rem',
// }

const NavBar = () => {
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    }
    
    return (
        <nav className='NavBarItems'>
            {/* <div className='navbar-logo'>
                <h1>MyBrary<i className="fab fa-react"></i></h1>
            </div> */}
            <div className='navbar-left'>
                <h1 className='navbar-logo'>MyBrary<i className="fab fa-react"></i></h1>
                <ul>
                    <li>Home</li>
                    <li>My Books</li>
                </ul>
            </div>
            {/* <h1 className='navbar-logo'>MyBrary<i className="fab fa-react"></i></h1>
            <div>
                <ul>
                    <li>Home</li>
                    <li>My Books</li>
                </ul>
            </div> */}
            <div className='search-bar'>
                <input type="text" placeholder="Search books.."/>
            </div>
            {/* <div className='menu-icon' onClick={handleClick}>
                <i className={isClicked ? 'fas fa-times' : 'fas fa-bars'}></i>
            </div> */}
            <div className={isClicked ? 'nav-menu active' : 'nav-menu'}>
                <ul>
                    {MenuItems.map((item, index) => {
                        return (
                            <li key={index}><a className={item.cName} href={item.url}>{item.title}</a></li>
                        )
                    })}
                </ul>
            </div>
            {/* <Button>Sign Up</Button> */}
        </nav>
    );
}

export default NavBar;