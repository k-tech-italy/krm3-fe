import {render, screen} from "@testing-library/react";
import LoadSpinner from "./LoadSpinner.tsx";

describe('LoadSpinner', () => {
    it('renders correctly', () => {
        render(<LoadSpinner />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    })
})