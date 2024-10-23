import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import 'mantine-datatable/styles.css';
import { hasRole } from './auth';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Create a global store to that perssists in sessionStorage
const savedStore = sessionStorage.getItem('globalStore');
if (savedStore) {
  window.globalStore = JSON.parse(savedStore);
} 
if (!savedStore.globalStore.user) {
  window.globalStore.user = { username: 'guest', roles: ['guest'] };
}
window.globalStore.user.hasRole = hasRole.bind(window.globalStore.user);


// A method to save the global store in sessionStorage
// whenever it is updated
window.saveGlobalStore = () => {
  sessionStorage.setItem('globalStore', JSON.stringify(window.globalStore));
};

root.render(
  <React.StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
       <App />
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
