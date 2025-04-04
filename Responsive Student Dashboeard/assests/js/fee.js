// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
    authDomain: "uniroute-3dda9.firebaseapp.com",
    projectId: "uniroute-3dda9",
    storageBucket: "uniroute-3dda9.appspot.com",
    messagingSenderId: "465796690799",
    appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
    measurementId: "G-VWEFWH2517"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Reference Firestore collection
const feesCollection = collection(db, 'Fees');

// Get elements
const payButton = document.getElementById("pay-now");
const studentName = document.getElementById("student-name").innerText.trim();
const studentEmail = document.getElementById("student-email").innerText.trim();
const feeAmount = document.getElementById("fee-amount").innerText.trim();
const feeStatus = document.getElementById("fee-status");

// Replace with your actual UPI ID
const upiID = "7014253314@pytes"; 

// Generate UPI Payment Link
const upiURL = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(studentName)}&am=${feeAmount}&cu=INR&tn=Fee Payment`;

// Payment Processing
payButton.addEventListener("click", async () => {
    try {
        // Save payment details to Firebase before redirection
        await addDoc(feesCollection, {
            name: studentName,
            email: studentEmail,
            amount: feeAmount,
            status: "Pending",
            timestamp: serverTimestamp()
        });

        alert("Payment record saved. Redirecting to UPI Payment...");

        // Set Status to Processing
        feeStatus.innerText = "Processing...";
        feeStatus.classList.remove("pending");
        feeStatus.classList.add("processing");

        // For desktop, try redirecting to Paytm website instead of using the UPI link directly
        let paytmURL = `https://paytm.com/upi/payment?pa=${upiID}&pn=${encodeURIComponent(studentName)}&am=${feeAmount}&cu=INR&tn=Fee Payment`;

        // Introduce a slight delay before redirecting
        setTimeout(() => {
            // Redirect to Paytm payment page
            window.location.href = paytmURL;
        }, 1000); // Wait for 1 second before redirecting
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to record payment. Please try again.");
    }
});

