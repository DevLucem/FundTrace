<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    export let transaction;
</script>

<div class="card row bg-fade mr-4 mb-4 w-full">
    <div> <div class="w-2 h-full rounded-l-xl" style="background-color: {transaction.color}"></div> </div>
    <div class="py-1 px-4 border-y border-primary flex-1">
        <h3 class="text-sm font-bold">{transaction.name}</h3>
        <p class="text-xs">{transaction.time.toLocaleString()}</p>
    </div>
    <div class="row border-y border-r border-primary rounded-r-xl items-center">
        <p class="text-xs"><span class="{transaction.amount>=0? 'text-green-500': 'text-red-500'} font-bold text-lg">{transaction.amount}</span> {transaction.currency}</p>
        <button on:click={()=>emit('create', transaction)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
        </button>
    </div>
</div>