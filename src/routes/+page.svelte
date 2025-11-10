<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';

	let loggedIn = pb.authStore.isValid;

	function logout() {
		pb.authStore.clear();
		goto('/auth/login');
	}
</script>

<main class="m-10 flex flex-col items-center justify-center space-y-4 text-center">
	<h1 class="h1">Geyik</h1>

	{#if loggedIn}
		<p>Hoşgeldin</p>
		<button on:click={logout} class="rounded bg-red-600 px-4 py-2">Çıkış Yap</button>
	{:else}
		<a class="underline" href="/auth/login">Giriş yap</a>
		<a class="underline" href="/auth/register">Kayıt ol</a>
	{/if}
</main>
