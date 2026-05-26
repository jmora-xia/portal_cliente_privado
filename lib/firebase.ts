import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDepxga5jRDpv0R-ko6r-EIyQ8dVTwOmOU",
  authDomain: "xia-cx-ccbf2.firebaseapp.com",
  projectId: "xia-cx-ccbf2",
  storageBucket: "xia-cx-ccbf2.firebasestorage.app",
  messagingSenderId: "515479280428",
  appId: "1:515479280428:web:fa72e6b5a8f2c264146a89",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);