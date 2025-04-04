// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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
const feedbackCollection = collection(db, 'Feedback');
// Function to show popup
function showPopup() {
    document.getElementById("feedback-popup").style.display = "flex";
}

// Function to close popup
function closePopup() {
    document.getElementById("feedback-popup").style.display = "none";
}
// Ensure popup close button is linked properly
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("close-popup-btn");
    if (closeBtn) {
        closeBtn.addEventListener("click", closePopup);
    }
});
// Handle Form Submission
document.getElementById("feedback-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentName = document.getElementById("student-name").value.trim();
    const studentEmail = document.getElementById("student-email").value.trim();
    const driverBehaviour = parseInt(document.getElementById("driver-behaviour").value);
    const vehicleSpeed = parseInt(document.getElementById("vehicle-speed").value);
    const seatingComfort = parseInt(document.getElementById("seating-comfort").value);
    const onTimeService = parseInt(document.getElementById("on-time-service").value);
    const routeAvailability = parseInt(document.getElementById("route-availability").value);
    const complaint = document.getElementById("complaint").value.trim();

    // Improved Validation for Empty or Invalid Ratings
    if (!studentName || !studentEmail || isNaN(driverBehaviour) || isNaN(vehicleSpeed) || 
        isNaN(seatingComfort) || isNaN(onTimeService) || isNaN(routeAvailability)) {
        alert("⚠️ Please fill in all required fields with valid ratings before submitting.");
        return;
    }

    try {
        await addDoc(feedbackCollection, {
            name: studentName,
            email: studentEmail,
            driverBehaviour,
            vehicleSpeed,
            seatingComfort,
            onTimeService,
            routeAvailability,
            complaint: complaint || "No complaint provided",
            timestamp: new Date()
        });

        showPopup();

        // Reset form after submission
        document.getElementById("feedback-form").reset();
    } catch (err) {
        console.error("❌ Error submitting feedback:", err);
        alert("❗ Failed to submit feedback. Please try again.");
    }
});
