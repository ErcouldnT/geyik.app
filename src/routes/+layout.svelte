<script lang="ts">
	import '../app.css';
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import { user as userStore } from '$lib/stores/user';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';

	let user = pb.authStore.record;
	userStore.set(user);

	onMount(() => {
		const unsubscribe = pb.authStore.onChange((token, model) => {
			userStore.set(model ?? null);
		});

		return () => unsubscribe();
	});

	let { children } = $props();
</script>

<svelte:head>
	<title>Geyik</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<main class="flex min-h-screen flex-col">
	<Navigation />
	{@render children()}
</main>
