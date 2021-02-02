const firebase = require("firebase");
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9X0_CGknaOOfG1JGYFZQFujMkGevMWZ8",
  authDomain: "wastearn-11954.firebaseapp.com",
  projectId: "wastearn-11954",
  storageBucket: "wastearn-11954.appspot.com",
  messagingSenderId: "810333160511",
  appId: "1:810333160511:web:a4b4cf6e97c374138b248a",
  measurementId: "G-14BZ64CFTT"
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebase.auth();

exports.module = {db, auth};