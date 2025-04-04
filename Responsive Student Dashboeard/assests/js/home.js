// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", async function () {
    const map = L.map('student-map').setView([26.9124, 75.7873], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([26.9124, 75.7873])
        .addTo(map)
        .bindPopup('Default Location: Jaipur, India')
        .openPopup();

    const locationInfo = document.getElementById('location-info');

    // Fetch and Display Driver's Location
    async function displayDriverLocation() {
        const driverLocationRef = doc(db, "Location", "DriverLocation");

        try {
            const docSnap = await getDoc(driverLocationRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const latitude = data.latitude;
                const longitude = data.longitude;

                marker.setLatLng([latitude, longitude])
                    .bindPopup(`Driver's Current Location`)
                    .openPopup();

                map.setView([latitude, longitude], 15);

                locationInfo.innerHTML = `🚍 Driver's Location: <b>Latitude:</b> ${latitude.toFixed(5)}, <b>Longitude:</b> ${longitude.toFixed(5)}`;
            } else {
                locationInfo.innerHTML = "❗ Live tracking has not started or the driver has not yet started location sharing.";
            }
        } catch (error) {
            console.error("Error fetching driver's location:", error);
            locationInfo.innerHTML = "❗ Error fetching location data. Please try again later.";
        }
    }

    displayDriverLocation();

    // Auto-refresh location every 30 seconds
    setInterval(displayDriverLocation, 30000);
});
