import React from 'react';
import { render, screen } from '@testing-library/react';
import { Login } from './components/commons/Login';

test('renders login', () => {
	render(<Login/>);
	const linkElement = screen.getByText(/username/i);
	expect(linkElement).toBeInTheDocument();
});
