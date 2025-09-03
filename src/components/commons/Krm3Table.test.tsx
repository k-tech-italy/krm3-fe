import Krm3Table from "./Krm3Table.tsx";
import {render, screen} from "@testing-library/react";
import {vi} from "vitest";
import * as MUI from '@mui/material';

describe('Krm3Table', () => {
    const props = {
        columns: [
            { accessorKey: 'column1', header: 'Column1' },
            { accessorKey: 'column2', header: 'Column2' }
        ],
        data: [
            { column1: 'data11', column2: 'data21' },
            { column1: 'data12', column2: 'data22' }
        ],
        onClickRow: (item: any) => {}
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
        render(<Krm3Table {...props} />)
        vi.spyOn(MUI, 'useMediaQuery').mockReturnValue(true)
        expect(screen.getByTestId("small-screen-table")).toBeInTheDocument()
    })
})