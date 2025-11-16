<script lang="ts">
	import { user } from '$lib/stores/user';
	import { User as UserIcon } from '@lucide/svelte';
</script>

<nav class="flex items-center justify-between px-6 py-4">
	<div class="flex space-x-6">
		<a href="/" class="hover:text-white">Geyik</a>
		<a href="/explore" class="hover:text-white">Keşfet</a>
		<a href="/servers" class="hover:text-white">Sunucular</a>
		<a href="/create" class="hover:text-white">Oluştur</a>
		<a href="/messages" class="hover:text-white">Mesajlar</a>
		<a href="/profile" class="hover:text-white">Profilin</a>
	</div>

	{#if $user}
		<div class="flex items-center gap-2 text-sm">
			<UserIcon size="16" />
			{$user.username || $user.email}
		</div>
	{/if}
</nav>
