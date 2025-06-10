import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { clearToken } from "../restapi/oauth";
import { getCurrentUser, logout } from "../restapi/user";


export function useLogout() {
  // const queryClient = useQueryClient();
  return useMutation(() => logout(), {
    onSuccess: () => {
      clearToken();
      // queryClient.invalidateQueries({ queryKey: ["user", "current"] });
      window.location.replace("/login");
    },
    onError: (error: AxiosError) => { },
  });
}export function useGetCurrentUser() {
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

  const isAuthenticated = !!userQuery.data && !userQuery.isError;

  const isSuperUser = isAuthenticated && userQuery.data?.isSuperuser;

  const userCan = (permissions: string[]) => {
    if (!isAuthenticated) return false;
    if (isSuperUser) return true; // Superusers have all permissions
    const userPermissions = userQuery.data?.permissions || [];
    return permissions.every((perm) => userPermissions.includes(perm));
  };

  return {
    ...userQuery,
    refreshUser,
    clearUser,
    isAuthenticated,
    userCan,
  };
}

