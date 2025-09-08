import {render, screen, within} from "@testing-library/react";
import Breadcrumb from "./Breadcrumb.tsx";
import breadcrumb from "./Breadcrumb.tsx";

describe('Breadcrumb', () => {
    const page = [
        {
            title: 'Home',
            url: ''
         },
        {
            title: 'Page1',
            url: 'page_1_url'
        },
        {
            title: 'Page2',
            url: 'page_2_url'
        }
    ]
    it('renders correct urls', () => {
        render(<Breadcrumb page={page} />)
        expect(screen.getByTestId('breadcrumb-item-1').querySelector('a')).toHaveAttribute('href', 'page_1_url');
        expect(screen.getByTestId('breadcrumb-item-2').querySelector('a')).toHaveAttribute('href', 'page_2_url');
    })
    it('renders correct text', () => {
        render(<Breadcrumb page={page} />)
        expect(screen.getByTestId('breadcrumb-item-1').querySelector('a')).toHaveTextContent('Page1');
        expect(screen.getByTestId('breadcrumb-item-2').querySelector('a')).toHaveTextContent('Page2');
    })
    it('renders correct home icon', () => {
        render(<Breadcrumb page={page} />)
        const breadcrumbHomeItem = screen.getByTestId('breadcrumb-item-0')
        expect(within(breadcrumbHomeItem).getByTestId('breadcrumb-home-icon')).toBeInTheDocument();
    })
})