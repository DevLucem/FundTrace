<script>
    import {createEventDispatcher} from 'svelte';
    const emit = createEventDispatcher();

    import Transaction from "../components/Transaction.svelte";
    import Account from "../components/Account.svelte";

    export const tab = "home";
    export let accounts, transactions;

    // Calculate the money in/out of each currency in all transactions
    let balance = {}; transactions.forEach(transaction => {
        if (!balance[transaction.currency]) balance[transaction.currency] = {credit: 0, debit: 0};
        if (transaction.amount > 0) balance[transaction.currency].credit += transaction.amount;
        else balance[transaction.currency].debit += transaction.amount;
    })
</script>

<div>

    <div class="row p-2 mx-4 mt-4 items-center">
        <button on:click={() => emit("create", {type: "account"})} class="icon mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
        <h2 class="font-bold">Accounts ({accounts.length})</h2>
    </div>

    <div class="flex overflow-x-auto px-6">
        <div class="flex flex-nowrap">
            {#each accounts as account}
                <Account {account} on:create/>
            {/each}
        </div>
    </div>

</div>

<div>


    <div class="horizontal-view p-2 mx-4 mt-4 items-center">
        <button on:click={() => emit("create", {type: "transaction"})} class="icon mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
        <h2 class="font-bold">Transactions ({transactions.length})</h2>
        <div class="row my-2 overflow-x-auto flex-1 px-6 space-x-2">
            {#each Object.keys(balance) as currency}
                <p class="pill">
                    {currency} :
                    <span>{balance[currency].credit}</span> / <span>{balance[currency].debit}</span>
                </p>
            {/each}
        </div>
    </div>

    <div class="m-4 px-4">
        {#each transactions as transaction}
            {#key transaction.id}
                <Transaction {transaction} on:create/>
            {/key}
        {/each}
    </div>

</div>

<button class="absolute bottom-0 right-0 icon mb-20 mr-6" on:click={() => emit("create", {type: "transaction"})} on:dblclick={() => emit("create", {type: "account"})}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
</button>