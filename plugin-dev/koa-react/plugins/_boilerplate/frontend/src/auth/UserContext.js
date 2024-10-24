import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const UserContext = createContext();

// Variables to capture React state management for external use
let _user;
let setUserFunction;
let _isAuthenticated;
let setIsAuthenticatedFunction;

export const AuthProvider = ({ children }) => {

    function hasRole(allowedRoles, ownerRole) {
        let authorized = this.roles.some(role => allowedRoles.includes(role));
        if (!authorized && allowedRoles.includes('owner')) {
            authorized = this.roles.includes(ownerRole);
        }
        return authorized;
    };

    const savedUser = sessionStorage.getItem('_AuthProvider_User');
    const initialUser = savedUser ? JSON.parse(savedUser) : { username: 'guest', roles: ['guest'] };

    const [user, setUser] = useState(initialUser);
    const [isAuthenticated, setIsAuthenticated] = useState(apiClient.isAuthenticated());

    user.hasRole = hasRole.bind(user);
    setUserFunction = (newUser) => {
        newUser.hasRole = hasRole.bind(newUser);
        _user = newUser;
        setUser(newUser);
    };

    setIsAuthenticatedFunction = (newIsAuth) => {
        _isAuthenticated = newIsAuth;
        setIsAuthenticated(newIsAuth);
    };

    // Save references to be used outside of React components
    _user = user;
    _isAuthenticated = isAuthenticated;

    useEffect(() => {
        // Any time the user changes, save it to session storage
        // in case the user refreshes the page
        sessionStorage.setItem('_AuthProvider_User', JSON.stringify(user));
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser: setUserFunction, isAuthenticated, setIsAuthenticated: setIsAuthenticatedFunction }}>
            {children}
        </UserContext.Provider>
    );
};

// For non-React modules
export const getUser = () => _user;
export const setUser = (newUser) => setUserFunction(newUser);
export const getIsAuthenticated = () => _isAuthenticated;
export const setIsAuthenticated = (value) => setIsAuthenticatedFunction(value);
