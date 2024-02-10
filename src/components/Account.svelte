<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();
    export let account;
</script>

<div class="card row cursor-pointer bg-fade mr-4 overflow-hidden" on:click={()=>emit('create', account)} on:keydown>
    <div class="w-4 h-full rounded-l-2xl" style="background-color: {account.color}"></div>
    <div class="p-2 border-t border-b border-r border-primary rounded-r-2xl">
        <h3 class="text-ellipsis font-bold whitespace-nowrap">{account.name}</h3>
        <div class="row my-2 overflow-x-scroll space-x-2 max-w-[200px]">
            {#each Object.keys(account.balance || {}) as balance}
                <p class="text-xs rounded bg-white border border-primary px-2 py-1 whitespace-nowrap {account.balance[balance]<0? 'text-red-600': 'text-lime-600'}">
                    {Math.round(account.balance[balance] * 100000000) / 100000000} {balance}
                </p>
            {/each}
        </div>
    </div>
</div>
