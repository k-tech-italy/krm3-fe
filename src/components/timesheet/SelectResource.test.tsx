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
        fireEvent.click(document.getElementById("resource-select") as HTMLElement);
        expect(screen.getByText("Jan Kowal")).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText("Anna Nowak")).toBeInTheDocument()
            expect(screen.getByText("Aleksander Kwasniewski")).toBeInTheDocument()
        })
        expect(screen.getByText("Anna Nowak")).toBeInTheDocument()
        expect(screen.getByText("Aleksander Kwasniewski")).toBeInTheDocument()
    })

})