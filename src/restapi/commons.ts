import { restapi } from './restapi';
import { KrmUser } from './types';


export function getUserDetails() {
	return restapi.get<KrmUser>(`tmp-user/`).then(res => res.data);
}
