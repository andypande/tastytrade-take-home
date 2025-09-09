<script lang="ts">
	import type { PageData } from './$types';
	import { onMount, onDestroy } from 'svelte';
	
	let { data }: { data: PageData } = $props();
	
	let watchlistName = $state(data.watchlist?.name || '');
	let stockSymbols = $state<string[]>(data.watchlist?.symbols || []);
	let currentSymbol = $state('');
	let errorMessage = $state('');
	let isEditing = $state(false);
	
	let searchResults = $state<any[]>([]);
	let isLoading = $state(false);
	let showResults = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let marketData = $state<Record<string, any>>(data.marketData || {});

	
	let refreshInterval: ReturnType<typeof setInterval>;

	async function fetchMarketData() {
		if (isLoading || stockSymbols.length === 0) return;
		
		isLoading = true;
		
		try {
			const symbolsParam = stockSymbols.join(',');
			
			const response = await fetch(`/api/market-data?symbols=${encodeURIComponent(symbolsParam)}`, {
				method: 'GET'
			});
			
			if (response.ok) {
				const result = await response.json();
				marketData = {...result.marketData};
			} else {
				console.error('Failed to fetch market data:', response.statusText);
			}
		} catch (error) {
			console.error('Error fetching market data:', error);
		} finally {
			isLoading = false;
		}
	}
	
	function toggleEditMode() {
		isEditing = !isEditing;
		if (!isEditing) {
			watchlistName = data.watchlist?.name || '';
			stockSymbols = data.watchlist?.symbols || [];
		}
	}
	
	async function searchSymbols(query: string) {
		clearTimeout(debounceTimer);
		
		if (!query || query.length < 2) {
			searchResults = [];
			showResults = false;
			isLoading = false;
			return;
		}
		
		isLoading = true;
		showResults = true;
		
		debounceTimer = setTimeout(async () => {
			try {
				const response = await fetch(`/api/symbols/search?query=${encodeURIComponent(query)}`);
				if (response.ok) {
					const data = await response.json();
					searchResults = data.results || [];
				} else {
					console.error('Failed to fetch symbols:', response.statusText);
					searchResults = [];
				}
			} catch (error) {
				console.error('Error searching symbols:', error);
				searchResults = [];
			} finally {
				isLoading = false;
			}
		}, 300);
	}
	
	function handleSymbolInput(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		currentSymbol = value;
		searchSymbols(value);
	}
	
	function selectSymbol(symbol: string) {
		currentSymbol = symbol;
		showResults = false;
		searchResults = [];
	}
	
	function addSymbol() {
		if (!currentSymbol) {
			errorMessage = 'Please enter a stock symbol';
			return;
		}
		
		const symbol = currentSymbol.toUpperCase().trim();
		
		if (stockSymbols.includes(symbol)) {
			errorMessage = 'This symbol is already in your list';
			return;
		}
		
		stockSymbols = [...stockSymbols, symbol];
		currentSymbol = '';
		errorMessage = '';
		showResults = false;
		searchResults = [];
	}
	
	function removeSymbol(symbol: string) {
		stockSymbols = stockSymbols.filter(s => s !== symbol);
	}
	
	function handleSubmit(event: Event) {
		if (!watchlistName) {
			errorMessage = 'Please enter a watchlist name';
			event.preventDefault();
			return;
		}
		
		if (stockSymbols.length === 0) {
			errorMessage = 'Please add at least one stock symbol';
			event.preventDefault();
			return;
		}
	}
	
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('#symbol-search-container')) {
			showResults = false;
		}
	}
	
	onMount(() => {
		if (stockSymbols.length > 0) {
			fetchMarketData();
		}
		
		refreshInterval = setInterval(() => {
			if (!isEditing) {
				fetchMarketData();
			}
		}, 5000);
		
		document.addEventListener('click', handleClickOutside);
		
		isEditing = false;
		
		return () => {
			document.removeEventListener('click', handleClickOutside);
			clearTimeout(debounceTimer);
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		};
	});
	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
</script>

