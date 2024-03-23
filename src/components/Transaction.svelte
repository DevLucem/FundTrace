<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    export let transaction;
</script>

<div class="flex w-full border-y border-r border-primary rounded-xl mb-4 hover:cursor-pointer" on:click={() => emit('create', transaction)} on:keydown>
    <div class="flex-none">
        <div class="w-2 h-full rounded-l-xl border-l border-y border-primary" style="background-color: {transaction.color}"></div>
    </div>
    <div class="flex-1 py-1 ml-2">
        <div class="flex overflow-x-auto">
            <h1 class="line-clamp-1">{transaction.name}</h1>
            {#each transaction.tags || [] as tag}
                <p class="px-1 pill">{tag}</p>
            {/each}
        </div>
        <div class="flex flex-nowrap items-center">
            {#if transaction.users.length > 1}
                <div class="rounded-full flex items-center px-2 py-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
                    </svg>
                    {transaction.users.length}
                </div>
            {/if}
            <p class="text-xs">{transaction.time.toLocaleString()}</p>
        </div>
    </div>
    <div class="flex-none rounded-r-xl mr-2">
        <p class="font-bold text-2xl" class:text-green-500={transaction.amount>0} class:text-red-500={transaction.amount<0} >{transaction.amount.toCurrency()}</p>
        <p class="text-xs text-end">
            <span class:text-green-500={(transaction.fee || 0) < 0} class:text-red-500={(transaction.fee || 0) > 0}>{transaction.fee || 0}</span>
            <span class="text-xs">{transaction.currency}</span>
        </p>
    </div>
</div>