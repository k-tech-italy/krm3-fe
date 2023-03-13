import React from 'react';

import './App.css';


function App() {
	return (
		<div className="App">
			<header className="App-header">
				<p>
					Krm3 v{process.env.REACT_APP_VERSION}
				</p>
			</header>
		</div>
	);
}

export default App;
