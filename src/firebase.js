import {initializeApp} from "firebase/app";
import {getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, updateEmail, signOut} from "firebase/auth"
import {getFirestore, enableIndexedDbPersistence, onSnapshot, serverTimestamp, collection, setDoc, doc, deleteDoc, query, where, arrayRemove, deleteField} from 'firebase/firestore'

const firebaseConfig = require('./firebaseConfig.json');
initializeApp(firebaseConfig);

const AUTH = getAuth()
export const logIn = () => {return signInWithPopup(AUTH, new GoogleAuthProvider())}
export const listenUser = (callback) => onAuthStateChanged(AUTH, callback)
export const updateUser = email => {
    return new Promise((resolve, reject) => {
        let user = AUTH.currentUser;
        updateEmail(user, email).then(() => {
            saveData('users', {id: user.uid, email: email, name: user.displayName, photo: user.photoURL})
                .then(resolve).catch(() => {
                updateEmail(user, user.email).then(() => {
                    reject('Error Saving User');
                }).catch(reject);
            });
        }).catch(reject);
    });
}
export const logOut = () => {return signOut(AUTH)}

const FIRESTORE = getFirestore()
enableIndexedDbPersistence(FIRESTORE).catch(e => console.log(e.code === 'failed-precondition' ? 'Multiple Tabs Open' : 'Cant Cache ', e))
export const saveData = (path, data) => {
    console.log("Saving Data", path, data);

    let user = AUTH.currentUser?.uid;
    if (!user) return Promise.reject('Not Logged In');

    // Data Cleaning
    ['created', 'time', 'updated'].forEach(key => {if (data[key]) data[key] = new Date(data[key])});
    if (!data.users) data.users = [];
    if (!data.access) data.access = {};
    if (data.id) data.updated = serverTimestamp();
    else {
        data.created = serverTimestamp();
        data.id = doc(collection(FIRESTORE, path)).id;
    }
    if (!data.access[user]) data.access[user] = 5;
    if (data.access[user]<4) data.access[user] = 4;
    if (!data.users.includes(user))
        data.users = [user, ...data.users];
    Object.keys(data).forEach(key => { if(data[key] === undefined) delete data[key]});

    return setDoc(doc(collection(FIRESTORE, path), data.id), data, {merge: true});

}
// todo order by time, max 100 items
export const listenData = (path, callback) => {
    let user = AUTH.currentUser?.uid;
    if (!user) callback([]);
    return onSnapshot(query(collection(FIRESTORE, path), where("users", "array-contains", user)), snapshot => {
        let list = [];
        snapshot.forEach(doc => {
            let data = doc.data();
            ['created', 'time', 'updated'].forEach(key => {if (data[key] && data[key].toDate) data[key] = data[key].toDate()})
            list.push(data)
        });
        callback(list);
    })
}
export const deleteData = (path, id) => {
    return deleteDoc(doc(collection(FIRESTORE, path), id));
}