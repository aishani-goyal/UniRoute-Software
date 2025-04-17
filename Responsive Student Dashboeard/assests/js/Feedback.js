// Add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
  authDomain: "uniroute-3dda9.firebaseapp.com",
  projectId: "uniroute-3dda9",
  storageBucket: "uniroute-3dda9.appspot.com",
  messagingSenderId: "465796690799",
  appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
  measurementId: "G-VWEFWH2517",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to show popup
function showPopup() {
  document.getElementById("feedback-popup").style.display = "flex";
}

// Function to close popup
function closePopup() {
  document.getElementById("feedback-popup").style.display = "none";
}

// Fetch and pre-fill student data
document.addEventListener("DOMContentLoaded", async () => {
  const closeBtn = document.getElementById("close-popup-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  const studentEmail = localStorage.getItem("loggedInEmail");
  const instituteId = localStorage.getItem("InstituteName");
  if (studentEmail) {
    try {
      const studentsCollection = collection(
        db,
        "institutes",
        instituteId,
        "Students"
      );
      const q = query(studentsCollection, where("email", "==", studentEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentData = querySnapshot.docs[0].data();

        // Pre-fill name and email fields in form
        document.getElementById("student-name").value = studentData.name || "";
        document.getElementById("student-email").value =
          studentData.email || "";

        console.log("✅ Student data loaded:", studentData);
      } else {
        console.warn("⚠️ No student found with email:", studentEmail);
      }
    } catch (error) {
      console.error("❌ Error querying student by email:", error);
    }
  } else {
    console.warn("⚠️ Student email not found in localStorage.");
  }
});

// Handle Form Submission
document
  .getElementById("feedback-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const studentName = document.getElementById("student-name").value.trim();
    const studentEmail = document.getElementById("student-email").value.trim();
    const driverBehaviour = parseInt(
      document.getElementById("driver-behaviour").value
    );
    const vehicleSpeed = parseInt(
      document.getElementById("vehicle-speed").value
    );
    const seatingComfort = parseInt(
      document.getElementById("seating-comfort").value
    );
    const onTimeService = parseInt(
      document.getElementById("on-time-service").value
    );
    const routeAvailability = parseInt(
      document.getElementById("route-availability").value
    );
    const complaint = document.getElementById("complaint").value.trim();

    // Validate form data
    if (
      !studentName ||
      !studentEmail ||
      isNaN(driverBehaviour) ||
      isNaN(vehicleSpeed) ||
      isNaN(seatingComfort) ||
      isNaN(onTimeService) ||
      isNaN(routeAvailability)
    ) {
      alert(
        "⚠️ Please fill in all required fields with valid ratings before submitting."
      );
      return;
    }

    // Sanitize email for Firestore document ID
    const safeEmail = studentEmail.replace(/[.#$[\]/]/g, "_");
    const instituteId = localStorage.getItem("InstituteName");
    try {
      const feedbackDocRef = doc(
        db,
        "institutes",
        instituteId,
        "Feedback",
        safeEmail
      );
      

      await setDoc(feedbackDocRef, {
        name: studentName,
        email: studentEmail,
        driverBehaviour,
        vehicleSpeed,
        seatingComfort,
        onTimeService,
        routeAvailability,
        complaint: complaint || "No complaint provided",
        timestamp: new Date(),
      });

      showPopup();
      document.getElementById("feedback-form").reset();
    } catch (err) {
      console.error("❌ Error submitting feedback:", err);
      alert("❗ Failed to submit feedback. Please try again.");
    }
  });
