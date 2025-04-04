let maps = {};
let markers = {};
let watchId;

function initMap(mapId) {
  let mapElement = document.getElementById(mapId);
  if (!mapElement) return;

  maps[mapId] = L.map(mapId).setView([20.5937, 78.9629], 5); // Default view: India
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(maps[mapId]);

  markers[mapId] = L.marker([20.5937, 78.9629])
    .addTo(maps[mapId])
    .bindPopup("Waiting for location...");
}

function startTracking() {
  if (navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        Object.keys(maps).forEach((mapId) => {
          markers[mapId].setLatLng([lat, lon]).setPopupContent("Bus is here!");
          maps[mapId].setView([lat, lon], 15);
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

function stopTracking() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    alert("Tracking stopped.");
  }
}

// Initialize maps for each bus
document.addEventListener("DOMContentLoaded", () => {
  ["map1", "map2", "map3", "map4"].forEach(initMap);
});
