import {User} from "./types";
import {restapi} from "./restapi";

export function getCurrentUser(): Promise<User> {
    return restapi.get<User>(`/core/user/me/`).then(res => res.data);
}

export function logout(): Promise<void> {
    return restapi.post(`/core/user/logout/`)
}