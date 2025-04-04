// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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

document.addEventListener("DOMContentLoaded", function () {
    const defaultLatitude = 26.9124;
    const defaultLongitude = 75.7873;

    const map = L.map('map').setView([defaultLatitude, defaultLongitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const marker = L.marker([defaultLatitude, defaultLongitude])
        .addTo(map)
        .bindPopup('Default Location: Jaipur, India')
        .openPopup();

    let locationWatchId = null;

    // Function to Send Location to Firestore
    async function sendLocationToFirestore(latitude, longitude) {
        try {
            await setDoc(doc(db, "Location", "DriverLocation"), {
                latitude: latitude,
                longitude: longitude,
                timestamp: new Date().toISOString()
            });
            console.log("Location updated successfully in Firebase!");
        } catch (error) {
            console.error("Error updating location in Firebase:", error);
        }
    }

    // Function to Remove Driver's Location from Firestore
    async function removeLocationFromFirestore() {
        try {
            await deleteDoc(doc(db, "Location", "DriverLocation"));
            console.log("Location removed successfully from Firebase!");
        } catch (error) {
            console.error("Error removing document from Firebase:", error);
        }
    }

    // Start Location Tracking
    document.getElementById('send-location-btn').addEventListener('click', function () {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        locationWatchId = navigator.geolocation.watchPosition(
            async function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                document.getElementById('location-info').innerHTML =
                    `Latitude: ${latitude.toFixed(5)}, Longitude: ${longitude.toFixed(5)}`;

                marker.setLatLng([latitude, longitude])
                    .bindPopup('Your Current Location')
                    .openPopup();

                map.setView([latitude, longitude], 15);

                // Send updated location to Firestore
                await sendLocationToFirestore(latitude, longitude);
            },
            function (error) {
                alert(`Error fetching location: ${error.message}`);
            }
        );
    });

    // Stop Location Tracking
    document.getElementById('stop-location-btn').addEventListener('click', async function () {
        if (locationWatchId !== null) {
            navigator.geolocation.clearWatch(locationWatchId);
            locationWatchId = null;

            document.getElementById('location-info').innerHTML = '📍 <b>Location tracking stopped.</b>';

            // Remove location from Firestore
            await removeLocationFromFirestore();
        } else {
            alert("Location tracking is not active.");
        }
    });
});
