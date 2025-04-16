import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
  authDomain: "uniroute-3dda9.firebaseapp.com",
  databaseURL: "https://uniroute-3dda9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uniroute-3dda9",
  storageBucket: "uniroute-3dda9.firebasestorage.app",
  messagingSenderId: "465796690799",
  appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
  measurementId: "G-VWEFWH2517",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Store references to maps and markers
let maps = {};
let markers = {};
let watchId;

// Initialize map for each bus route
function initMap(mapId, routeNumber) {
  let mapElement = document.getElementById(mapId);
  if (!mapElement) return;

  // Initialize map with default coordinates (India center)
  maps[routeNumber] = L.map(mapId).setView([20.5937, 78.9629], 5);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(maps[routeNumber]);

  markers[routeNumber] = L.marker([20.5937, 78.9629])
    .addTo(maps[routeNumber])
    .bindPopup(`Waiting for location for route ${routeNumber}`);
}

// Start tracking location
function startTracking() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        // Update all maps with the current location
        Object.keys(maps).forEach((routeNumber) => {
          markers[routeNumber].setLatLng([lat, lon]).setPopupContent("Bus is here!");
          maps[routeNumber].setView([lat, lon], 15);
        });
      },
      (error) => {
        console.error("Error getting location:", error.message);
      },
      { enableHighAccuracy: true }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Stop tracking location
function stopTracking() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    alert("Tracking stopped.");
  }
}

// Load routes from Firebase and initialize maps
document.addEventListener("DOMContentLoaded", () => {
  loadRoutes(); // Call the function to load the routes once the DOM is ready

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
});

function loadRoutes() {
  const busContainer = document.querySelector('.bus-container');
  if (!busContainer) {
    console.error("Bus container not found.");
    return;
  }

  // Reference to the routes collection in Firestore
  const routesRef = collection(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "routes");

  // Fetch the routes from Firestore
  getDocs(routesRef).then((querySnapshot) => {
    if (querySnapshot.empty) {
      busContainer.innerHTML = `<p>No routes available</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      const routeData = doc.data();

      // Create the bus box dynamically for each route
      const busBox = document.createElement("div");
      busBox.classList.add("bus-box");

      // Add HTML content dynamically
      busBox.innerHTML = `
        <h3>Route ${routeData.route_number || doc.id}</h3>
        <p>Vehicle: ${routeData.assigned_vehicle || "N/A"}</p>
        <div id="map-${doc.id}" class="map" data-bus-id="${doc.id}"></div>
      `;

      // Append the bus box to the container
      busContainer.appendChild(busBox);

      // Initialize the map for this bus route
      initMap(`map-${doc.id}`, doc.id);

      // Fetch location data for this route
      fetchLocationForRoute(routeData.route_number || doc.id);
    });
  }).catch((error) => {
    console.error("Error loading routes:", error);
  });
}

// Fetch location data for a given route
async function fetchLocationForRoute(routeNumber) {
  const locationRef = doc(db, "institutes", "iEe3BjNAYl4nqKJzCXlH","Location", routeNumber); // Directly reference Location collection
  console.log(`Fetching location for route ${routeNumber} from: `, locationRef.path);

  const locationSnapshot = await getDoc(locationRef);

  if (locationSnapshot.exists()) {
    const locationData = locationSnapshot.data();
    console.log('Location data retrieved for route', routeNumber, locationData);  // Log the fetched data

    // Check if latitude and longitude are valid
    const { latitude, longitude } = locationData;

    if (latitude && longitude) {
      console.log(`Updating map for route ${routeNumber} at latitude: ${latitude}, longitude: ${longitude}`);

      // Ensure marker exists for this route before updating
      if (markers[routeNumber]) {
        // Update the marker with the route's location
        markers[routeNumber].setLatLng([latitude, longitude]).setPopupContent(`Bus is at (${latitude}, ${longitude})`);
        maps[routeNumber].setView([latitude, longitude], 15);
      } else {
        console.log(`Marker for route ${routeNumber} not initialized yet.`);
      }
    } else {
      console.log(`Latitude or Longitude is missing for route ${routeNumber}. Data: `, locationData);
    }
  } else {
    console.log(`No location data found for route ${routeNumber}. Document does not exist at:`, locationRef.path);
  }
}
