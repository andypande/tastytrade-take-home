<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="flex justify-center items-center min-h-screen p-8 bg-gray-100">
  <div class="max-w-lg p-8 bg-white rounded-lg shadow-md text-center">
    <h1 class="text-5xl font-bold mb-2 text-red-600">{$page.status} Error</h1>
    <h2 class="text-xl mb-6 text-gray-700 font-medium">{$page.error?.message || 'Something went wrong'}</h2>
    
    {#if $page.status === 404}
      <p class="mb-6 text-gray-700">The page you're looking for doesn't exist.</p>
      <div class="text-left my-6">
        <h3 class="text-lg mb-2 text-gray-700">You might want to:</h3>
        <ul class="list-disc pl-6">
          <li class="mb-2">Check the URL for typos</li>
          <li class="mb-2">Go back to the <a href="/" class="text-blue-600 font-medium hover:underline">home page</a></li>
          <li class="mb-2">Visit your <a href="/dashboard" class="text-blue-600 font-medium hover:underline">dashboard</a></li>
          <li class="mb-2">View your <a href="/watchlist" class="text-blue-600 font-medium hover:underline">watchlists</a></li>
        </ul>
      </div>
    {:else if $page.status === 401 || $page.status === 403}
      <p class="mb-6 text-gray-700">You don't have permission to access this resource.</p>
      <div class="text-left my-6">
        <h3 class="text-lg mb-2 text-gray-700">You might want to:</h3>
        <ul class="list-disc pl-6">
          <li class="mb-2">Log in or check your credentials</li>
          <li class="mb-2">Go back to the <a href="/" class="text-blue-600 font-medium hover:underline">home page</a></li>
        </ul>
      </div>
    {:else if $page.status === 500}
      <p class="mb-6 text-gray-700">Our server encountered an error. Please try again later.</p>
      <div class="text-left my-6">
        <h3 class="text-lg mb-2 text-gray-700">You might want to:</h3>
        <ul class="list-disc pl-6">
          <li class="mb-2">Refresh the page</li>
          <li class="mb-2">Go back to the <a href="/" class="text-blue-600 font-medium hover:underline">home page</a></li>
          <li class="mb-2">Try again later</li>
        </ul>
      </div>
    {:else}
      <p class="mb-6 text-gray-700">An unexpected error occurred.</p>
      <div class="text-left my-6">
        <h3 class="text-lg mb-2 text-gray-700">You might want to:</h3>
        <ul class="list-disc pl-6">
          <li class="mb-2">Go back to the <a href="/" class="text-blue-600 font-medium hover:underline">home page</a></li>
          <li class="mb-2">Try again later</li>
        </ul>
      </div>
    {/if}
  </div>
</div>