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

<main class="flex flex-col items-center justify-center">
	<div class="w-full max-w-md">
		<h1 class="mb-6 text-center text-2xl font-semibold">Profil</h1>

		{#if user?.avatar}
			<img
				src={`http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}`}
				alt="Avatar"
				class="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
			/>
		{/if}

		<p class="mb-4 text-center text-gray-400">{user?.email}</p>

		<!-- Username -->
		<label class="label">
			<span class="label-text">Kullanıcı Adı</span>
			<input class="input" type="text" bind:value={username} placeholder="Kullanıcı adı" />
		</label>

		<!-- Avatar File Input -->
		<label class="label">
			<span class="label-text">Avatar</span>
			<input
				class="input"
				type="file"
				accept="image/*"
				on:change={(e) => (avatar = e.target.files[0])}
			/>
		</label>

		<button on:click={updateProfile} class="mt-4 btn w-full preset-outlined-surface-300-700">
			Güncelle
		</button>

		<button on:click={logout} class="mt-3 btn w-full preset-filled-error-500">Çıkış Yap</button>

		{#if success}
			<p class="mt-3 text-sm text-green-400">{success}</p>
		{/if}

		{#if error}
			<p class="mt-3 text-sm text-red-400">{error}</p>
		{/if}
	</div>
</main>
