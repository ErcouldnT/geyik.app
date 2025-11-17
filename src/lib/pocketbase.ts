// src/lib/pb.ts
import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://geyikdb.erkut.dev');

// auth bilgisini localStorage'da sakla
pb.authStore.onChange(() => {
	console.log('Auth store changed', pb.authStore.isValid);
});
