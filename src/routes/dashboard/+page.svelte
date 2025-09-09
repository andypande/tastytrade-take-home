<script lang="ts">
	import type { PageData } from './$types';
	import type { Watchlist } from '$lib/types/api';
	import { onMount } from 'svelte';
    import { enhance } from '$app/forms';
    import { slide } from 'svelte/transition';

	let { data }: { data: PageData } = $props();
    let watchlists = $state<Watchlist[]>(data.watchlists);
    let deleting = $state<string[]>([]);
	let showNotification = $state(false);
	let notificationType = $state('');
	let notificationMessage = $state('');
	let notificationTimeout: ReturnType<typeof setTimeout>;
    onMount(() => {
        const url = new URL(window.location.href);
        const notification = url.searchParams.get('notification');
        const name = url.searchParams.get('name');
        
        if (notification) {
            showNotification = true;
            
            switch (notification) {
                case 'watchlist-created':
                    notificationType = 'success';
                    notificationMessage = `Watchlist "${name}" created successfully`;
                    break;
                case 'watchlist-updated':
                    notificationType = 'success';
                    notificationMessage = `Watchlist "${name}" updated successfully`;
                    break;
                case 'watchlist-deleted':
                    notificationType = 'success';
                    notificationMessage = 'Watchlist deleted successfully';
                    break;
                default:
                    showNotification = false;
            }
            
            url.searchParams.delete('notification');
            url.searchParams.delete('name');
            window.history.replaceState({}, '', url);
            
            notificationTimeout = setTimeout(() => {
                showNotification = false;
            }, 5000);
        }
        
        return () => {
            clearTimeout(notificationTimeout);
        };
	});
</script>

<svelte:head>
	<title>Dashboard - TastyTrade Watchlist</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		{#if showNotification}
			<div class={`mb-6 p-4 rounded-md ${notificationType === 'success' ? 'bg-white border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
				<div class="flex items-center justify-between">
					<div class="flex items-center">
						{#if notificationType === 'success'}
							<svg class="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
							</svg>
						{:else}
							<svg class="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						{/if}
						<p>{notificationMessage}</p>
					</div>
					<button 
						type="button" 
						class="text-gray-400 hover:text-gray-500"
                        aria-label="Close notification"
						onclick={() => showNotification = false}
					>
						<span class="sr-only">Close</span>
						<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
							<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		{/if}        
		<div class="flex justify-between items-center mb-8">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p class="text-gray-600">Welcome back, {data.session.user.username}!</p>
			</div>
		</div>

        <div class="bg-white shadow rounded-lg p-6 mb-8">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-lg font-medium text-gray-900">Watchlists</h2>				
				<a 
					href="/watchlist"
                    aria-label="Create watchlist"
					class="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium inline-block"
				>
					Create Watchlist
				</a>
			</div>
            <hr class="border-t border-gray-300 my-4">


			{#if watchlists.length === 0}
				<div class="text-center py-8 text-gray-500">
					<p>You don't have any watchlists yet.</p>
					<a 
						href="/watchlist"
                        aria-label="Create watchlist"
						class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium inline-block"
					>
						Create your first watchlist
					</a>
				</div>
			{:else}
				<ul class="divide-y divide-gray-200">
					{#each watchlists as watchlist (watchlist.name)}
                    {#if !deleting.includes(watchlist.name)}  
						<li class="py-4" out:slide>
							<div class="flex items-center justify-between">
								<div>
									<h3 class="text-md font-medium text-gray-900">{watchlist.name}</h3>
									{#if watchlist.group_name}
										<p class="text-sm text-gray-500">Group: {watchlist.group_name}</p>
									{/if}
								</div>
								<div class="flex space-x-2">
                                    <a 
                                        href="/watchlist/{watchlist.name}" 
                                        class="inline-flex items-center justify-center px-3 py-1.5 mr-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                    View
                                  </a>
                                  <form method="POST" 
                                    action="?/deleteWatchlist" 
                                    class="inline-block"
                                    use:enhance={() => {
                                        deleting = [...deleting, watchlist.name];

                                        return async ({ update }) => {
                                            await update();
                                            watchlists = watchlists.filter(w => w.name !== watchlist.name);
                                            deleting = deleting.filter(name => name !== watchlist.name);
                                        };
                                    }}
                                    >
                                    <input type="hidden" name="watchlistName" value={watchlist.name} />
                                    <button 
                                      type="submit" 
                                      class="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      aria-label="Delete watchlist"
                                      aria-disabled={deleting.includes(watchlist.name)}
                                    >
                                      Delete
                                    </button>
                                  </form>
								</div>
							</div>
						</li>
                        {/if}
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>