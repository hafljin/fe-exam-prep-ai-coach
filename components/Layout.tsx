
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BookOpenIcon, CalendarIcon, BarChartIcon } from './icons';
import { useAppContext } from '../hooks/useAppContext';
import { Language } from '../types';

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useAppContext();

    const toggleLanguage = () => {
        setLanguage(language === Language.JA ? Language.EN : Language.JA);
    };

    return (
        <button onClick={toggleLanguage} className="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full">
            {language === Language.JA ? t('english') : t('japanese')}
        </button>
    );
};


const BottomNav: React.FC = () => {
    const { t } = useAppContext();
    const navItems = [
        { path: '/home', label: t('home'), icon: HomeIcon },
        { path: '/study', label: t('study'), icon: BookOpenIcon },
        { path: '/calendar', label: t('calendar'), icon: CalendarIcon },
        { path: '/status', label: t('status'), icon: BarChartIcon },
    ];

    const navLinkClasses = "flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200";
    const activeLinkClasses = "text-blue-600 dark:text-blue-400";
    const inactiveLinkClasses = "text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400";

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
            <div className="flex justify-around h-full max-w-lg mx-auto">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `${navLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`}
                    >
                        <item.icon className="w-6 h-6 mb-1" />
                        <span className="text-xs">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-50">
                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">FE Exam AI Coach</h1>
                    <LanguageSwitcher />
                </div>
            </header>
            <main className="pt-20 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