<svelte:head>
	<title>{data.watchlist?.name || 'Watchlist'} - TastyTrade</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="mb-8 flex justify-between items-center">
			<div>
				<h1 class="text-3xl font-bold text-gray-900">{watchlistName}</h1>
				<p class="text-gray-600 mt-2">
					{#if stockSymbols.length === 1}
						1 stock symbol
					{:else}
						{stockSymbols.length} stock symbols
					{/if}
				</p>
			</div>
			
			<div>
				{#if !isEditing}
					<button
						type="button"
						onclick={toggleEditMode}
						aria-label="Edit watchlist"
						class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Edit Watchlist
					</button>
				{/if}
			</div>
		</div>
		
		
		<div class="bg-white shadow rounded-lg p-6">
			{#if isEditing}
				<form 
					method="POST" 
					action="?/updateWatchlist"
					onsubmit={handleSubmit}
					class="space-y-6"
				>
					<div>
						<label for="watchlist-name" class="block text-sm font-medium text-gray-700 mb-1">
							Watchlist Name
						</label>
						<input
							id="watchlist-name"
							name="name"
							type="text"
							required
							bind:value={watchlistName}
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						/>
					</div>
					
					<div>
						<label for="stock-symbol" class="block text-sm font-medium text-gray-700 mb-1">
							Add Stock Symbol
						</label>
						<div class="relative" id="symbol-search-container">
							<div class="flex space-x-2">
								<div class="flex-1 relative">
									<input
										id="stock-symbol"
										type="text"
										bind:value={currentSymbol}
										oninput={handleSymbolInput}
										class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
										placeholder="Start typing to search"
										autocomplete="off"
									/>
									{#if isLoading}
									<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
										<svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
											<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
									</div>
									{/if}
								</div>
								<button
									type="button"
									onclick={addSymbol}
									aria-label="Add symbol"
									class="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Add
								</button>
							</div>
							
							{#if showResults && searchResults.length > 0}
							<div class="absolute left-0 right-0 z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
								<ul class="py-1">
									{#each searchResults as result}
										<li 
											class="px-4 py-2 cursor-pointer flex items-center justify-between"
										>
											<button 
												class="cursor-pointer flex-1 min-w-0 mr-2 text-left hover:bg-gray-100"
												type="button"
												aria-label="Select symbol"
												onclick={() => selectSymbol(result.symbol)}
											>
												<span class="font-medium">{result.symbol}</span>
												<p class="text-sm text-gray-500 truncate">{result.description}</p>
											</button>
											<span class="text-xs bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap">
												{result['instrument-type']}
											</span>
										</li>
									{/each}
								</ul>
							</div>
							{:else if showResults && currentSymbol.length >= 2 && !isLoading}
								<div class="absolute left-0 right-0 z-10 mt-1 bg-white shadow-lg rounded-md border border-gray-200">
									<div class="px-4 py-3 text-sm text-gray-500">
										No results found for "{currentSymbol}"
									</div>
								</div>
							{/if}
						</div>
						{#if errorMessage}
							<p class="mt-1 text-sm text-red-600">{errorMessage}</p>
						{/if}
					</div>
					
					<div>
						<label 
							class="block text-sm font-medium text-gray-700 mb-2"
							for="stock-symbols"
						>
							Stock Symbols ({stockSymbols.length})
						</label>
						<div class="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-60 overflow-y-auto">
							{#if stockSymbols.length > 0}
								<ul class="flex flex-wrap gap-2" id="stock-symbols">
									{#each stockSymbols as symbol}
										<li class="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center">
											{symbol}
											<button 
												type="button" 
												onclick={() => removeSymbol(symbol)}
												class="cursor-pointer ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
												aria-label="Remove symbol"
											>
												<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
												</svg>
											</button>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="text-gray-500 text-center py-2">No symbols added yet</p>
							{/if}
						</div>
					</div>
					
					<input type="hidden" name="symbols" value={JSON.stringify(stockSymbols)} />
					<input type="hidden" name="id" value={data.watchlist?.name} />
					
					<div class="flex justify-end space-x-3">
						<button
							type="button"
							onclick={toggleEditMode}
							aria-label="Cancel"
							class="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							Cancel
						</button>
						<button
							type="submit"
							class="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							aria-label="Save changes"
						>
							Save Changes
						</button>
					</div>
				</form>
			{:else}
				<div class="space-y-6">
					<div>
						<div class="flex justify-between items-center mb-4">
							<h2 class="text-lg font-medium text-gray-900">Symbols</h2>
							{#if isLoading}
							<span class="inline-flex items-center text-xs text-gray-500">
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Refreshing...
							</span>
							{:else}
								<span class="text-xs text-gray-500">Auto-refreshing every 5s</span>
							{/if}
						</div>
						
						{#if stockSymbols.length > 0}
							<div class="overflow-x-auto">
								<table class="min-w-full divide-y divide-gray-200">
									<thead class="bg-gray-50">
										<tr>
											<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Symbol
											</th>
											<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Bid
											</th>
											<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Ask
											</th>
											<th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Last
											</th>
										</tr>
									</thead>
									<tbody class="bg-white divide-y divide-gray-200">
										{#each stockSymbols as symbol}
											{@const marketInfo = marketData?.[symbol]}
											<tr>
												<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{symbol}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{#if marketInfo?.bid && marketInfo.bid !== '--'}
														${parseFloat(marketInfo.bid).toFixed(2)}
													{:else}
														--
													{/if}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{#if marketInfo?.ask && marketInfo.ask !== '--'}
														${parseFloat(marketInfo.ask).toFixed(2)}
													{:else}
														--
													{/if}
												</td>
												<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{#if marketInfo?.last && marketInfo.last !== '--'}
														${parseFloat(marketInfo.last).toFixed(2)}
													{:else}
														--
													{/if}
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{:else}
							<p class="text-gray-500 text-center py-4">No symbols in this watchlist</p>
						{/if}
					</div>
					
					<div class="flex justify-between items-center pt-4 border-t border-gray-200">
						<a 
							href="/dashboard" 
							class="text-blue-600 hover:text-blue-800 font-medium"
							aria-label="Back to Dashboard"
						>
							Back to Dashboard
						</a>
						
						<form method="POST" action="?/deleteWatchlist" class="inline">
							<input type="hidden" name="name" value={data.watchlist?.name} />
							<button 
								type="submit" 
								class="cursor-pointer text-red-600 hover:text-red-800 font-medium flex items-center"
								aria-label="Delete watchlist"
							>
								<svg class="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
								Delete Watchlist
							</button>
						</form>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>