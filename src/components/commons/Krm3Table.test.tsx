import Krm3Table from "./Krm3Table.tsx";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {vi} from "vitest";
import * as useView from '../../hooks/useView';

describe('Krm3Table', () => {
    const onClickRowMock = vi.fn();
    const props = {
        columns: [
            { accessorKey: 'column1', header: 'Column1' },
            { accessorKey: 'column2', header: 'Column2' }
        ],
        data: [
            { column1: 'data11', column2: 'data21', column3: 'data31' },
            { column1: 'data12', column2: 'data22', column3: 'data32' },
        ],
        onClickRow: onClickRowMock
    }
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders correctly', () => {
        render(<Krm3Table {...props} />)
        expect(screen.getByText("Column1")).toBeInTheDocument()
        expect(screen.getByText("Column2")).toBeInTheDocument()
        expect(screen.getByText("data11")).toBeInTheDocument()
        expect(screen.getByText("data21")).toBeInTheDocument()
        expect(screen.getByText("data12")).toBeInTheDocument()
        expect(screen.getByText("data22")).toBeInTheDocument()
    })
    it('renders empty table', () => {
        render(<Krm3Table {...props} data={[]}/>)
        expect(screen.getByText("No Data")).toBeInTheDocument()
    })
    it('renders small screen table', () => {
        vi.spyOn(useView, 'useMediaQuery').mockReturnValue(true);
        render(<Krm3Table {...props} />)
        expect(screen.getByTestId("small-screen-table")).toBeInTheDocument()
        expect(screen.getByText("data11")).toBeInTheDocument()
        expect(screen.getByText("data21")).toBeInTheDocument()
        expect(screen.getByText("data12")).toBeInTheDocument()
        expect(screen.getByText("data22")).toBeInTheDocument()
    })
    it('renders arrow for sorting', () => {
        render(<Krm3Table {...props} />)
        const header1 = screen.getByTestId("header-column1")
        fireEvent.click(header1)
        expect(within(header1).getByText("↑")).toBeInTheDocument()
        fireEvent.click(header1)
        expect(within(header1).getByText("↓")).toBeInTheDocument()
    })
    it('onClickRow is being called with correct parameters', () => {
        render(<Krm3Table {...props} />)
        fireEvent.click(screen.getByTestId("row-0"))
        expect(onClickRowMock).toBeCalledWith({
            "column1": "data11",
            "column2": "data21",
            "column3": "data31",
        })
        fireEvent.click(screen.getByTestId("row-1"))
        expect(onClickRowMock).toBeCalledWith({
            "column1": "data12",
            "column2": "data22",
            "column3": "data32",
        })
    })
    it('onClickRow is being called with correct parameters on small screen', () => {
        vi.spyOn(useView, 'useMediaQuery').mockReturnValue(true);
        render(<Krm3Table {...props} />)
        fireEvent.click(screen.getByTestId("row-0"))
        expect(onClickRowMock).toBeCalledWith({
            "column1": "data11",
            "column2": "data21",
            "column3": "data31",
        })
        fireEvent.click(screen.getByTestId("row-1"))
        expect(onClickRowMock).toBeCalledWith({
            "column1": "data12",
            "column2": "data22",
            "column3": "data32",
        })
    })
})