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

})