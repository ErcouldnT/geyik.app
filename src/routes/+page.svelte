<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores/user';

	function logout() {
		pb.authStore.clear();
		goto('/auth/login');
	}
</script>

<main class="flex flex-col items-center justify-center space-y-4 p-10 text-center">
	<h1 class="h1">Geyik</h1>

	{#if $user}
		<p>Hoşgeldin</p>
		<button on:click={logout} class="btn preset-filled-error-500">Çıkış Yap</button>
	{:else}
		<a class="underline" href="/auth/login">Tek Tıkla Gir</a>
	{/if}
</main>
