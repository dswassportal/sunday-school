
import {enableProdMode} from '@angular/core';
enableProdMode();

export const environment = {
  production: true,
  firebase: {
    apiKey: "AIzaSyDlcJ6lOnJsjyDDt4sjls7Lc0sRIcLM_HU",
    authDomain: "dswa-ss-portal-e165b.firebaseapp.com",
    projectId: "dswa-ss-portal-e165b",
    storageBucket: "dswa-ss-portal-e165b.appspot.com",
    messagingSenderId: "570766487590",
    appId: "1:570766487590:web:4ddabf0afe31cd0776f6e7"
  },
  apiUrl : `${window.location.origin}/api` // 
};


