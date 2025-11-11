import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMenuOpen } from '../features/viewSlice';
import './MenuGuide.css';

const MenuGuide = () => {
    const [isVisible, setIsVisible] = useState(true);
    const dispatch = useDispatch();

    const handleDismiss = () => {
        setIsVisible(false);
        // Optionally save to localStorage to prevent showing again
        localStorage.setItem('menuGuideShown', 'true');
    };

    useEffect(() => {
        const hasShown = localStorage.getItem('menuGuideShown');
        // if (hasShown) setIsVisible(false);

        // Sequence of actions:
        // 1. Open menu after 2 seconds
        const openTimer = setTimeout(() => {
            dispatch(setMenuOpen(true));
        }, 2000);

        // 2. Close menu and hide guide after 4 seconds
        const closeTimer = setTimeout(() => {
            dispatch(setMenuOpen(false));
            handleDismiss();
        }, 4000);

        return () => {
            clearTimeout(openTimer);
            clearTimeout(closeTimer);
        };
    }, [dispatch]);

    if (!isVisible) return null;

    return (
        <div className="guide-overlay">
            <div className="guide-content">
                <div className="guide-tooltip">
                    <h3>Menu Access</h3>
                    <p>Click here to open the main menu and access all features</p>
                    <button onClick={handleDismiss} className="guide-dismiss">
                        Got it
                    </button>
                </div>
                <div className="guide-highlight"></div>
            </div>
        </div>
    );
};

export default MenuGuide;