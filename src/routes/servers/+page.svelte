<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	let servers = [];
	let userId = pb.authStore.model?.id;

	onMount(async () => {
		if (!pb.authStore.isValid) return;
		servers = await pb.collection('servers').getFullList({
			filter: `members ?~ "${userId}"`,
			sort: '-created'
		});
	});
</script>

<main class="p-6 text-gray-100 dark:bg-gray-900 dark:text-gray-300">
	<h1 class="mb-6 text-2xl font-bold">Katıldığın Sunucular</h1>

	{#if servers.length === 0}
		<p class="text-gray-400 dark:text-gray-500">Henüz bir sunucuya katılmadın.</p>
	{:else}
		<ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each servers as server}
				<li class="rounded bg-gray-800 p-4 shadow dark:bg-gray-800">
					{#if server.avatar}
						<img
							src={`https://geyikdb.erkut.dev/api/files/servers/${server.id}/${server.avatar}`}
							alt="Avatar"
							class="mb-3 h-40 w-full rounded object-cover"
						/>
					{/if}
					<h2 class="text-lg font-semibold">{server.name}</h2>
					<p class="text-sm text-gray-400 dark:text-gray-400">{server.description}</p>
				</li>
			{/each}
		</ul>
	{/if}
</main>
