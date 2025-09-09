<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    let { form }: { form: ActionData } = $props();
    let loading = $state(false);
    const handleSubmit = () => {
        loading = true;
        return async ({update}: {update: () => Promise<void>}) => {
            await update();
            loading = false;
        }
    }
</script>

<svelte:head>
    <title> Login - TastyTrade Watchlist </title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h1 class="mt-6 text-center text-2xl">
             TastyTrade Watchlist
            </h1>
            <h2 class="mt-2 text-center text-lg">
             Sign in to your account
            </h2>
        </div>
    
        <form 
            method="POST"
            action="?/login"
            use:enhance={handleSubmit}
            class="mt-8 space-y-6"
            novalidate
        >
            <div class="space-y-4">
                <div>
                    <label for="username" class="sr-only">Username</label>
                    <input 
                        id="username"
                        name="username"
                        type="text"
                        required
                        class="relative block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Username"
                        value={form?.username || ''}
                        disabled={loading}
                        aria-describedby={form?.error ? 'error-message' : ''}
                        aria-invalid={form?.error? 'true' : 'false'}
                    />
                </div>
                <div class="relative">
                    <label for="password" class="sr-only">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        class="relative block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Password"
                        disabled={loading}
                        aria-describedby={form?.error ? 'error-message' : ''}
                        aria-invalid={form?.error ? 'true' : 'false'}
                    />
                </div>
            </div>  

            {#if form?.error}
                <div 
                    id="error-message"
                    class="rounded-md p-4"
                    role="alert"
                    aria-live="polite"
                >
                    <div class="flex">
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-600">
                                {form.error}
                            </h3>
                        </div>
                    </div>
                </div>
            {/if}


            <div>
                <button 
                    type="submit"
                    disabled={loading}
                    class="relative bg-blue-600 text-white w-full flex justify-center py-2 px-4 border border-gray text-sm font-medium cursor-pointer rounded-md"
                    aria-label="Sign in"
                    aria-disabled={loading}
                >
                <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                </button>
            </div>
        </form>

        <div class="text-center">
            <p class="mt-2 text-sm">
                Login into this world class application to start building watchlists
            </p>
        </div>
    </div>
</div>