const MenuItems = [
    // {
    //     title: 'Inbox',
    //     url: '#',
    //     cName: 'nav-links',
    //     icon: 'far fa-bell',
    // },
    {
        title: 'Notifications',
        url: '#',
        cName: 'nav-links',
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
        icon: 'fas fa-address-card'
    },
    {
        title: 'Settings',
        url: '/settings',
        icon: 'fas fa-cog'
    },
    {
        title: 'Logout',
        url: '/logout',
        icon: 'fas fa-door-open'
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