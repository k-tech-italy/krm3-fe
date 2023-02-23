import React from 'react';


function App() {
	return (
		<h1>
			Krm3 v{process.env.REACT_APP_VERSION}
			<button type="button" className="btn btn-primary">Primary</button>
		</h1>
	);
}

export default App;
