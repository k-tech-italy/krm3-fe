import { useQuery } from 'react-query';

import { getUserDetails } from '../restapi/commons';


// read current user
export function useUserDetails() {
	const userQuery = useQuery(['user'], () => getUserDetails(), {
		staleTime: Infinity, cacheTime: Infinity,  // never reload
	});

	// TODO in case of access token expired
	return userQuery.data;
}
