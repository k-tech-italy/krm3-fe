import {createContext, useContext} from "react";
import {useGetCurrentUser} from "../../hooks/useAuth.tsx";
import {User} from "../../restapi/types.ts";


const AuthContext = createContext<{
  user: User | undefined;
}>({
  user: undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user } = useGetCurrentUser();

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);