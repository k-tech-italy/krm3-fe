import React from 'react';
import ReactDOM from 'react-dom/client';

import { initBootstrapUsedComponents } from './bootstrap/components';
import { App } from './App';

import './index.scss';


initBootstrapUsedComponents();

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);

root.render(
	<React.StrictMode>
		<App/>
	</React.StrictMode>,
);
