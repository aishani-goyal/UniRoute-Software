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
  collection,
  getDocs,
  getDoc,
  query,
  where,
  setDoc,
  deleteDoc,
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

// Function to count students
async function countStudentsOnDriverRoute() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) {
    console.error("Phone number not found in localStorage.");
    return;
  }

  // 1. Get the driver with matching contact number
  const driversRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Drivers"
  );
  const driverQuery = query(driversRef, where("contact", "==", phone));
  const driverSnapshot = await getDocs(driverQuery);

  if (driverSnapshot.empty) {
    console.error("No driver found with this phone number.");
    return;
  }

  let driverRoute = null;
  
  driverSnapshot.forEach((doc) => {
    driverRoute = doc.data().route;
  });

  if (!driverRoute) {
    console.error("Driver route not found.");
    return;
  }

  // 2. Find students with matching route number
  const studentsRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Students"
  );
  const studentQuery = query(studentsRef, where("routeNo", "==", String(driverRoute)));
  const studentSnapshot = await getDocs(studentQuery);

  const totalStudents = studentSnapshot.size;
  document.getElementById("total-students").innerText = totalStudents;
}


// ✅ Call function here (Fix Option 1)
countStudentsOnDriverRoute();

async function showDriverVehicleNumber() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) {
    console.error("Phone number not found in localStorage.");
    return;
  }

  const driversRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Drivers"
  );
  const driverQuery = query(driversRef, where("contact", "==", phone));
  const driverSnapshot = await getDocs(driverQuery);

  if (driverSnapshot.empty) {
    console.error("No driver found with this phone number.");
    return;
  }

  let vehicleNumber = null;
  driverSnapshot.forEach((doc) => {
    const data = doc.data();
    vehicleNumber = data.vehicle;
  });

  if (vehicleNumber) {
    document.getElementById("bus-number").innerText = vehicleNumber;
  } else {
    console.warn("Vehicle number not found for the driver.");
  }
}
showDriverVehicleNumber();


async function showAttendanceStatus() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) {
    console.error("Phone number not found in localStorage.");
    return;
  }

  // Get driver details
  const driversRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Drivers"
  );
  const driverQuery = query(driversRef, where("contact", "==", phone));
  const driverSnapshot = await getDocs(driverQuery);

  if (driverSnapshot.empty) {
    console.error("No driver found with this phone number.");
    return;
  }

  let driverRoute = null;
  driverSnapshot.forEach((doc) => {
    const driverData = doc.data();
    driverRoute = driverData.route;
  });

  if (!driverRoute) {
    console.error("Driver route not found.");
    return;
  }

  // Get all students with the same route
  const studentsRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Students"
  );
  const studentQuery = query(studentsRef, where("routeNo", "==", String(driverRoute)));
  const studentSnapshot = await getDocs(studentQuery);

  if (studentSnapshot.empty) {
    console.warn("No students found on this route.");
    document.getElementById("attendance-status").innerText = 0;
    return;
  }

  const attendanceRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Attendance"
  );

  let attendanceCount = 0;

  for (const studentDoc of studentSnapshot.docs) {
    const studentData = studentDoc.data();
    const roll = studentData.roll;

    const attendanceDocRef = doc(attendanceRef, roll);
    const attendanceDocSnap = await getDoc(attendanceDocRef);

    if (attendanceDocSnap.exists()) {
      const attendanceData = attendanceDocSnap.data();
      if (attendanceData.present === true) {
        attendanceCount++;
      }
    }
  }

  // Update UI
  document.getElementById("attendance-status").innerText = attendanceCount;
}

showAttendanceStatus();


document.addEventListener("DOMContentLoaded", function () {
  const defaultLatitude = 26.9124;
  const defaultLongitude = 75.7873;

  const map = L.map("map").setView([defaultLatitude, defaultLongitude], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const marker = L.marker([defaultLatitude, defaultLongitude])
    .addTo(map)
    .bindPopup("Default Location: Jaipur, India")
    .openPopup();

  let locationWatchId = null;

  let driverRouteNo = null;
  let driverName = null;

  // 🔍 Get driver route number and name using phone from localStorage
  async function fetchDriverInfo() {
    const phone = localStorage.getItem("userPhone");
    if (!phone) {
      console.error("Phone number not found in localStorage.");
      return;
    }

    const driversRef = collection(
      db,
      "institutes",
      "iEe3BjNAYl4nqKJzCXlH",
      "Drivers"
    );
    const driverQuery = query(driversRef, where("contact", "==", phone));
    const driverSnapshot = await getDocs(driverQuery);

    if (!driverSnapshot.empty) {
      const driverDoc = driverSnapshot.docs[0];
      const data = driverDoc.data();
      driverRouteNo = data.route;
      driverName = data.name;
    } else {
      console.error("Driver not found for phone:", phone);
    }
  }

  // 🔁 Send Location to Firestore using route number as doc ID
  async function sendLocationToFirestore(latitude, longitude) {
    if (!driverRouteNo || !driverName) {
      console.warn("Driver info not ready yet.");
      return;
    }

    try {
      await setDoc(doc(db, "Location", String(driverRouteNo)), {
        latitude: latitude,
        longitude: longitude,
        driverName: driverName,
        timestamp: new Date().toISOString(),
      });
      console.log("Location updated in Firestore for route:", driverRouteNo);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  }

  // ❌ Remove location document based on route number
  async function removeLocationFromFirestore() {
    if (!driverRouteNo) return;
    try {
      await deleteDoc(doc(db, "Location", String(driverRouteNo)));
      console.log("Location removed from Firebase for route:", driverRouteNo);
    } catch (error) {
      console.error("Error removing document:", error);
    }
  }

  // ▶️ Start tracking
  document
    .getElementById("send-location-btn")
    .addEventListener("click", async function () {
      await fetchDriverInfo(); // Get route number and name before tracking

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }

      locationWatchId = navigator.geolocation.watchPosition(
        async function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          document.getElementById(
            "location-info"
          ).innerHTML = `Latitude: ${latitude.toFixed(
            5
          )}, Longitude: ${longitude.toFixed(5)}`;

          marker
            .setLatLng([latitude, longitude])
            .bindPopup("Your Current Location")
            .openPopup();

          map.setView([latitude, longitude], 15);

          await sendLocationToFirestore(latitude, longitude);
        },
        function (error) {
          alert(`Error fetching location: ${error.message}`);
        }
      );
    });

  // ⏹ Stop tracking
  document
    .getElementById("stop-location-btn")
    .addEventListener("click", async function () {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;

        document.getElementById("location-info").innerHTML =
          "📍 <b>Location tracking stopped.</b>";

        await removeLocationFromFirestore();
      } else {
        alert("Location tracking is not active.");
      }
    });
});

