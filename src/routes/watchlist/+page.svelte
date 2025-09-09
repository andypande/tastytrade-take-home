<script lang="ts">
	import { enhance } from '$app/forms';
	let watchlistName = $state('');
	let stockSymbols = $state<string[]>([]);
	let currentSymbol = $state('');
	let errorMessage = $state('');
	
	let searchResults = $state<any[]>([]);
	let isLoading = $state(false);
	let showResults = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let isCreating = $state(false);
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
	
</script>

<svelte:head>
	<title>Create Watchlist - TastyTrade</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Create New Watchlist</h1>
			<p class="text-gray-600 mt-2">Add stocks to track in your watchlist</p>
		</div>
		
			<div class="bg-white shadow rounded-lg p-6">
				<form 
					method="POST" 
					action="?/createWatchlist"
					onsubmit={handleSubmit}
					use:enhance={() => {
						isCreating = true;
						return async ({ update }) => {
							await update();
							isCreating = false;
						};
					}}
					class="space-y-6"
				>
					<div>
						<label for="watchlist-name" class="block text-sm font-medium text-gray-700 mb-1">
							Watchlist Name
						</label>
						<input
							id="watchlist-name"
							name="watchlist-name"
							type="text"
							required
							bind:value={watchlistName}
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="My Tech Stocks"
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
					
					{#if stockSymbols.length > 0}
						<div>
							<label 
								class="block text-sm font-medium text-gray-700 mb-2"
								for="stock-symbols"
							>
								Stock Symbols ({stockSymbols.length})
							</label>
							<div class="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-40 overflow-y-auto">
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
							</div>
						</div>
						
						<input type="hidden" name="symbols" value={JSON.stringify(stockSymbols)} />
					{/if}
					
					<div class="flex justify-end space-x-3">
						<a
							href="/dashboard"
							class="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							aria-label="Cancel"
						>
							Cancel
						</a>
						<button
						type="submit"
						class="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
						aria-label="Create watchlist"
						disabled={isCreating}
					>
						{#if isCreating}
							<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Creating...
						{:else}
							Create Watchlist
						{/if}
					</button>
					</div>
				</form>
			</div>
	</div>
</div>