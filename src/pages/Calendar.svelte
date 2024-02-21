<script>
    import {createEventDispatcher} from 'svelte';
    const emit = createEventDispatcher();

    import {onMount} from "svelte";
    import Calendar from 'tui-calendar';
    import "tui-calendar/dist/tui-calendar.css";

    export const tab = "calendar";
    export let transactions = []; let calendarData = [];
    let calendar; $: if (transactions && calendar) {
        console.log("Calendar Update", transactions.length);
        calendarData = []; transactions.forEach(doc => {
            if (!doc.time) console.log(doc)
            console.log("Added", doc.name);
            calendarData.push({ // check attendees, recurrence rule
                id: doc.id,
                title: doc.name,
                account: doc.account,
                tags: doc.tags,
                amount: doc.amount.toCurrency(),
                currency: doc.currency,
                calendarId: 'calendar',
                category: 'allday',
                isPending: new Date() < doc.time,
                body: doc.amount.toCurrency(),
                start: doc.time || doc.created,
                end: doc.time || doc.created,
                bgColor: doc.color,
                color: '#10162A',
                dragBgColor: "#FF5964",
                borderColor: doc.color,
                attendees: [doc.users.length],
            })
        });
        calendar.clear();
        calendar.createSchedules(calendarData);
    }

    onMount(() => {
        calendar = new Calendar('#calendar', {
            usageStatistics: false,
            defaultView: 'month',
            useDetailPopup: true,
            disableClick: true,
            taskView: false,
            scheduleView: true,
            useCreationPopup: false,
        })
        calendar.on({
            'beforeUpdateSchedule': function (event) {
                let edit = transactions.find(el => el.id === event.schedule.id)
                console.log('editing', edit);
                if (edit) emit('create', edit);
                return true;
            }
        });
    })
</script>

<div class="h-full" id="calendar"></div>
<div class="row justify-center space-x-24">
    <button on:click={()=>calendar.prev()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953l7.108-4.062A1.125 1.125 0 0121 8.688v8.123zM11.25 16.811c0 .864-.933 1.405-1.683.977l-7.108-4.062a1.125 1.125 0 010-1.953L9.567 7.71a1.125 1.125 0 011.683.977v8.123z" />
        </svg>
    </button>
    <button on:click={()=>calendar.next()}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062A1.125 1.125 0 013 16.81V8.688zM12.75 8.688c0-.864.933-1.405 1.683-.977l7.108 4.062a1.125 1.125 0 010 1.953l-7.108 4.062a1.125 1.125 0 01-1.683-.977V8.688z" />
        </svg>
    </button>
</div>