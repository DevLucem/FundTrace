## [FundTrace.Web.App](https://fundtrace.web.app)
#### ...a simple web app to track your expenses and income

![Demo](https://github.com/devlucem/FundTrace/assets/22216995/86c5e713-65e7-4fdb-abff-63f093c66185)

### Features
- Built with [PWA](https://PWA-Progressive.Web.App/) and [Firebase](https://firebase.google.com/)
- Local and Cloud Sync
- Multi-Currency and Unlimited Accounts
- Account Sharing

---
### Getting Started
Clone the repo and run
```
npm install
cd functions
npm install
cd ..
```
### Configure
- Create a firebase project or get the firebase config files of the one you already have
    ```
    apiKey: "",
    authDomain: "",
    projectId: ""
   ```
- Update the [src/firebaseConfig.json](./src/firebaseConfig.json) config files with your above keys
- To customize your app, go to [public/serviceWorker](./public/serviceWorker.js) and [public/manifest](./public/manifest.json) files and add any files not included in the `assets` and `icons`.
- You can use [Icons Builder](https://www.pwabuilder.com/imageGenerator) to generate your icons

#### Test Front-End Locally
`npm run dev`

#### Test Full App Locally
`firebase serve`

#### Build for production
`npm run d`

---

Your website app files will be available in the [dist](./dist) folder.

# Made With ♥
```
(                   (                            
)\ )                )\ )                         
(()/(     (    )    (()/(   (          (     )    
/(_))   ))\  /((    /(_)) ))\   (    ))\   (     
(_))_   /((_)(_))\  (_))  /((_)  )\  /((_)  )\  '
|   \ (_))  _)((_) | |  (_))(  ((_)(_))  _((_))  
| |) |/ -_) \ V /  | |__| || |/ _| / -_)| '  \()
|___/ \___|  \_/   |____|\_,_|\__| \___||_|_|_|  
```
