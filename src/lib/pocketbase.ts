// src/lib/pb.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase('http://127.0.0.1:8090');

// auth bilgisini localStorage'da sakla
pb.authStore.onChange(() => {
	console.log('Auth store changed', pb.authStore.isValid);
});
