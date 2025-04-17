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
// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async function () {
  const map = L.map("student-map", {
    zoomControl: false // Disable default zoom buttons
  }).setView([26.9124, 75.7873], 15);

  // Add zoom controls manually at top-right (or any corner away from sidebar)
  L.control.zoom({
    position: 'topright' // You can change to 'bottomright' or 'topleft'
  }).addTo(map);

  // Move attribution to bottom-right (or any other corner)
  map.attributionControl.setPosition('bottomright');

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const marker = L.marker([26.9124, 75.7873])
    .addTo(map)
    .bindPopup("Default Location: Jaipur, India")
    .openPopup();

  const locationInfo = document.getElementById("location-info");

  // Fetch email from localStorage
  const studentEmail = localStorage.getItem("loggedInEmail");
  const instituteId = localStorage.getItem("InstituteName");
  if (!studentEmail) {
    locationInfo.innerHTML = "❗ No email found. Please log in again.";
    return;
  }

  // Fetch Student Data
  async function fetchStudentData() {
    const studentsRef = collection(
      db,
      "institutes",
      instituteId,
      "Students"
    );

    const studentQuery = query(studentsRef, where("email", "==", studentEmail));
    const snapshot = await getDocs(studentQuery);

    if (snapshot.empty) {
      console.log("No student found with this email.");
      locationInfo.innerHTML = "❗ Student not found.";
      return;
    }

    const studentData = snapshot.docs[0].data();
    const routeNo = studentData.routeNo;

    console.log("Student found. Route number:", routeNo);

    if (routeNo) {
      fetchLocationData(routeNo); // Fetch location based on route number
    } else {
      locationInfo.innerHTML = "❗ No route number found for the student.";
    }
  }

  // Fetch Location Data based on route number
  async function fetchLocationData(routeNo) {
    const locationRef = doc(db, "institutes", instituteId, "Location", routeNo);

    try {
      const docSnap = await getDoc(locationRef);

      if (docSnap.exists()) {
        const locationData = docSnap.data();
        const latitude = locationData.latitude;
        const longitude = locationData.longitude;

        marker
          .setLatLng([latitude, longitude])
          .bindPopup(`Route ${routeNo} Location`)
          .openPopup();

        map.setView([latitude, longitude], 15);

        locationInfo.innerHTML = `🚍 Route ${routeNo} Location: <b>Latitude:</b> ${latitude.toFixed(5)}, <b>Longitude:</b> ${longitude.toFixed(5)}`;
      } else {
        locationInfo.innerHTML =
          "❗ No location found. Please check back later.";
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      locationInfo.innerHTML =
        "❗ Error fetching location data. Please try again later.";
    }
  }

  // Call the function to fetch student data and location
  await fetchStudentData();

  // Auto-refresh location every 30 seconds
  setInterval(fetchStudentData, 30000); // refresh every 30 seconds


  
  // Fetch and display assigned bus number for logged-in student
  async function fetchAndDisplayBusNumber() {
    const email = localStorage.getItem("loggedInEmail");

    if (!email) {
      console.warn("No logged-in email found in localStorage.");
      document.getElementById("bus-number").textContent = "Not Available";
      return;
    }

    try {
      // 1. Get the student's route number
      const studentsRef = collection(
        db,
        "institutes",
        instituteId,
        "Students"
      );
      const q = query(studentsRef, where("email", "==", email));
      const studentSnap = await getDocs(q);

      if (studentSnap.empty) {
        document.getElementById("bus-number").textContent = "Not Found";
        return;
      }

      let routeNo = "";
      studentSnap.forEach((doc) => {
        routeNo = doc.data().routeNo;
      });

      if (!routeNo) {
        document.getElementById("bus-number").textContent = "No Route Assigned";
        return;
      }

      // 2. Get the assigned vehicle using the route number as document ID
      const routeDocRef = doc(
        db,
        "institutes",
        instituteId,
        "routes",
        routeNo
      );
      const routeDocSnap = await getDoc(routeDocRef);

      if (routeDocSnap.exists()) {
        const vehicleNumber =
          routeDocSnap.data().assigned_vehicle || "Not Available";
        document.getElementById("bus-number").textContent = vehicleNumber;
      } else {
        document.getElementById("bus-number").textContent = "Vehicle not found";
      }
    } catch (error) {
      console.error("Error fetching bus number:", error);
      document.getElementById("bus-number").textContent = "Error";
    }
  }

  // Call the function after DOM is loaded
  fetchAndDisplayBusNumber();
});

// Get Fee Status span
const feeStatusSpan = document.getElementById("Fee-status");

// Get email from localStorage
const email = localStorage.getItem("loggedInEmail");
const instituteId = localStorage.getItem("InstituteName");
async function updateFeeStatus() {
  try {
    // Step 1: Find studentId using email
    const studentsRef = collection(
      db,
      "institutes",
      instituteId, // Use dynamic instituteId here
      "Students"
    );
    const studentQuery = query(studentsRef, where("email", "==", email));
    const studentSnapshot = await getDocs(studentQuery);

    if (!studentSnapshot.empty) {
      const studentData = studentSnapshot.docs[0].data();
      const studentId = studentData.studentId;

      // Step 2: Get Fees data for that studentId
      const feeRef = doc(db, "institutes", instituteId, "Fees", studentId);
      const feeSnap = await getDoc(feeRef);

      if (feeSnap.exists()) {
        const feeData = feeSnap.data();
        const status = feeData.status;

        // Step 3: Update UI
        feeStatusSpan.innerText = status;
        feeStatusSpan.className = status.toLowerCase(); // Optional for styling
      } else {
        feeStatusSpan.innerText = "Not Found";
      }
    } else {
      feeStatusSpan.innerText = "Student Not Found";
    }
  } catch (error) {
    console.error("Error fetching fee status:", error);
    feeStatusSpan.innerText = "Error";
  }
}

// Run when page loads
updateFeeStatus();

// Helper: format date as dd-mm-yyyy
function getTodayFormatted() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("loggedInEmail");
  const statusSpan = document.getElementById("attendance-status");
  statusSpan.textContent = "Checking...";

  if (!email) {
    statusSpan.textContent = "❌ Email not found!";
    statusSpan.style.color = "red";
    return;
  }

  try {
    // Step 1: Get student's roll number by email
    const studentsCollection = collection(
      db,
      "institutes",
      instituteId,
      "Students"
    );
    const q = query(studentsCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      statusSpan.textContent = "❌ Student not found!";
      statusSpan.style.color = "red";
      return;
    }

    const studentData = querySnapshot.docs[0].data();
    const studentRoll = studentData.roll;
    const today = getTodayFormatted();

    // Step 2: Go to Attendance/{roll}/{today} and check if any doc has status "Present"
    const attendanceSubCollection = collection(
      db,
      "institutes", instituteId,
      "Attendance",
      studentRoll,
      today
    );
    const attendanceSnapshot = await getDocs(attendanceSubCollection);

    let marked = false;

    attendanceSnapshot.forEach((doc) => {
      if (doc.data().status === "Present") {
        marked = true;
      }
    });

    if (marked) {
      statusSpan.textContent = "✅ Marked";
      statusSpan.style.color = "green";
    } else {
      statusSpan.textContent = "❌ Pending";
      statusSpan.style.color = "red";
    }
  } catch (error) {
    console.error("❌ Error checking attendance:", error);
    statusSpan.textContent = "❌ Error";
    statusSpan.style.color = "red";
  }
});


