import React from 'react';
import { createRoot } from 'react-dom/client';

import { SplunkThemeProvider } from '@splunk/themes';

import MyReactComponent from '../src/MyReactComponent';

const containerEl = document.getElementById('main-component-container');
const root = createRoot(containerEl);
root.render(
    <>
        <SplunkThemeProvider colorScheme="dark" family="prisma">
            <MyReactComponent/>
        </SplunkThemeProvider>
        <SplunkThemeProvider colorScheme="light" family="prisma">
            <MyReactComponent/>
        </SplunkThemeProvider>
        <SplunkThemeProvider colorScheme="dark" family="enterprise">
            <MyReactComponent/>
        </SplunkThemeProvider>
        <SplunkThemeProvider colorScheme="light" family="enterprise">
            <MyReactComponent/>
        </SplunkThemeProvider>
    </>
);
