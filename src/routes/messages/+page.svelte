<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let searchName = '';
	let foundUser: any[] = [];
	let requests: any[] = [];
	let accepted: any[] = [];
	let error = '';
	let success = '';

	let userId: string | undefined = undefined;

	onMount(async () => {
		if (!pb.authStore.isValid) return;
		userId = pb.authStore.model?.id;
		pb.authStore.onChange(() => {
			userId = pb.authStore.model?.id;
		});
		await loadRequests();
	});

	async function searchUser() {
		error = '';
		success = '';
		foundUser = [];

		try {
			const q = searchName.trim();
			if (!q) {
				error = 'Lütfen arama yapmak için bir kullanıcı adı gir.';
				return;
			}

			// Username alanına göre arama
			const safeQ = q.replace(/"/g, '\\"');
			const result = await pb.collection('users').getList(1, 50, {
				filter: `username ~ "${safeQ}" && id != "${userId}"`,
				sort: 'username'
			});

			console.log('Arama sonucu:', result.items);

			foundUser = result.items;

			if (foundUser.length === 0) {
				error = 'Kullanıcı bulunamadı.';
			} else {
				success = `${foundUser.length} kullanıcı bulundu.`;
			}
		} catch (err) {
			console.error('searchUser error:', err);
			error = 'Arama başarısız: ' + (err.message || 'Bilinmeyen hata');
			foundUser = [];
		}
	}

	async function sendRequest(targetUser: any) {
		try {
			if (!userId) {
				error = 'Oturum geçersiz. Lütfen tekrar giriş yapın.';
				return;
			}

			// Kendini eklemeye çalışma
			if (targetUser.id === userId) {
				error = 'Kendini arkadaş olarak ekleyemezsin.';
				return;
			}

			// Zaten arkadaş veya bekleyen istek var mı?
			const existing = await pb.collection('friends').getFullList({
				filter: `(requester="${userId}" && receiver="${targetUser.id}") || (receiver="${userId}" && requester="${targetUser.id}")`
			});

			if (existing.length > 0) {
				error = 'Bu kullanıcıyla zaten bir arkadaşlık isteği veya ilişki mevcut.';
				return;
			}

			const newRequest = {
				requester: userId,
				receiver: targetUser.id,
				status: 'pending'
			};

			await pb.collection('friends').create(newRequest);

			success = `Arkadaş isteği ${targetUser.username} kullanıcısına gönderildi!`;
			error = '';
			foundUser = [];
			await loadRequests();
		} catch (err) {
			console.error(err);
			error = 'İstek gönderilemedi: ' + (err.message || 'Bilinmeyen hata');
		}
	}

	async function loadRequests() {
		const all = await pb.collection('friends').getFullList({
			filter: `(requester="${userId}" || receiver="${userId}")`,
			expand: 'requester,receiver'
		});

		requests = all.filter((f) => f.status === 'pending');
		accepted = all.filter((f) => f.status === 'accepted');
	}

	async function acceptRequest(id: string) {
		await pb.collection('friends').update(id, { status: 'accepted' });
		await loadRequests();
	}

	async function rejectRequest(id: string) {
		await pb.collection('friends').delete(id);
		await loadRequests();
	}
</script>

<main class="p-6 text-gray-100">
	<h1 class="mb-6 text-2xl font-bold">Arkadaşlar & Mesajlar</h1>

	<!-- Kullanıcı Arama -->
	<div class="mb-6 rounded bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold">Arkadaş Ekle</h2>
		<div class="flex space-x-2">
			<input
				class="flex-1 rounded bg-gray-700 p-2 text-white"
				placeholder="Kullanıcı adı ara..."
				bind:value={searchName}
			/>
			<button on:click={searchUser} class="rounded bg-indigo-600 px-4 hover:bg-indigo-700">
				Ara
			</button>
		</div>

		{#if foundUser && foundUser.length > 0}
			<div class="mt-4 space-y-3">
				{#each foundUser as user}
					<div class="flex items-center justify-between rounded bg-gray-700 p-3">
						<div>
							<p class="font-medium">{user.username}</p>
							<p class="text-sm text-gray-400">{user.email}</p>
						</div>
						<button
							on:click={() => sendRequest(user)}
							class="rounded bg-green-600 px-3 py-1 hover:bg-green-700"
						>
							Ekle
						</button>
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<p class="mt-2 text-sm text-red-400">{error}</p>
		{/if}
		{#if success}
			<p class="mt-2 text-sm text-green-400">{success}</p>
		{/if}
	</div>

	<!-- Bekleyen İstekler -->
	<div class="mb-6 rounded bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold">Bekleyen İstekler</h2>
		{#if requests.length === 0}
			<p class="text-gray-400">Bekleyen isteğin yok.</p>
		{:else}
			<ul class="space-y-3">
				{#each requests as req}
					<li class="flex items-center justify-between rounded bg-gray-700 p-3">
						<div>
							<p class="font-medium">
								{req.expand.requester.id === userId
									? `Sen → ${req.expand.receiver.username}`
									: `${req.expand.requester.username} → Sana`}
							</p>
						</div>

						{#if req.expand.receiver.id === userId && req.status === 'pending'}
							<div class="space-x-2">
								<button
									on:click={() => acceptRequest(req.id)}
									class="rounded bg-green-600 px-3 py-1 hover:bg-green-700"
								>
									Kabul Et
								</button>
								<button
									on:click={() => rejectRequest(req.id)}
									class="rounded bg-red-600 px-3 py-1 hover:bg-red-700"
								>
									Reddet
								</button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<!-- Arkadaşlar -->
	<div class="rounded bg-gray-800 p-4">
		<h2 class="mb-3 text-lg font-semibold">Arkadaşlar</h2>
		{#if accepted.length === 0}
			<p class="text-gray-400">Henüz arkadaşın yok.</p>
		{:else}
			<ul class="space-y-3">
				{#each accepted as fr}
					<li class="flex items-center justify-between rounded bg-gray-700 p-3">
						<div>
							<p class="font-medium">
								{fr.expand.requester.id === userId
									? fr.expand.receiver.username
									: fr.expand.requester.username}
							</p>
						</div>
						<button
							class="rounded bg-indigo-600 px-3 py-1 hover:bg-indigo-700"
							on:click={() =>
								goto(
									`/messages/${fr.expand.requester.id === userId ? fr.expand.receiver.username : fr.expand.requester.username}`
								)}
						>
							Mesaj
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</main>
