<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user as userStore } from '$lib/stores/user';
	import { Phone, Video, PhoneIncoming, PhoneOff } from '@lucide/svelte';

	let friendUsername = '';
	let user = $userStore;
	let friend: any = null;
	let messages: any[] = [];
	let newMessage = '';
	let chatBoxEl: HTMLDivElement | null = null;

	let pc: RTCPeerConnection | null = null;
	let localStream: MediaStream | null = null;
	let remoteStream: MediaStream | null = null;

	let localVideoEl: HTMLVideoElement | null = null;
	let remoteVideoEl: HTMLVideoElement | null = null;

	$: if (localVideoEl && localStream) {
		localVideoEl.srcObject = localStream;
	}
	$: if (remoteVideoEl && remoteStream) {
		remoteVideoEl.srcObject = remoteStream;
	}

	let isCalling = false;
	let incomingCall: any = null;

	const unsubscribeFns: (() => void)[] = [];

	const appliedRemoteCandidates = new Set<string>();
	const appliedLocalCandidates = new Set<string>();

	onMount(async () => {
		const params = $page.params;
		friendUsername = params.username;

		if (!pb.authStore.isValid) {
			goto('/auth/login');
			return;
		}

		await loadFriend();
		await loadMessages();
		subscribeMessages();
		subscribeCalls();
	});

	async function loadFriend() {
		try {
			friend = await pb.collection('users').getFirstListItem(`username="${friendUsername}"`);
		} catch (err) {
			console.error('Arkadaş bulunamadı:', err);
			goto('/messages');
		}
	}

	async function loadMessages() {
		if (!friend) return;
		const filter = `(sender="${user.id}" && receiver="${friend.id}") || (sender="${friend.id}" && receiver="${user.id}")`;
		const result = await pb.collection('dms').getFullList({
			filter,
			sort: 'created'
		});
		messages = result;
		scrollToBottom();
	}

	function subscribeMessages() {
		pb.collection('dms').subscribe('*', (e) => {
			if (e.action === 'create') {
				const msg = e.record;
				if (
					(msg.sender === user.id && msg.receiver === friend.id) ||
					(msg.sender === friend.id && msg.receiver === user.id)
				) {
					messages = [...messages, msg];
					scrollToBottom();
				}
			}
		});
	}

	function subscribeCalls() {
		// Listen for any call records related to this conversation
		pb.collection('calls').subscribe('*', async (e) => {
			const call = e.record;

			// Only react to calls between me and this friend
			const related =
				(call.caller === user.id && call.callee === friend?.id) ||
				(call.caller === friend?.id && call.callee === user.id);

			if (!related) return;

			// New incoming call for me
			if (e.action === 'create' && call.callee === user.id && call.status === 'calling') {
				incomingCall = call;
				return alert('Yeni bir çağrı alıyorsun!');
			}
		});
	}

	async function sendMessage() {
		if (!newMessage.trim()) return;

		await pb.collection('dms').create({
			sender: user.id,
			receiver: friend.id,
			content: newMessage.trim()
		});

		newMessage = '';
		scrollToBottom();
	}

	function scrollToBottom() {
		if (chatBoxEl) {
			chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
		}
	}
</script>

<main class="mx-auto flex w-full max-w-lg flex-col bg-gray-900 text-gray-100">
	<header class="z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4">
		<button on:click={() => goto('/messages')} class="text-indigo-400 hover:text-indigo-300">
			← Geri
		</button>
		<h1 class="text-lg font-semibold">{friendUsername}</h1>
		<div class="flex items-center gap-2">
			<button
				on:click={() => null}
				title="Sesli Arama"
				class="rounded bg-gray-700 px-3 py-1 hover:bg-gray-600"
			>
				<Phone class="h-5 w-5" />
			</button>
			<button
				on:click={() => null}
				title="Görüntülü Arama"
				class="rounded bg-gray-700 px-3 py-1 hover:bg-gray-600"
			>
				<Video class="h-5 w-5" />
			</button>
		</div>
	</header>

	<section bind:this={chatBoxEl} class="flex max-h-[70vh] flex-col space-y-3 overflow-y-auto p-4">
		{#each messages as msg}
			<div class="flex {msg.sender === user.id ? 'justify-end' : 'justify-start'}">
				<div
					class="max-w-xs rounded p-2 text-sm"
					class:bg-indigo-600={msg.sender === user.id}
					class:bg-gray-700={msg.sender !== user.id}
				>
					{msg.content}
					<p class="mt-1 text-xs text-gray-400">{new Date(msg.created).toLocaleTimeString()}</p>
				</div>
			</div>
		{/each}
	</section>

	<form
		on:submit|preventDefault={sendMessage}
		class="flex border-t border-gray-700 bg-gray-800 p-4"
	>
		<input
			class="mr-2 flex-1 rounded bg-gray-700 p-2 text-white"
			placeholder="Mesaj yaz..."
			bind:value={newMessage}
		/>
		<button class="rounded bg-indigo-600 px-4 hover:bg-indigo-700">Gönder</button>
	</form>
</main>
