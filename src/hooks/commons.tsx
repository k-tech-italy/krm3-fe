import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { getCurrentUser } from "../restapi/user";



export function useGetCurrentUser() {
    const userQuery = useQuery(['user', 'current'], () => getCurrentUser(), {
        staleTime: Infinity,  // never reload
        cacheTime: Infinity,  // never reload
        retry: false,
        onError: () => window.location.replace('/login')
    });
    return userQuery.data;
}
// Update media query

export const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const updateMatch = () => setMatches(media.matches);

        updateMatch();
        media.addEventListener("change", updateMatch);

        return () => media.removeEventListener("change", updateMatch);
    }, [query]);

    return matches;
};