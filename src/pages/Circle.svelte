<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    import {updateUser, saveData} from "../firebase";

    export const tab = "circle";
    export let user, circles;

    const update = () => {
        const email = prompt('Enter new email address');
        if (!email) return;
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid email address");
        if (email && email !== user.email && confirm(`Change email to ${email}?`))
            updateUser(email).then(() => {
                saveData('users', {id: user.id, email}).then(() => {
                    alert('Email updated successfully');
                }).catch(console.error)
            }).catch(err => alert(err.message));
    };

</script>

<div class="flex flex-col h-full items-center">

    <div class="card flex w-fit">
        <img src={user?.photoURL || '/icon-512.png'} alt="Profile" class="mx-4 rounded-full bg-primary w-12 h-12"/>
        <div>
            <p class="font-bold">{user?.displayName || 'Public User'}</p>
            <p>
                {#if user?.email}
                    {user.email}
                    <button on:click={update}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                    </button>
                {:else}
                    Not Signed In
                {/if}
            </p>
        </div>
    </div>

    <div class="row justify-between bg-fade p-2 w-full">
        <h2>Your Circle {circles.length}</h2>
        <button on:click={() => emit("invite", {target: "circles/" + user.id, email: ""})} class="icon mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    </div>

    <div class="flex-1 overflow-y-scroll border p-0 w-full">
        <div class="m-4">
            {#each circles as circle}
                <div class="card row items-center justify-between p-2 m-2" style="background-color: {circle[user.id].color}">
                    <img src={circle[user.id].photoURL} alt="user" class="mx-4 rounded-full bg-primary w-6 h-6"/>
                    <h3 class="leading-3">{circle[user.id].displayName} <br> <span class="text-xs">{circle[user.id].email}</span></h3>
                    <div class="flex-1"></div>
                </div>
            {/each}
        </div>

    </div>

</div>