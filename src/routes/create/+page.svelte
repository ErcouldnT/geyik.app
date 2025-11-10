<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	let name = '';
	let description = '';
	let avatar: File | null = null;
	let error = '';

	async function createServer() {
		try {
			const formData = new FormData();
			formData.append('name', name);
			formData.append('description', description);
			formData.append('owner', pb.authStore.record.id);
			formData.append('members', pb.authStore.record.id); // kendini otomatik ekle
			if (avatar) formData.append('avatar', avatar);

			await pb.collection('servers').create(formData);
			goto('/servers');
		} catch (err) {
			error = 'Sunucu oluşturulamadı: ' + err.message;
		}
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center text-gray-100">
	<div class="w-full max-w-md rounded bg-gray-800 p-6 shadow">
		<h1 class="mb-6 text-center text-2xl font-semibold">Yeni Sunucu Oluştur</h1>

		<input
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			placeholder="Sunucu Adı"
			bind:value={name}
		/>

		<textarea
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			placeholder="Açıklama"
			bind:value={description}
		></textarea>

		<input
			class="mb-3 w-full text-sm text-gray-300"
			type="file"
			accept="image/*"
			on:change={(e) => (avatar = e.target.files[0])}
		/>

		<button on:click={createServer} class="w-full rounded bg-indigo-600 p-2 hover:bg-indigo-700">
			Oluştur
		</button>

		{#if error}
			<p class="mt-3 text-sm text-red-400">{error}</p>
		{/if}
	</div>
</main>
