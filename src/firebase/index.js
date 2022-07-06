// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import {
    getAuth,
    sendPasswordResetEmail,
    signOut,
} from 'firebase/auth'
import {getStorage} from "firebase/storage";
import {getFunctions, connectFunctionsEmulator} from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCKOb1N_QGsBHihh1mHxHgEnNfn3z-23yk",
    authDomain: "test-848b6.firebaseapp.com",
    projectId: "test-848b6",
    storageBucket: "test-848b6.appspot.com",
    messagingSenderId: "831166038303",
    appId: "1:831166038303:web:bbe692cf646d2591e2702a",
    measurementId: "G-81FPEDKH85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firebase_storage = getStorage(app);
const database = getFirestore(app);
const functions = getFunctions();

//This is for dev_eniroment
connectFunctionsEmulator(functions, "localhost", 5001);


/**
 * Methods
 */
const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset link sent!");
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
};

const logout = () => {
    signOut(auth);
};

export {
    firebase_storage,
    auth,
    logout,
    sendPasswordReset,
    analytics,
    database,
    functions
};
