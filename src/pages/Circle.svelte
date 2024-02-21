<script>
    import {createEventDispatcher} from "svelte";
    const emit = createEventDispatcher();

    import {updateUser, saveData} from "../firebase";

    export const tab = "circle";
    export let user, circles;

    const update = () => {
        const email = prompt('Enter new email address');
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return alert("Invalid email address");
        if (email && email !== user.email && confirm(`Change email to ${email}?`))
            updateUser(email).then(() => {
                saveData('users', {id: user.id, email}).then(() => {
                    alert('Email updated successfully');
                }).catch(console.error)
            }).catch(err => alert(err.message));
    };

</script>

<div class="text-center">

    <img src={user?.photoURL || '/icon-512.png'} alt="Profile" class="mx-auto mt-12 mb-4 rounded-full bg-primary w-12 h-12"/>
    <p class="text-center">{user?.displayName || 'Public User'}</p>
    <p class="text-center">{user?.email || 'Not Signed In'}</p>
    {#if user?.email}
        <button class="bg-fade px-4 py-1 rounded font-bold m-4" on:click={update}>Change Email</button>
    {/if}

    <div class="card border m-4 p-0 bg-white">

        <div class="row justify-between bg-fade p-2">
            <h2>Your Circle {circles.length}</h2>
            <button on:click={() => emit("invite", {target: "circles/" + user.id, email: ""})} class="icon mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>

        <div class="m-4">
            {#each circles as circle}
                <div class="card row items-center justify-between p-2 m-2" style="background-color: {circle[user.id].color}">
                    <img src={circle[user.id].photoURL} alt="user" class="mx-4 rounded-full bg-primary w-6 h-6"/>
                    <h3 class="text-start leading-3">{circle[user.id].displayName} <br> <span class="text-xs">{circle[user.id].email}</span></h3>
                    <div class="flex-1"></div>
                </div>
            {/each}
        </div>

    </div>

</div>