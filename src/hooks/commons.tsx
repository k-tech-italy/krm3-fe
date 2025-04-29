import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getCurrentUser, logout } from "../restapi/user";
import { AxiosError } from "axios";

export function useGetCurrentUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery(["user", "current"], () => getCurrentUser(), {
    // Cache data for 5 minutes before considering it stale
    staleTime: 5 * 60 * 1000,
    // Keep data in cache for 30 minutes even when not used
    cacheTime: 30 * 60 * 1000,
    // Don't retry automatically on errors
    retry: false,
 
  });

  const refreshUser = async () => {
    return queryClient.invalidateQueries(["user", "current"]);
  };

  const clearUser = () => {
    queryClient.setQueryData(["user", "current"], null);
  };

  return {
    ...userQuery,
    refreshUser,
    clearUser,
    isAuthenticated: !!userQuery.data && !userQuery.isError,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation(() => logout(), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
      window.location.replace("/login");
    },
    onError: (error: AxiosError) => {},
  });
}

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);

    updateMatch();
    media.addEventListener("change", updateMatch);

    return () => media.removeEventListener("change", updateMatch);
  }, [query]);

  return matches;
};
