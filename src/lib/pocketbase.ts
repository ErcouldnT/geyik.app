// src/lib/pb.ts
import PocketBase from 'pocketbase';
import { PB_URL } from '$lib/config';

export const pb = new PocketBase(PB_URL);

pb.authStore.onChange(() => {
	console.log('Auth store changed', pb.authStore.isValid);
});
