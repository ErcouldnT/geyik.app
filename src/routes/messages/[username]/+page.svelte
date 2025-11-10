<script lang="ts">
	import { pb } from '$lib/pocketbase';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let friendUsername = '';
	let user = pb.authStore.model;
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
				return;
			}

			// Call updates: apply remote answer or remote ICE
			if (e.action === 'update') {
				// If I'm the caller and remote posted an answer
				if (call.caller === user.id && call.answer && pc && !pc.currentRemoteDescription) {
					await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
				}

				// Apply any ICE candidates we haven't used yet
				if (pc && Array.isArray(call.iceCandidates)) {
					for (const c of call.iceCandidates) {
						const key = c?.candidate || JSON.stringify(c);
						if (!key || appliedRemoteCandidates.has(key)) continue;
						try {
							await pc.addIceCandidate(c);
							appliedRemoteCandidates.add(key);
						} catch (err) {
							console.error('addIceCandidate error', err);
						}
					}
				}
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

	async function startCall(video = false) {
		if (!friend) return;

		try {
			isCalling = true;
			pc = new RTCPeerConnection();

			// local media
			try {
				localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
				remoteStream = new MediaStream();
				localStream.getTracks().forEach((track) => pc?.addTrack(track, localStream!));
				pc.ontrack = (event) => {
					event.streams[0].getTracks().forEach((track) => remoteStream?.addTrack(track));
				};
			} catch (err) {
				console.error('getUserMedia error:', err);
				alert('Mikrofon/kamera izni alınamadı.');
				isCalling = false;
				return;
			}

			// SDP offer
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			// Persist the call record FIRST so that subsequent ICE updates have an id to target
			const call = await pb.collection('calls').create({
				caller: user.id,
				callee: friend.id,
				offer,
				iceCandidates: [],
				status: 'calling'
			});

			// Listen for answer and remote ICE on this specific call
			pb.collection('calls').subscribe(call.id, async (e) => {
				const r = e.record;
				if (e.action === 'update') {
					if (r.answer && pc && !pc.currentRemoteDescription) {
						await pc.setRemoteDescription(new RTCSessionDescription(r.answer));
					}
					if (pc && Array.isArray(r.iceCandidates)) {
						for (const c of r.iceCandidates) {
							const key = c?.candidate || JSON.stringify(c);
							if (!key || appliedRemoteCandidates.has(key)) continue;
							try {
								await pc.addIceCandidate(c);
								appliedRemoteCandidates.add(key);
							} catch (err) {
								console.error('addIceCandidate error', err);
							}
						}
					}
				}
			});

			// Push local ICE to the record as plain JSON
			pc.onicecandidate = async (event) => {
				if (!event.candidate) return;
				const cand = event.candidate.toJSON();
				const key = cand.candidate;
				if (appliedLocalCandidates.has(key)) return;
				appliedLocalCandidates.add(key);
				try {
					// merge with latest server state
					const latest = await pb.collection('calls').getOne(call.id);
					const arr = Array.isArray(latest.iceCandidates) ? latest.iceCandidates : [];
					await pb.collection('calls').update(call.id, {
						iceCandidates: [...arr, cand]
					});
				} catch (err) {
					console.error('Update ICE error', err);
				}
			};
		} catch (err) {
			console.error('startCall error:', err);
			alert('Çağrı başlatılamadı.');
			isCalling = false;
		}
	}

	async function answerCall(callRecord: any, video = false) {
		try {
			pc = new RTCPeerConnection();

			try {
				localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
				remoteStream = new MediaStream();
				localStream.getTracks().forEach((track) => pc?.addTrack(track, localStream!));
				pc.ontrack = (event) => {
					event.streams[0].getTracks().forEach((track) => remoteStream?.addTrack(track));
				};
			} catch (err) {
				console.error('getUserMedia error (answer):', err);
				alert('Mikrofon/kamera izni alınamadı.');
				return;
			}

			await pc.setRemoteDescription(new RTCSessionDescription(callRecord.offer));
			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);

			await pb.collection('calls').update(callRecord.id, { answer, status: 'connected' });

			// Consume any existing ICE that the caller may have posted already
			if (Array.isArray(callRecord.iceCandidates)) {
				for (const c of callRecord.iceCandidates) {
					const key = c?.candidate || JSON.stringify(c);
					if (!key || appliedRemoteCandidates.has(key)) continue;
					try {
						await pc.addIceCandidate(c);
						appliedRemoteCandidates.add(key);
					} catch (err) {
						console.error('addIceCandidate error', err);
					}
				}
			}

			// Subscribe for future ICE updates on this call
			pb.collection('calls').subscribe(callRecord.id, async (e) => {
				const r = e.record;
				if (e.action !== 'update' || !pc) return;
				if (Array.isArray(r.iceCandidates)) {
					for (const c of r.iceCandidates) {
						const key = c?.candidate || JSON.stringify(c);
						if (!key || appliedRemoteCandidates.has(key)) continue;
						try {
							await pc.addIceCandidate(c);
							appliedRemoteCandidates.add(key);
						} catch (err) {
							console.error('addIceCandidate error', err);
						}
					}
				}
			});

			// Post my ICE candidates as plain JSON
			pc.onicecandidate = async (event) => {
				if (!event.candidate) return;
				const cand = event.candidate.toJSON();
				const key = cand.candidate;
				if (appliedLocalCandidates.has(key)) return;
				appliedLocalCandidates.add(key);
				try {
					const latest = await pb.collection('calls').getOne(callRecord.id);
					const arr = Array.isArray(latest.iceCandidates) ? latest.iceCandidates : [];
					await pb.collection('calls').update(callRecord.id, {
						iceCandidates: [...arr, cand]
					});
				} catch (err) {
					console.error('Update ICE error (answer)', err);
				}
			};
		} catch (err) {
			console.error('answerCall error:', err);
			alert('Çağrı yanıtlanamadı.');
		}
	}

	async function acceptCall(video = false) {
		if (!incomingCall) return;
		await answerCall(incomingCall, video);
		incomingCall = null;
	}

	async function rejectCall() {
		if (!incomingCall) return;
		await pb.collection('calls').update(incomingCall.id, { status: 'rejected' });
		incomingCall = null;
	}

	function hangUp() {
		isCalling = false;
		if (pc) {
			pc.close();
			pc = null;
		}
		if (localStream) {
			localStream.getTracks().forEach((track) => track.stop());
			localStream = null;
		}
	}
