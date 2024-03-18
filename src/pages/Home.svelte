<script>
    import {createEventDispatcher} from 'svelte';
    const emit = createEventDispatcher();

    import Transaction from "../components/Transaction.svelte";
    import Account from "../components/Account.svelte";

    export const tab = "home";
    export let accounts, transactions;

    // Select accounts to hide and save in local storage. They wont be shown in the UI
    let hiddenAccounts = JSON.parse(localStorage.getItem("hiddenAccounts")) || [];
    $: localStorage.setItem("hiddenAccounts", JSON.stringify(hiddenAccounts));

    // Calculate the money in/out of each currency in all transactions
    let balance = {}; $: { balance = {};
        transactions.forEach(transaction => {
            if (!balance[transaction.currency]) balance[transaction.currency] = {credit: 0, debit: 0};
            if (transaction.amount > 0) balance[transaction.currency].credit += transaction.amount;
            else balance[transaction.currency].debit += transaction.amount;
        })
    }
</script>

<div>

    <div class="row p-2 mx-4 mt-4 items-center">
        <button on:click={() => emit("create", {type: "account"})} class="icon mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
        <h2 class="font-bold">Accounts ({accounts.length - hiddenAccounts.length} / {accounts.length})</h2>
        <div class="group flex">
            <button class="mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                    <path fill-rule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clip-rule="evenodd" />
                    <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                </svg>
            </button>
            <div class="group-hover:inline-block hidden absolute bg-primary card">
                <ul>
                    {#each accounts as account}
                        <li>
                            <label>
                                <input type="checkbox" bind:group={hiddenAccounts} value={account.id}/>
                                {account.name}
                            </label>
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>

    <div class="flex overflow-x-auto px-6">
        <div class="flex flex-nowrap">
            {#each accounts.filter(a => !hiddenAccounts.includes(a.id)) as account}
                <Account {account} on:create/>
            {/each}
        </div>
    </div>

</div>

<div>

    <div class="horizontal-view p-2 mx-4 mt-4 items-center">
        <button on:click={() => emit("create", {type: "transaction"})} class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
        <div class="row my-2 overflow-x-auto flex-1 pr-6 space-x-2">
            <h2 class="font-bold whitespace-nowrap ml-2">Transactions ({transactions.length})</h2>
            {#each Object.keys(balance) as currency}
                <p class="pill group whitespace-nowrap h-fit">
                    <span class="text-primary font-bold">{currency}</span>
                    <span>{(balance[currency].credit + balance[currency].debit).toCurrency()}</span>
                    <span class="group-hover:inline-block hidden bg-fade -my-1 px-1 py-0.5 rounded-bl-full rounded-r-full -mr-1">
                        <span class="text-green-500">{balance[currency].credit.toCurrency()}</span> /
                        <span class="text-red-500">{balance[currency].debit.toCurrency()}</span>
                    </span>
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