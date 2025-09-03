import {render, screen} from "@testing-library/react";
import Breadcrumb from "./Breadcrumb.tsx";

describe('Breadcrumb', () => {
    const page = [
        {
            title: 'Home',
            url: 'home_url'
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
        screen.debug()
        expect(screen.getByTestId('breadcrumb-item-0')).toHaveAttribute('href', 'home_url');
        expect(screen.getByTestId('breadcrumb-item-1')).toHaveAttribute('href', 'page_1_url');
        expect(screen.getByTestId('breadcrumb-item-2')).toHaveAttribute('href', 'page_2_url');
    })
    it('renders correct text', () => {
        render(<Breadcrumb page={page} />)


    })
})