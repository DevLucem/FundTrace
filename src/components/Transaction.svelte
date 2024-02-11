<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    export let transaction;
</script>

<div class="row mr-4 mb-4 w-full hover:cursor-pointer" on:click={() => emit('create', transaction)} on:keydown>
    <div> <div class="w-2 h-full rounded-l-xl" style="background-color: {transaction.color}"></div> </div>
    <div class="py-1 px-4 border-y border-primary flex-1">
        <h3 class="text-sm font-bold">{transaction.name}</h3>
        <p class="text-xs">{transaction.time.toLocaleString()}</p>
    </div>
    <div class="flex border-y border-r border-primary rounded-r-xl pr-4">
        <p class="text-xs text-end my-auto">
            <span class="text-xs">{transaction.currency}</span>
            <br>
            <span>{transaction.fee || 0}</span>
        </p>
        <p class="{transaction.amount>=0? 'text-green-500': 'text-red-500'} font-bold text-2xl">{transaction.amount}</p>
    </div>
</div>