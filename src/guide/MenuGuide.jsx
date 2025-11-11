import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setMenuOpen } from '../features/viewSlice';
import './MenuGuide.css';

// Guide sequence configuration
const guideSequence = [
    {
        id: 'menu',
        title: 'Menu Access 1111',
        description: 'Click here to open the main menu and access all features',
        timing: 2000,
        actions: [
            { type: 'dispatch', action: setMenuOpen, payload: true }
        ],
        highlightSelector: '.menutab'
    },
    {
        id: 'menuClose',
        timing: 2000,
        actions: [
            { type: 'dispatch', action: setMenuOpen, payload: false }
        ]
    },

    {
        id: 'menu',
        title: 'Menu Access 222',
        description: 'Click here to open the main menu and access all features',
        timing: 2000,
        actions: [
            { type: 'dispatch', action: setMenuOpen, payload: true }
        ],
        highlightSelector: '.menutab'
    },


    {
        id: 'newProject',
        title: 'New Project',
        description: 'Select "New Project" to create a fresh workspace',
        timing: 2000,
        actions: [
            { type: 'dispatch', action: setMenuOpen, payload: true }
        ],
        highlightSelector: '.new-project-button'
    },
    {
        id: 'openProject',
        timing: 2000,
        actions: [
            { type: 'click', selector: '.new-project-button' }
        ]
    }
];

const MenuGuide = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const dispatch = useDispatch();

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('menuGuideShown', 'true');
    };

    const executeAction = (action) => {
        switch (action.type) {
            case 'dispatch':
                dispatch(action.action(action.payload));
                break;
            case 'click':
                const element = document.querySelector(action.selector);
                if (element) element.click();
                break;
            default:
                console.warn('Unknown action type:', action.type);
        }
    };

    useEffect(() => {
        const hasShown = localStorage.getItem('menuGuideShown');
        let currentTimer = null;
    
        const executeStep = (stepIndex) => {
            if (stepIndex >= guideSequence.length) return;
    
            const step = guideSequence[stepIndex];
            currentTimer = setTimeout(() => {
                // Execute current step's actions
                step.actions?.forEach(executeAction);
                setCurrentStep(stepIndex);
    
                // If this is the last step, dismiss guide
                // if (stepIndex === guideSequence.length - 1) {
                //     handleDismiss();
                //     return;
                // }
    
                // Calculate delay for next step
                const nextDelay = guideSequence[stepIndex + 1].timing - step.timing;
                // Execute next step after the relative delay
                executeStep(stepIndex + 1);
            }, step.timing);
            // }, stepIndex === 0 ? step.timing : 0);
        };
    
        // Start the sequence
        executeStep(0);
    
        // Cleanup function
        return () => {
            if (currentTimer) clearTimeout(currentTimer);
        };
    }, [dispatch]);

    if (!isVisible) return null;

    const currentGuide = guideSequence.find(step => step.timing === guideSequence[currentStep]?.timing);

    return (
        <div className="guide-overlay">
            <div className="guide-content">
                {currentGuide?.title && (
                    <div className="guide-tooltip">
                        <h3>{currentGuide.title}</h3>
                        <p>{currentGuide.description}</p>
                        <button onClick={handleDismiss} className="guide-dismiss">
                            Got it
                        </button>
                    </div>
                )}
                {currentGuide?.highlightSelector && (
                    <div 
                        className="guide-highlight"
                        style={currentGuide.highlightStyle}
                    />
                )}
            </div>
        </div>
    );
};

export default MenuGuide;