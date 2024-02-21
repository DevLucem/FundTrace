const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue} = require('firebase-admin/firestore');
initializeApp();

const functions = require('firebase-functions');
const nodeMailer = require('nodemailer');
const emailConfig = require('./emailConfig.json');

const FIRESTORE = getFirestore();
const USERS = FIRESTORE.collection("users");
const CIRCLES = FIRESTORE.collection("circles");
const ACCOUNTS = FIRESTORE.collection("accounts");
const TRANSACTIONS = FIRESTORE.collection("transactions");
const NOTIFICATIONS = FIRESTORE.collection("notifications");

exports.userCreated = functions.auth
    .user().onCreate((user) => {
        NOTIFICATIONS.where("contact", "==", user.email.toLowerCase()).get().then(snapshot => {

            const batch = FIRESTORE.batch();
            snapshot.docs.forEach(doc =>
                batch.update(doc.ref, {
                    users: FieldValue.arrayUnion(user.uid),
                    [`access${user.uid}`]: 4,
                    to: {id: user.uid, displayName: user.displayName, photoURL: user.photoURL, email: user.email.toLowerCase()}
                }));

            batch.set(USERS.doc(user.uid), {
                id: user.uid,
                email: user.email.toLowerCase(),
                displayName: user.displayName,
                photoURL: user.photoURL,
                created: FieldValue.serverTimestamp(),
                user: user.uid,
                type: "user",
            });

            return batch.commit();
        })
    });

exports.accountUpdated = functions.firestore
    .document('accounts/{id}')
    .onUpdate((snap, context) => {

        const old = snap.before.data();
        const now = snap.after.data();

        // Check if users added or removed
        const removed = old.users.filter(x => !now.users.includes(x));

        if (removed.length > 0 || old.color !== now.color)
            return TRANSACTIONS.where("account", "==", context.params.id).get().then(snapshot => {
                return new Promise(resolve => {
                    const docs = [];
                    snapshot.docs.forEach(doc => docs.push({id, color} = doc.data()));

                    const updateBatch = () => {
                        const batch = FIRESTORE.batch();
                        for (let i = 0; i < Math.min(docs.length, 500); i++) {
                            const doc = docs.pop(); let color = doc.color;
                            if (doc.color === old.color) color = now.color;
                            let updates = {color};
                            if (removed.length > 0) {
                                updates.users = FieldValue.arrayRemove(...removed);
                                removed.forEach(user => updates[`access.${user}`] = FieldValue.delete());
                            }
                            batch.update(TRANSACTIONS.doc(doc.id), updates);
                        }
                        batch.commit().then(() => {
                            if (docs.length > 0) updateBatch();
                            else resolve();
                        });
                    }

                    if (docs.length > 0) updateBatch();
                    else resolve();
                })
            })

        return null;

    });

exports.accountDeleted = functions.firestore
    .document('accounts/{id}')
    .onDelete((snap, context) => {

        return TRANSACTIONS.where("account", "==", snap.id).get().then(snapshot => {

            // Delete all transactions using firebase batch. limit(500) is used to avoid exceeding the 500 write limit
            return new Promise(resolve => {

                const ids = [];
                snapshot.docs.forEach(doc => ids.push(doc.id));

                const deleteBatch = () => {
                    const batch = FIRESTORE.batch();
                    for (let i = 0; i < Math.min(ids.length, 500); i++) {
                        const docID = ids.pop();
                        batch.delete(TRANSACTIONS.doc(docID));
                    }
                    batch.commit().then(() => {
                        if (ids.length > 0) deleteBatch();
                        else resolve();
                    });
                }

                deleteBatch();

            }).then(() => res.sendStatus(200)).catch(res.send)

        })

    });

exports.transactionAdded = functions.firestore
    .document('transactions/{id}')
    .onCreate((snap, context) => {
        const data = snap.data();
        if (!data.account) return null;
        let update = {[`balance.${data.currency}`]: FieldValue.increment(data.amount - (data.fee || 0))};
        if (data.tags.length>0) update.tags = FieldValue.arrayUnion(...data.tags)
        return ACCOUNTS.doc(data.account).update(update);
    });

exports.transactionDeleted = functions.firestore
    .document('transactions/{id}')
    .onDelete((snap, context) => {
        const data = snap.data();
        if (!data.account) return null;
        // check if account exists
        return ACCOUNTS.doc(data.account).get().then(snapshot => {
            if (!snapshot.exists) return null;
            return snapshot.ref.update({
                [`balance.${data.currency}`]: FieldValue.increment(-data.amount + (data.fee || 0))
            });
        })
    });

const sendNotification = (subject, message, to) => {
    console.log("Sending Email", to, subject, message);
    return new Promise((resolve, reject) => {
        return nodeMailer.createTransport(emailConfig).sendMail({
            from: '"FundTrace" <noreply@fundtrace.web.app>',
            to, subject,
            text: message,
            html: message
        }, (error, info) => {
            if (error) reject(error);
            return resolve(info);
        });
    });
}

exports.notification = functions.firestore
    .document('notifications/{id}').onCreate((snap, context) => {
        const notification = snap.data();
        if (notification.user) return sendNotification(notification.title, notification.message, notification.contact);
        return Promise.all([USERS.where("email", "==", notification.contact).get(), CIRCLES.where(`${notification.from.id}.email`, '==', notification.contact)]).then(([snapshot, circle]) => {
            const user = snapshot.docs[0]?.data();
            if ((circle.docs?.length > 0 && notification.target.startsWith("circles/")) || notification.from.email === user?.email)
                return NOTIFICATIONS.doc(snap.id).update({result: "Already invited"})
            if (snapshot.docs?.length > 0)
                return NOTIFICATIONS.doc(snap.id).update({
                    users: FieldValue.arrayUnion(user.id),
                    [`access.${user.id}`]: 4,
                    to: {id: user.id, displayName: user.displayName, photoURL: user.photoURL, email: user.email}
                });
            else return sendNotification(notification.title, notification.message, notification.contact);
        }).catch(console.error);
    });

exports.notificationUpdated = functions.firestore
    .document('notifications/{id}').onUpdate((snap, context) => {
        const notification = snap.after.data();
        if (notification.result === "accepted") {
            console.log(notification.id, "Notification Accepted", notification.target);

            const circle = notification.users.sort().join("-");
            return CIRCLES.doc(circle).get().then(snapshot => {

                const batch = FIRESTORE.batch();

                if (!snapshot.exists)
                    batch.set(CIRCLES.doc(circle), {
                        id: circle,
                        users: notification.users,
                        [notification.from.id]: notification.to,
                        [notification.to.id]: notification.from,
                        created: FieldValue.serverTimestamp(),
                        type: "circles",
                    });

                if (!notification.target.startsWith("circles/"))
                    batch.update(FIRESTORE.doc(notification.target), {users: FieldValue.arrayUnion(notification.to.id)});

                return batch.commit();

            }).catch(console.error);
        }

        return null;
    });

exports.test = functions.https.onRequest((req, res) => {

    res.send({
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
        url: req.url,
        IP: req.ip,
        socket: req.socket,
        source: req.get('user-agent'),
        method: req.method,
        path: req.path,
        protocol: req.protocol,
        secure: req.secure,
        xhr: req.xhr,
        cookies: req.cookies,
        signedCookies: req.signedCookies,
        baseUrl: req.baseUrl,
        hostname: req.hostname,
        fresh: req.fresh,
        stale: req.stale,
        subdomains: req.subdomains
    });

});