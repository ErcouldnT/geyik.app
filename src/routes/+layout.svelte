<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = pb.authStore.record;

	// onMount(() => {
	// 	if (!pb.authStore.isValid) {
	// 		goto('/auth/login');
	// 	}
	// });

	let { children } = $props();
</script>

<svelte:head>
	<title>Geyik</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav
	class="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-6 py-4 text-gray-200"
>
	<div class="flex space-x-6">
		<a href="/" class="hover:text-white">Geyik</a>
		<a href="/discover" class="hover:text-white">Keşfet</a>
		<a href="/servers" class="hover:text-white">Sunucular</a>
		<a href="/create" class="hover:text-white">Oluştur</a>
		<a href="/messages" class="hover:text-white">Mesajlar</a>
		<a href="/profile" class="hover:text-white">Profilin</a>
	</div>

	{#if user}
		<div class="text-sm text-gray-400">
			👤 {user.username || user.email}
		</div>
	{/if}
</nav>

<main class="p-6 text-gray-100">
	{@render children()}
</main>
