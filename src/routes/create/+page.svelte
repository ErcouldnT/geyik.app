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

<main class="flex flex-col items-center justify-center">
	<h1 class="mb-2 h1">Yeni Sunucu Oluştur</h1>
	<p class="mb-10 opacity-50">Sunucunu birkaç saniyede oluştur.</p>

	<form class="w-full max-w-md space-y-4 p-4" on:submit|preventDefault={createServer}>
		<fieldset class="space-y-4">
			<!-- Sunucu Adı -->
			<label class="label">
				<span class="label-text">Sunucu Adı</span>
				<input class="input" type="text" placeholder="Sunucu Adı" bind:value={name} />
			</label>

			<!-- Açıklama -->
			<label class="label">
				<span class="label-text">Açıklama</span>
				<textarea
					class="textarea rounded-container"
					rows="4"
					placeholder="Açıklama"
					bind:value={description}
				></textarea>
			</label>

			<!-- Avatar -->
			<label class="label">
				<span class="label-text">Avatar</span>
				<input
					class="input"
					type="file"
					accept="image/*"
					on:change={(e) => (avatar = e.target.files[0])}
				/>
			</label>
		</fieldset>

		<fieldset class="flex justify-end">
			<button type="submit" class="btn preset-outlined-surface-300-700">Oluştur</button>
		</fieldset>

		{#if error}
			<p class="mt-2 text-sm text-red-400">{error}</p>
		{/if}
	</form>
</main>
