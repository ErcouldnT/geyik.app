<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	let servers = [];
	let searchTerm = '';

	onMount(async () => {
		await loadServers();
	});

	async function loadServers() {
		servers = await pb.collection('servers').getFullList({ sort: '-created' });
	}

	async function searchServers() {
		if (!searchTerm) {
			await loadServers();
			return;
		}

		servers = await pb.collection('servers').getFullList({
			filter: `name ~ "${searchTerm}"`,
			sort: '-created'
		});
	}
</script>

<main class="p-6 text-gray-100">
	<h1 class="mb-6 text-2xl font-bold">Sunucu Bul</h1>

	<div class="mb-6 flex space-x-2">
		<input
			class="flex-1 rounded bg-gray-700 p-2 text-white"
			placeholder="Sunucu ara..."
			bind:value={searchTerm}
		/>
		<button on:click={searchServers} class="rounded bg-indigo-600 px-4 hover:bg-indigo-700">
			Ara
		</button>
	</div>

	{#if servers.length === 0}
		<p class="text-gray-400">Henüz sunucu yok.</p>
	{:else}
		<ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each servers as server}
				<li class="rounded bg-gray-800 p-4 shadow">
					{#if server.avatar}
						<img
							src={`http://127.0.0.1:8090/api/files/servers/${server.id}/${server.avatar}`}
							alt="Avatar"
							class="mb-3 h-40 w-full rounded object-cover"
						/>
					{/if}
					<h2 class="text-lg font-semibold">{server.name}</h2>
					<p class="text-sm text-gray-400">{server.description}</p>
				</li>
			{/each}
		</ul>
	{/if}
</main>
