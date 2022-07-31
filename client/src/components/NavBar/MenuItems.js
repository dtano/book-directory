const MenuItems = [
    {
        title: 'Inbox',
        url: '#',
        cName: 'nav-icon-link',
        icon: 'far fa-envelope',
    },
    {
        title: 'Notifications',
        url: '#',
        cName: 'nav-icon-link',
        icon: 'far fa-bell',
    },
    // {
    //     title: 'Profile',
    //     url: '#',
    //     cName: 'nav-links',
    //     icon: 'far fa-user',
    // },
];

const ProfileDropdownItems = [
    {
        title: 'Profile',
        url: '/profile',
        icon: 'fas fa-address-card',
        cName: 'dropdown-button-profile'
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: 'fas fa-cog',
        cName: 'dropdown-button-settings'
    },
    {
        title: 'Logout',
        url: '/logout',
        icon: 'fas fa-door-open',
        cName: 'dropdown-button-logout'
    }
];

const LeftMenuItems = [
    {
        title: 'Home',
        url: '/',
        cName: 'nav-links',
        icon: '',
    },
    {
        title: 'My Books',
        url: '/books',
        cName: 'nav-links',
        icon: '',
    },
]

module.exports = {
    MenuItems,
    LeftMenuItems,
    ProfileDropdownItems
}