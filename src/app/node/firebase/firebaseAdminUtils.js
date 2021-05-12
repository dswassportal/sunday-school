const fireAdmin = require('firebase-admin');

const adminConfJSON = require('./dswa-ss-portal-e165b-firebase-adminsdk-gsrzv-8631f8200d.json');

fireAdmin.initializeApp({
    credential: fireAdmin.credential.cert(adminConfJSON),
});

const  firebaseConfig = {
    apiKey: "AIzaSyDlcJ6lOnJsjyDDt4sjls7Lc0sRIcLM_HU",
    authDomain: "dswa-ss-portal-e165b.firebaseapp.com",
    projectId: "dswa-ss-portal-e165b",
    storageBucket: "dswa-ss-portal-e165b.appspot.com",
    messagingSenderId: "570766487590",
    appId: "1:570766487590:web:4ddabf0afe31cd0776f6e7"
};


function varifyUserToken(idToken) {
   
   return fireAdmin
        .auth()
        .verifyIdToken(idToken);
}


module.exports = { varifyUserToken, firebaseConfig }