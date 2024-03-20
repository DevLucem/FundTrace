<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();
    export let account;
</script>

<div class="card row cursor-pointer bg-fade mr-4 overflow-hidden" on:click={()=>emit('create', account)} on:keydown>
    <div class="w-4 h-full rounded-l-2xl" style="background-color: {account.color}"></div>
    <div class="p-2 border-t border-b border-r border-primary rounded-r-2xl flex flex-col justify-between">
        <div class="flex text-ellipsis font-bold whitespace-nowrap space-x-2">
            <h2>{account.name}</h2>
            {#if account.users.length > 1}
                <div class="rounded-full flex items-center px-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                        <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
                    </svg>
                    {account.users.length}
                </div>
            {/if}
        </div>
        <div class="row mt-2 overflow-x-auto space-x-2 max-w-[200px]">
            {#each Object.keys(account.balance || {}) as balance}
                <p class="text-xs rounded bg-white border border-primary px-2 py-1 whitespace-nowrap {account.balance[balance]<0? 'text-red-600': 'text-lime-600'}">
                    {account.balance[balance].toCurrency()} {balance}
                </p>
            {/each}
        </div>
    </div>
</div>
