import {User} from "./types";
import {restapi} from "./restapi";

export function getCurrentUser(): Promise<User> {
    return restapi.get<User>(`users/me`).then(res => res.data);
}