</script>

<main class="flex min-h-screen flex-col bg-gray-900 text-gray-100">
	<header
		class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4"
	>
		<button on:click={() => goto('/messages')} class="text-indigo-400 hover:text-indigo-300">
			← Geri
		</button>
		<h1 class="text-lg font-semibold">{friendUsername} ile Mesajlaşma</h1>
		<div class="flex items-center gap-2">
			<button
				on:click={() => startCall(false)}
				title="Sesli Arama"
				class="rounded bg-gray-700 px-3 py-1 hover:bg-gray-600"
			>
				📞
			</button>
			<button
				on:click={() => startCall(true)}
				title="Görüntülü Arama"
				class="rounded bg-gray-700 px-3 py-1 hover:bg-gray-600"
			>
				🎥
			</button>
		</div>
	</header>

	<section bind:this={chatBoxEl} class="flex flex-1 flex-col space-y-3 overflow-y-auto p-4">
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
		class="sticky bottom-0 flex border-t border-gray-700 bg-gray-800 p-4"
	>
		<input
			class="mr-2 flex-1 rounded bg-gray-700 p-2 text-white"
			placeholder="Mesaj yaz..."
			bind:value={newMessage}
		/>
		<button class="rounded bg-indigo-600 px-4 hover:bg-indigo-700">Gönder</button>
	</form>

	{#if localStream}
		<video
			bind:this={localVideoEl}
			autoplay
			muted
			class="fixed right-4 bottom-20 h-24 w-32 rounded border border-gray-600"
		></video>
	{/if}
	{#if remoteStream}
		<video
			bind:this={remoteVideoEl}
			autoplay
			class="fixed bottom-20 left-4 h-48 w-64 rounded border border-gray-600"
		></video>
	{/if}

	{#if incomingCall}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div class="space-y-4 rounded bg-gray-800 p-6 text-center shadow-md">
				<h2 class="text-lg font-semibold">Gelen Çağrı</h2>
				<p class="text-gray-300">Bir çağrı alıyorsun!</p>
				<div class="mt-4 flex justify-center gap-4">
					<button
						on:click={() => acceptCall(false)}
						class="rounded bg-green-600 px-4 py-2 hover:bg-green-500"
					>
						📞 Kabul Et
					</button>
					<button on:click={rejectCall} class="rounded bg-red-600 px-4 py-2 hover:bg-red-500">
						❌ Reddet
					</button>
				</div>
			</div>
		</div>
	{/if}
</main>
