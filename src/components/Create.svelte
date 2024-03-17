<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    import {saveData, deleteData} from "../firebase";

    export let user, create = {}, accounts = [], circles = [];

    ['users', 'tags'].forEach(key => {if (!create[key]) create[key] = []});
    ['access'].forEach(key => {if (!create[key]) create[key] = {}});
    if (!create.color) create.color = '#' + Math.floor(Math.random()*16777215).toString(16);

    if (!create.time) create.time = new Date(); else create.time = new Date(create.time);
    create.time = new Date(create.time.getTime() - (create.time.getTimezoneOffset() * 60000)).toISOString().slice(0, -8);

    let currencies = accounts.map(account => {return Object.keys(account.balance || {})}).flat().filter((value, index, self) => {return self.indexOf(value) === index});
    if (currencies.length<1) currencies = ["KES"];
    const addCurrency = () => {
        if (create.currency) return;
        let currency = prompt("Enter new currency", "");
        if (currency) {
            currency = currency.toUpperCase().trim();
            currencies = [...currencies, currency];
            create.currency = currency;
        } else create.currency = "KES";
    }

    if (create.type === 'transaction') {

    }

    const scanTags = () => {
        let tags = create.name.match(/#\w+/g);
        if (tags) {
            create.tags = [...create.tags, ...tags.map(tag => {return tag.replace('#', '')})];
            create.name = create.name.replace(/#\w+/g, '');
        }
    }

    const setAccountDefaults = () => {
        let account = accounts.filter(account => {return account.id===create.account})[0];
        if (!account) return;
        if (account.balance) create.currency = Object.keys(account.balance)[0];
        ['users', 'access', 'color'].forEach(key => create[key] = account[key]);
    }

    let search = "";
    $: uninvited = circles.filter(u => !create.users.includes(u[user.id].id) && (!search || u[user.id].displayName.toLowerCase().includes(search) || u[user.id].email.includes(search)))
    const find = userID => {
        return new Promise((resolve, reject) => {
            let found = circles.filter(u => {return u[user.id].id===userID})
            if (found.length>0) resolve(found[0]);
            else reject();
        })
    }

    const save = (leave=false) => {
        if (create.time) create.time = new Date(create.time);
        create.users = create.users.filter(u => {return u.length>0});
        emit('loading', true);
        saveData(create.type + 's', create, leave).catch(console.error).finally(() => {
            emit('loading', false);
            emit('close');
        });
    }

    const deleteRecord = id => {
        if (confirm(create.type.toUpperCase() + 'DELETE\nAre you sure you want to delete this? This will delete for every one and it cannot be undone.')) {
            emit('loading', true);
            deleteData(create.type + "s", create.id).catch(console.error).finally(() => {
                emit('loading', false);
                emit('close');
            })
        }
    }


    const remove = id => {
        if (create.access[id] > 4) return;
        if (confirm(create.type.toUpperCase() + !id? 'LEAVE\nAre you sure you want to leave?' : ' DELETE\nAre you sure you want to delete this? This will delete for every one and it cannot be undone.')) {
            emit('loading', true);
            let removeUser = id
            if (!removeUser) removeUser = user.id;
            delete create.access[removeUser]; create.users = create.users.filter(u => u !== removeUser)
            console.log("Updated", create);
            if (!id) save(true);
        }
    }

</script>

<form on:submit|preventDefault={() => save()} class="card bg-white">

    <h1 class="title text-center">{create.type.toUpperCase()} <span class="text-xs">{create.id || ""}</span> </h1>
    <button class="absolute top-0 right-0 mr-6 mt-6 icon" on:click={() => emit("close")}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    </button>

    <div class="card">
        <div class="row">
            <input bind:value={create.name} required type="text" class="flex-1 px-4" placeholder="Name" on:change={scanTags}>
            <input aria-label="Color" type="color" bind:value={create.color} placeholder="Color">
        </div>
        <div class="horizontal-view my-2">
            {#each create.tags as tag}
                <div class="flex pill">
                    <p class="px-1">{tag}</p>
                    <button type="button" on:click={() => create.tags = create.tags.filter(t => t !== tag)} class="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            {/each}
        </div>

        <textarea  bind:value={create.description} class="w-full border px-4" placeholder="Description"></textarea>

        {#if create.type === "transaction"}
            <div class="row justify-between">
                <select class="w-1/2" disabled={create.id} name="Account" bind:value={create.account} on:change={setAccountDefaults}>
                    <option value="">No Account</option>
                    {#each accounts.filter(a => (a.access[user.id] || 0)>1) as account}
                        <option value={account.id}>{account.name}</option>
                    {/each}
                </select>
                <input class="w-1/2" disabled={create.id} required bind:value={create.amount} type="number" step="0.000001" placeholder="Amount">
            </div>
            <div class="row justify-between">
                <input disabled={create.id} bind:value={create.fee} type="number" step="0.0000001" placeholder="Fee"class="w-1/2" >
                <select class="w-1/2" disabled={create.id} name="Account" bind:value={create.currency} on:change={addCurrency} required>
                    {#each currencies as currency}
                        <option value={currency}>{currency}</option>
                    {/each}
                    <option value="">+ Add New</option>
                </select>
            </div>
            <input bind:value={create.time} type="datetime-local">
        {/if}

    </div>

    <div class="mt-4">

        <div class="flex items-center border-b-2 border-primary">
            <div class="z-10 group relative" class:invisible={create.id && (create.access[user.id] || 0) < 4}>
                <button type="button" class="icon mr-2 my-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                </button>
                <div class="hidden focus-within:block group-hover:block absolute top-0 -mt-4 bg-fade border-primary border rounded text-center">
                    <input type="search" class="input lowercase" bind:value={search} placeholder="Email or Name">
                    <ul class="px-2 max-h-32 overflow-y-auto">
                        {#each uninvited as invite}
                            <li on:click={() => create.users = [...create.users, invite[user.id].id]} on:keyup class="flex items-center">
                                <img src={invite[user.id].photoURL} alt="" class="w-5 h-5 bg-primary rounded-full mr-2">
                                <p class="line-clamp-1 no-wrap">{invite[user.id].displayName}</p>
                            </li>
                        {/each}
                    </ul>
                    {#if uninvited.length<1}
                        <button disabled={!create.id} type="button" on:click={() => emit("invite", {target: create.type + "s/" + create.id, email: search})} class="bg-primary rounded text-center text-fade px-4 m-2">Send Invite</button>
                    {/if}
                </div>
            </div>
            <p>{create.users.length} Members</p>
        </div>

        <div class="relative row w-full py-2 mb-2">
            <div class="horizontal-view">
                {#each create.users as id}
                    {#key id}
                        {#await find(id)}
                            <p>Loading User</p>
                        {:then found}
                            <div class="flex w-fit pill" style="background-color: {found[user.id].color}">
                                {#if !create.id || (create.access[user.id] || 0) > 1}
                                    <div class="group">

                                        <div class="w-5 h-5 relative rounded-full">
                                            <img src={found[user.id].photoURL} alt="" class="w-full h-full bg-primary rounded-full">
                                            <div class="absolute top-0 w-full h-full opacity-50 bg-black rounded-full"></div>
                                            <button type="button" class="w-5 h-5 absolute top-0">
                                                {create.access[id] || 1}
                                            </button>
                                        </div>

                                        <div class="hidden absolute group-hover:block -mt-4">
                                            <ul class="mt-6 bg-fade px-2 py-4 rounded">
                                                <li class="hover:text-primary" on:click={() => create.access[id] = 1} on:keydown>1. Viewer</li>
                                                <li class="hover:text-primary" on:click={() => create.access[id] = 2} on:keydown>2. Commenter</li>
                                                <li class="hover:text-primary" on:click={() => create.access[id] = 3} on:keydown>3. Editor</li>
                                                <li class="hover:text-primary" on:click={() => create.access[id] = 4} on:keydown>4. Full</li>
                                                <li class="hover:text-primary" on:click={() => create.access[id] = 5} on:keydown>5. Owner</li>
                                            </ul>
                                        </div>
                                    </div>
                                {/if}
                                <p class="line-clamp-1 px-1">{found[user.id].displayName}</p>
                                {#if !create.id || (create.access[user.id] || 0) > 3}
                                    <button type="button" on:click={() => remove(id)} class="icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                {/if}
                            </div>
                        {:catch e}
                            <p class="hidden">User Not Found</p>
                        {/await}

                    {/key}
                {/each}
            </div>
        </div>

    </div>

    <div class="row justify-between space-x-2">
        {#if create.id && (create.access[user.id] || 0)>3}
            <button type="button" class="bg-gray-400 px-4 text-white rounded flex-1" on:click={deleteRecord}>Delete</button>
        {/if}
        {#if create.id && (create.access[user.id] || 0)<5}
            <button type="button" class="bg-gray-400 px-4 text-white rounded flex-1" on:click={() => remove()}>Leave</button>
        {/if}
        {#if !create.id || (create.access[user.id] || 0)>2}
            <button type="submit" class="bg-primary text-white rounded flex-1">Save</button>
        {/if}
    </div>

</form>