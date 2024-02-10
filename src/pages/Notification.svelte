<script>
    import {createEventDispatcher, onDestroy} from "svelte";
    const emit = createEventDispatcher();
    import {listenData, saveData} from "../firebase";

    export const tab = "notification";
    export let user;

    let notifications = [], notificationsListener;
    if (user) {
        if (notificationsListener) notificationsListener();
        notificationsListener = listenData("notifications", result => {
            console.log("Notifications", result.length);
            notifications = result;
        });
    }

    const updateState = (notification, result) => {
        emit("loading", true);
        notification.result = result;
        saveData("notifications", notification).then(() => {
            alert(result);
        }).catch(console.error).finally(() => {
            emit("loading", false);
        });
    }

    onDestroy(() => {if (notificationsListener) notificationsListener();});
</script>

<ul>
    {#each notifications as notification}
        <li class="rounded bg-fade m-2 p-2">
            <p class="font-bold text-lg">{notification.title} - {notification.id}</p>
            <p class="text-xs">{@html notification.message}</p>
            {#if notification.result}
                <p class="text-center text-primary">{notification.result}</p>
            {:else}
                <div class="flex justify-end space-x-2">
                    <p>{notification.created}</p>
                    {#if user.id === notification.from.id}
                        <button on:click={()=>updateState(notification, "canceled")} class="rounded bg-white text-primary px-4 py-1">Cancel</button>
                    {:else}
                        <button on:click={()=>updateState(notification, "declined")} class="rounded bg-white text-primary px-4 py-1">Decline</button>
                        <button on:click={()=>updateState(notification, "accepted")} class="rounded bg-white text-primary px-4 py-1">Accept</button>
                    {/if}
                </div>
            {/if}
        </li>
    {/each}
</ul>