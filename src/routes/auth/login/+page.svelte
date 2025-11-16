<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';

	async function login() {
		error = '';

		// Basit validation
		if (!email || !password) {
			error = 'E‑posta ve şifre alanları doldurulmalı.';
			return;
		}

		try {
			// Giriş dene
			await pb.collection('users').authWithPassword(email, password);
			goto('/');
		} catch (err: any) {
			// Kullanıcı yok veya şifre yanlış — otomatik kayıt senaryosu
			if (err?.message?.includes('Failed to authenticate')) {
				try {
					await pb.collection('users').create({
						email,
						password,
						passwordConfirm: password
					});

					// Kayıt sonrası giriş
					await pb.collection('users').authWithPassword(email, password);
					goto('/');
				} catch (registerErr: any) {
					error = 'Kayıt başarısız: ' + registerErr.message;
				}
			} else {
				error = 'Giriş başarısız: ' + err.message;
			}
		}
	}
</script>

<main class="flex flex-col items-center justify-center">
	<h1 class="mb-2 h1">Tek Tıkla Gir</h1>
	<p class="mb-10 opacity-50">Merak etme, hesabın yoksa otomatik oluşturacağım.</p>

	<form class="w-full max-w-md space-y-4 p-4" on:submit|preventDefault={login}>
		<fieldset class="space-y-4">
			<!-- Input -->
			<label class="label">
				<span class="label-text">E‑posta</span>
				<input class="input" type="email" placeholder="E‑posta" bind:value={email} />
			</label>

			<!-- Password -->
			<label class="label">
				<span class="label-text">Şifre</span>
				<input class="input" type="password" placeholder="Şifre" bind:value={password} />
			</label>
		</fieldset>

		<fieldset class="flex justify-end">
			<button type="submit" class="btn preset-outlined-surface-300-700">Giriş Yap</button>
		</fieldset>

		{#if error}
			<p class="mt-2 text-sm text-red-400">{error}</p>
		{/if}
	</form>
</main>
