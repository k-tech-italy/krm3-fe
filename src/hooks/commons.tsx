import {useQuery} from "react-query";
import {getMissions} from "../restapi/expense";
import {getCurrentUser} from "../restapi/user";
import { useState, useEffect } from "react";

export function useGetMissions() {
    return useQuery('missions', () => getMissions(),{
        onError: (error) => {
            return 'error'
        }
    });
}

export function useGetCurrentUser() {
    const userQuery = useQuery(['user', 'current'], () => getCurrentUser(), {
        staleTime: Infinity,  // never reload
        cacheTime: Infinity,  // never reload
        retry: false,
    });
    return userQuery.data;
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
};




