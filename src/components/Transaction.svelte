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
        <p class="font-bold text-2xl" class:text-green-500={transaction.amount>0} class:text-red-500={transaction.amount<0} >{transaction.amount.toCurrency()}</p>
        <p class="text-xs text-start pl-1 pt-2">
            <span class="text-xs">{transaction.currency}</span>
            <br>
            <span class:text-green-500={(transaction.fee || 0) < 0} class:text-red-500={(transaction.fee || 0) > 0}>{transaction.fee || 0}</span>
        </p>
    </div>
</div>