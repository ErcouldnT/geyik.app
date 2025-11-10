<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let user = pb.authStore.model;
	let username = user?.username || '';
	let avatar: File | null = null;
	let error = '';
	let success = '';

	onMount(() => {
		if (!pb.authStore.isValid) {
			goto('/auth/login');
		}
	});

	async function updateProfile() {
		try {
			const formData = new FormData();
			formData.append('username', username);
			if (avatar) formData.append('avatar', avatar);

			await pb.collection('users').update(user.id, formData);
			success = 'Profil güncellendi!';
			user = await pb.collection('users').getOne(user.id);
			pb.authStore.save(pb.authStore.token, user);
		} catch (err) {
			error = 'Profil güncellenemedi: ' + err.message;
		}
	}

	function logout() {
		pb.authStore.clear();
		goto('/auth/login');
	}
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-gray-100">
	<div class="w-full max-w-md rounded bg-gray-800 p-6 shadow">
		<h1 class="mb-6 text-center text-2xl font-semibold">Profil</h1>

		{#if user?.avatar}
			<img
				src={`http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}`}
				alt="Avatar"
				class="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
			/>
		{/if}

		<p class="mb-4 text-center text-gray-400">{user?.email}</p>

		<label class="mb-2 block text-sm text-gray-400">Kullanıcı Adı</label>
		<input
			class="mb-3 w-full rounded bg-gray-700 p-2 text-white"
			bind:value={username}
			placeholder="Kullanıcı adı"
		/>

		<label class="mb-2 block text-sm text-gray-400">Yeni Avatar (isteğe bağlı)</label>
		<input
			class="mb-3 w-full text-sm text-gray-300"
			type="file"
			accept="image/*"
			on:change={(e) => (avatar = e.target.files[0])}
		/>

		<button on:click={updateProfile} class="w-full rounded bg-indigo-600 p-2 hover:bg-indigo-700">
			Güncelle
		</button>

		<button on:click={logout} class="mt-3 w-full rounded bg-red-600 p-2 hover:bg-red-700">
			Çıkış Yap
		</button>

		{#if success}
			<p class="mt-3 text-sm text-green-400">{success}</p>
		{/if}

		{#if error}
			<p class="mt-3 text-sm text-red-400">{error}</p>
		{/if}
	</div>
</main>
