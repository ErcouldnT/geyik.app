<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pocketbase';
	import { user } from '$lib/stores/user';
	import { Monitor, Apple, Terminal } from '@lucide/svelte';
	import { Zap, MessageSquare, Image as ImageIcon } from '@lucide/svelte';

	function logout() {
		pb.authStore.clear();
		goto('/auth/login');
	}
</script>

<main
	class="mx-auto flex w-full max-w-md flex-col items-center justify-center space-y-4 text-center"
>
	<h1 class="mb-4 h1">Geyik</h1>
	<p class="mb-10 opacity-50">Sohbet et, sunucular oluştur, dosya paylaş — hepsi tek yerde.</p>

	{#if $user}
		<p class="mb-6 text-lg">
			Hoş geldin <span class="font-semibold">{$user.username || $user.email}</span> 👋
		</p>

		<a href="/servers" class="btn w-full preset-outlined-surface-300-700">Sunuculara Git</a>

		<button on:click={logout} class="mt-4 btn w-full preset-filled-error-500"> Çıkış Yap </button>
	{:else}
		<a class="btn w-full preset-outlined-surface-300-700" href="/auth/login"> Tek Tıkla Gir </a>

		<div class="mt-10 w-full space-y-4 text-left">
			<div>
				<h2 class="flex items-center gap-2 font-semibold">
					<Zap size="18" /> Hızlı
				</h2>
				<p class="opacity-60">Kayıt bile gerekmez, tek tıkla gir.</p>
			</div>

			<div>
				<h2 class="flex items-center gap-2 font-semibold">
					<MessageSquare size="18" /> Topluluk
				</h2>
				<p class="opacity-60">Sunucular oluştur, arkadaşlarınla hemen sohbete başla.</p>
			</div>

			<div>
				<h2 class="flex items-center gap-2 font-semibold">
					<ImageIcon size="18" /> Paylaşım
				</h2>
				<p class="opacity-60">Dosya, resim ve daha fazlasını kolayca paylaş.</p>
			</div>
		</div>

		<div class="mt-10 w-full space-y-4">
			<h2 class="mb-2 font-semibold">Masaüstü Uygulamaları</h2>

			<div class="grid w-full grid-cols-3 gap-3">
				<a
					href="/downloads/geyik-windows.exe"
					class="btn flex w-full flex-col items-center justify-center gap-2 preset-outlined-surface-300-700 py-4"
				>
					<Monitor size="22" />
					<span>Windows</span>
				</a>

				<a
					href="/downloads/geyik-mac.dmg"
					class="btn flex w-full flex-col items-center justify-center gap-2 preset-outlined-surface-300-700 py-4"
				>
					<Apple size="22" />
					<span>macOS</span>
				</a>

				<a
					href="/downloads/geyik-linux.AppImage"
					class="btn flex w-full flex-col items-center justify-center gap-2 preset-outlined-surface-300-700 py-4"
				>
					<Terminal size="22" />
					<span>Linux</span>
				</a>
			</div>
		</div>
	{/if}
</main>
