// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// import { getDatabase, ref, set } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// function writeUserData(userId, name, email, imageUrl) {
//   const db = getDatabase();
//   set(ref(db, "users/" + userId), {
//     username: name,
//     email: email,
//     profile_picture: imageUrl,
//   });
// }
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7H0djNO4Ohuqafy5pkPX23_zutSb2C3w",
  authDomain: "sellerkin-11168.firebaseapp.com",
  databaseURL: "https://sellerkin-11168-default-rtdb.firebaseio.com",
  projectId: "sellerkin-11168",
  storageBucket: "sellerkin-11168.appspot.com",
  messagingSenderId: "817865371447",
  appId: "1:817865371447:web:ea8b92a20388c7763a34b2",
  measurementId: "G-RQ2J9KZK7C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
