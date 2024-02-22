<script>

    import Create from "./components/Create.svelte";

    if ("serviceWorker" in navigator)
        navigator.serviceWorker.register("/serviceWorker.js")
            .then(() => console.log("Service worker registered!"))
            .catch(err => console.error("Failed to register service worker", err))

    import "./style.css"
    import {listenData, saveData} from "./firebase";
    import AuthenticationButton from "./components/AuthenticationButton.svelte";

    import router from "page"
    import Landing from "./pages/Landing.svelte";
    import Calendar from "./pages/Calendar.svelte";
    import Home from "./pages/Home.svelte";
    import Notification from "./pages/Notification.svelte";
    import Circle from "./pages/Circle.svelte";

    let current, params; [
        ["/calendar", Calendar],
        ["/home", Home],
        ["/notification", Notification],
        ["/circle", Circle],
        ["**", Landing],
    ].forEach(route => router(route[0], context => {
        params = context.params;
        current = route[1]
    })); router.start();


    let tab, loading, create;
    let accounts = [], accountsListener,
        allTransactions = [], transactionsListener,
        circles = [], circlesListener;

    let transactions = [], filter = {
        search: "", account: "", tags: [],
        scanTags: () => {
            let tags = filter.search.match(/#\w+/g);
            if (tags) {
                filter.tags = [...filter.tags, ...tags.map(tag => {return tag.replace('#', '')})];
                filter.search = filter.search.replace(/#\w+/g, '');
            }
        },
        filter: () => {

            console.log(!filter.search, !filter.account, filter.tags.length<1, !filter.min, !filter.max, !filter.start, !filter.end);
            if (!filter.search && !filter.account && filter.tags.length<1 && !filter.min && !filter.max && !filter.start && !filter.end) return transactions = allTransactions;

            filter.search = filter.search.toLowerCase();
            transactions = allTransactions.filter(transaction => {

                const name = !(filter.search && !transaction.name.toLowerCase().includes(filter.search));
                const tags = filter.tags.length < 1 || filter.tags.every(tag => transaction.tags?.includes(tag));
                const amount = (!filter.min || Math.abs(transaction.amount) >= filter.min) && (!filter.max || Math.abs(transaction.amount) <= filter.max);
                const date = (!filter.start || transaction.time >= new Date(filter.start)) && (!filter.end || transaction.time <= new Date(filter.end));
                const account = (!filter.account || filter.account === transaction.account);

                return name && tags && amount && date && account;

            });
        }
    };
    $: if (filter) filter.filter();
    $: console.log(filter);

    let oldUser;
    let user; $: if (user && user!==oldUser) {

        oldUser = user;
        console.log("####### User Update");

        if (accountsListener) accountsListener();
        accountsListener = listenData("accounts", result => {
            console.log("Accounts", result.length);
            accounts = result;
        });

        if (transactionsListener) transactionsListener();
        transactionsListener = listenData("transactions", result => {
            console.log("Transactions", result.length);
            allTransactions = result.sort((a, b) => b.time - a.time);
            filter.filter();
        });

        if (circlesListener) circlesListener();
        circlesListener = listenData("circles", result => {
            console.log("Circles", result.length);
            circles = result;
        });

    }

    const invite = ({detail: {target, email}}) => {

        if (!target) return alert("Select something to invite user");
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) email = prompt("Enter user email to invite", email);
        if (!email) return;
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid email address");
        email = email.toLowerCase().trim();

        loading = true;
        saveData("notifications", {
            target, source: "users/" + user.id,
            from: {displayName: user.displayName, photoURL: user.photoURL, id: user.id, email: user.email},
            title: "Fund Trace Invite",
            type: "notification",
            contact: email,
            message: "You have been invited on Fund Trace. Login with the same email address to join Fund Trace and be added to an account. <a href='https://fundtrace.web.app/notifications'>https://fundtrace.web.app/notifications</a>",
        }).then(() => alert("Invitation sent to " + email))
            .catch(console.error)
            .finally(() => loading = false);

    }

</script>

<svelte:head>
    <title>Fund Trace</title>
</svelte:head>

<main class="flex flex-col h-screen w-screen relative">

    <nav class="flex px-4 py-2 items-center shadow">
        <a href="/" class="title">Fund Trace</a>

        <div class="flex-1"></div>

        <div class=" group flex">

            <button class="mr-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8">
                    <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM5 3.75a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75ZM4.25 17a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM17.25 17a.75.75 0 0 0 0-1.5h-5.5a.75.75 0 0 0 0 1.5h5.5ZM9 10a.75.75 0 0 1-.75.75h-5.5a.75.75 0 0 1 0-1.5h5.5A.75.75 0 0 1 9 10ZM17.25 10.75a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5h1.5ZM14 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM10 16.25a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                </svg>
            </button>

            <form class="card hidden flex-1 absolute md:w-1/2 lg:w-1/3 right-0 z-10 bg-primary focus-within:block group-hover:block">
                <input type="search" bind:value={filter.search} class="input w-full" placeholder="Search" on:change={filter.scanTags}>

                <div class="horizontal-view my-2 justify-between">
                    {#each filter.tags as tag}
                        <div class="flex pill">
                            <p class="px-1">{tag}</p>
                            <button on:click={() => filter.tags = filter.tags.filter(t => t !== tag)} class="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    {/each}
                </div>

                <div class="horizontal-view w-full justify-between mt-2">
                    <h2 class="w-1/4">Amount:</h2>
                    <input type="number" bind:value={filter.min} class="w-1/3 mx-1" placeholder="Min">
                    <input type="number" bind:value={filter.max} class="w-1/3 mx-1" placeholder="Max">
                </div>

                <div class="horizontal-view w-full justify-between mt-2">
                    <h2 class="w-1/4">Dates:</h2>
                    <input type="date" bind:value={filter.start} class="w-1/3 mx-1" placeholder="Start">
                    <input type="date" bind:value={filter.end} class="w-1/3 mx-1" placeholder="End">
                </div>

                <div class="horizontal-view w-full justify-between mt-2">
                    <select bind:value={filter.account}>
                        <option value="">All Accounts</option>
                        {#each accounts as account}
                            <option value={account.id}>{account.name}</option>
                        {/each}
                    </select>
                    <button type="reset">Clear</button>
                </div>

            </form>

        </div>

        <AuthenticationButton bind:user {loading} on:loading={e=>loading=e.detail}/>
    </nav>

    {#key user}
        <section class="flex flex-col flex-1 overflow-auto">
            <svelte:component this={current} {params} {user} {accounts} {transactions} {circles} {filter} on:invite={invite} on:loading={e => loading = e.detail} on:create={e => create = e.detail} bind:tab/>
        </section>
    {/key}

    <footer class="flex justify-around py-4 bg-white shadow shadow-4xl">

        <a href="/calendar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8" class:text-primary={tab==='calendar'}>
                <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
                <path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" />
            </svg>
        </a>

        <a href="/home">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8" class:text-primary={tab==='home'}>
                <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd" />
            </svg>
        </a>

        <a href="/notification">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8" class:text-primary={tab==='notification'}>
                <path fill-rule="evenodd" d="M10 2a6 6 0 0 0-6 6c0 1.887-.454 3.665-1.257 5.234a.75.75 0 0 0 .515 1.076 32.91 32.91 0 0 0 3.256.508 3.5 3.5 0 0 0 6.972 0 32.903 32.903 0 0 0 3.256-.508.75.75 0 0 0 .515-1.076A11.448 11.448 0 0 1 16 8a6 6 0 0 0-6-6ZM8.05 14.943a33.54 33.54 0 0 0 3.9 0 2 2 0 0 1-3.9 0Z" clip-rule="evenodd" />
            </svg>
        </a>

        <a href="/circle">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-8 h-8" class:text-primary={tab==='circle'}>
                <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM1.49 15.326a.78.78 0 0 1-.358-.442 3 3 0 0 1 4.308-3.516 6.484 6.484 0 0 0-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 0 1-2.07-.655ZM16.44 15.98a4.97 4.97 0 0 0 2.07-.654.78.78 0 0 0 .357-.442 3 3 0 0 0-4.308-3.517 6.484 6.484 0 0 1 1.907 3.96 2.32 2.32 0 0 1-.026.654ZM18 8a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM5.304 16.19a.844.844 0 0 1-.277-.71 5 5 0 0 1 9.947 0 .843.843 0 0 1-.277.71A6.975 6.975 0 0 1 10 18a6.974 6.974 0 0 1-4.696-1.81Z" />
            </svg>
        </a>

    </footer>

    {#if loading}
        <div class="absolute top-0 left-0 w-full h-full bg-fade opacity-80 flex items-center justify-center z-20">
            <p class="bg-gray-400 text-5xl font-bold text-white">Loading...</p>
        </div>
    {/if}

</main>

{#if create}
    <div class="absolute top-0 w-full h-full z-10">
        <div class="bg-fade opacity-50 w-full h-full" on:click={() => create = null} on:keydown></div>
        <div class="absolute top-0 left-0 right-0 mx-auto w-full md:w-1/2">
            <Create {user} {create} {accounts} {circles} on:loading={e => loading = e.detail} on:close={() =>create = null} on:invite={invite}/>
        </div>
    </div>
{/if}