import {useEffect, useState} from "react";


//interface for component
export interface ExpenseInterface {
    id: number,
    dataExpense: string,
    category: string,
    currency: string,
    currencyAmount: number,
    currencyEUR: number,
    isPaid: boolean,
    typeOfPayment: string
}

export interface MissionInterface {
    id: number,
    place: string,
    dataStartMission:string,
    dataEndMission: string,
    costumer: string,
    expense: ExpenseInterface[]
}


// Update media query
export const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener("resize", listener);
        return () => window.removeEventListener("resize", listener);
    }, [matches, query]);

    return matches;
}
