import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import SelectResource from "./SelectResource.tsx";
import {vi} from "vitest"
import * as useAuth from "../../hooks/useAuth";
import * as useMissions from "../../hooks/useMissions";

describe('SelectResource', () => {
    const setSelectedResourceMock = vi.fn();
    beforeEach(() => {
        vi.spyOn(useAuth, 'useGetCurrentUser').mockReturnValue({
            data: {
                resource: {
                    id: 1,
                    firstName: "Jan",
                    lastName: "Kowal"
                }
            },
            userCan: () => true,
        } as any)
        vi.spyOn(useMissions, 'useGetActiveResources').mockReturnValue(
            [
                {
                    id: 1,
                    firstName: "Jan",
                    lastName: "Kowal"
                },
                {
                    id: 2,
                    firstName: "Anna",
                    lastName: "Nowak"
                },
                {
                    id: 3,
                    firstName: "Aleksander",
                    lastName: "Kwasniewski"
                },
            ] as any
    )
    })
    it('renders correctly', () => {
        render(<SelectResource setSelectedResourceId={setSelectedResourceMock}/>);
        expect(screen.getByText("Jan Kowal")).toBeInTheDocument()
    })
    it('calls setSelectedResourceId with correct params, after selecting resource', async () => {
        render(<SelectResource setSelectedResourceId={setSelectedResourceMock}/>);
        const selectControl = screen.getByText('Jan Kowal');
        fireEvent.mouseDown(selectControl);
        const annaNowakOption = await screen.findByText('Anna Nowak');
        fireEvent.click(annaNowakOption);
        await waitFor(() => {
            expect(setSelectedResourceMock).toHaveBeenCalledWith(2);
        });
    })
    it('does not render select when there are no resources', () => {
        vi.spyOn(useMissions, 'useGetActiveResources').mockReturnValue(
            []
        )
        render(<SelectResource setSelectedResourceId={setSelectedResourceMock}/>);
        expect(document.getElementById("resource-select") as HTMLSelectElement).not.toBeInTheDocument();
    })
    it('renders with null defaultValue when user has no resource', () => {
        vi.spyOn(useAuth, 'useGetCurrentUser').mockReturnValue({
            data: {
                resource: null
            },
            userCan: () => true,
        } as any)
        render(<SelectResource setSelectedResourceId={setSelectedResourceMock}/>);
        const select = screen.getByText('Select a resource');
        expect(select).toBeInTheDocument();
    })
    it('calls setSelectedResourceId with null when clearing selection', async () => {
        render(<SelectResource setSelectedResourceId={setSelectedResourceMock}/>);
        const clearButton = document.querySelector('[aria-label="Clear value"]');
        if (clearButton) {
            fireEvent.mouseDown(clearButton);
            await waitFor(() => {
                expect(setSelectedResourceMock).toHaveBeenCalledWith(null);
            });
        }
    })

})