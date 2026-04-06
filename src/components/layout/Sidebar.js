import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    HiOutlineViewGrid,
    HiOutlineCalendar,
    HiOutlineUserGroup,
    HiOutlineCurrencyDollar,
    HiOutlineDocumentReport,
    HiOutlineCog,
    HiOutlineCollection,
    HiOutlineCamera,
    HiOutlineUserAdd,
    HiOutlineCreditCard,
    HiOutlineClipboardList,
    HiOutlineMenuAlt2,
    HiOutlineX,
    HiOutlineSun,
    HiOutlineMoon
} from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import './Sidebar.css';

const menuItems = [
    { path: '/', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/events', label: 'Events', icon: HiOutlineCalendar },
    { path: '/workers', label: 'Workers', icon: HiOutlineUserGroup },
    { path: '/expenses', label: 'Expenses', icon: HiOutlineCurrencyDollar },
    { path: '/payments', label: 'Payments', icon: HiOutlineCreditCard },
    { path: '/equipment', label: 'Equipment', icon: HiOutlineCamera },
    { path: '/packages', label: 'Packages', icon: HiOutlineCollection },
    { path: '/leads', label: 'Leads', icon: HiOutlineUserAdd },
    { path: '/documents', label: 'Documents', icon: HiOutlineClipboardList },
    { path: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
    { path: '/settings', label: 'Settings', icon: HiOutlineCog },
];

function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    return (
        <>
            {/* Mobile Toggle */}
            <button className="sidebar-mobile-toggle" onClick={() => setMobileOpen(true)}>
                <HiOutlineMenuAlt2 size={24} />
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
            )}

            <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <HiOutlineCamera size={22} />
                        </div>
                        <div className="sidebar-logo-text">
                            <span className="sidebar-logo-name">PixelPerfect</span>
                            <span className="sidebar-logo-sub">Studio Manager</span>
                        </div>
                    </div>
                    <button className="sidebar-close-mobile" onClick={() => setMobileOpen(false)}>
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-nav-group">
                        <span className="sidebar-nav-label">Main Menu</span>
                        {menuItems.slice(0, 6).map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                                }
                                end={item.path === '/'}
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                    <div className="sidebar-nav-group">
                        <span className="sidebar-nav-label">Management</span>
                        {menuItems.slice(6).map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`
                                }
                                onClick={() => setMobileOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-footer-top">
                        <div className="sidebar-user">
                            <div className="sidebar-user-avatar">PP</div>
                            <div className="sidebar-user-info">
                                <span className="sidebar-user-name">Studio Admin</span>
                                <span className="sidebar-user-role">Owner</span>
                            </div>
                        </div>
                        <button
                            className="theme-toggle"
                            onClick={toggleTheme}
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? <HiOutlineMoon size={20} /> : <HiOutlineSun size={20} />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
