<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let passwordConfirm = '';
	let error = '';

	async function register() {
		try {
			await pb.collection('users').create({
				email,
				password,
				passwordConfirm
			});
			await pb.collection('users').authWithPassword(email, password);
			goto('/');
		} catch (err) {
			error = 'Kayıt başarısız: ' + err.message;
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center">
	<div class="w-80 rounded bg-gray-800 p-6 shadow">
		<h1 class="mb-4 text-center text-xl font-semibold">Kayıt Ol</h1>

		<input
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			bind:value={email}
			placeholder="E-posta"
			type="email"
		/>

		<input
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			bind:value={password}
			placeholder="Şifre"
			type="password"
		/>

		<input
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			bind:value={passwordConfirm}
			placeholder="Şifre (tekrar)"
			type="password"
		/>

		<button on:click={register} class="w-full rounded bg-green-600 p-2">Kayıt Ol</button>

		{#if error}
			<p class="mt-2 text-sm text-red-400">{error}</p>
		{/if}
	</div>
</main>
