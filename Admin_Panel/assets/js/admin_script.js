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

document.addEventListener("DOMContentLoaded", function () {
  const routesTable = document.querySelector("#routes-table tbody");
  const vehiclesTable = document.querySelector("#vehicles-table tbody");
  const addRouteBtn = document.getElementById("add-route");
  const addVehicleBtn = document.getElementById("add-vehicle");
  const mergeRoutesBtn = document.getElementById("merge-routes");

  async function addRow(table, type) {
    let id;

    if (type === "route") {
      // Remove 'No Routes' row if present
      if (document.getElementById("no-routes")) {
        document.getElementById("no-routes").remove();
      }

      const routesRef = firebase.firestore()
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("routes");

      try {
        // Fetch existing IDs from Firestore
        const snapshot = await routesRef.get();
        const existingFirestoreIds = snapshot.docs
          .map(doc => parseInt(doc.id))
          .filter(id => !isNaN(id));

        // Fetch IDs from current table (unsaved ones)
        const tableRows = document.querySelectorAll("#routes-table tbody tr");
        const existingTableIds = Array.from(tableRows).map(row => {
          const idCell = row.children[1]?.innerText?.trim();
          const parsed = parseInt(idCell);
          return isNaN(parsed) ? null : parsed;
        }).filter(id => id !== null);

        const allIds = existingFirestoreIds.concat(existingTableIds);
        let candidateId = 1;
        while (allIds.includes(candidateId)) {
          candidateId++;
        }
        id = candidateId;
      } catch (error) {
        console.error("Error fetching routes for ID calculation:", error);
        alert("Error generating new Route ID.");
        return;
      }

      // Create route row
      const row = document.createElement("tr");
      row.setAttribute("data-id", id);

      row.innerHTML = `
        <td><input type="checkbox" class="select-route-checkbox"></td>  
        <td>${id}</td>
        <td contenteditable="true">Route No.</td>
        <td contenteditable="true">Starting Point</td>
        <td contenteditable="true">Total Stops</td>
        <td contenteditable="true">Vehicle No.</td>
        <td contenteditable="true">Driver Name</td>
        <td contenteditable="true">SPOC Name</td>
        <td contenteditable="true">SPOC Contact NO</td>
        <td contenteditable="true">Not Merged</td>
        <td>
          <button class="edit"><i class="far fa-edit"></i></button>
          <button class="delete"><i class="fas fa-trash"></i></button>
        </td>
      `;

      table.appendChild(row);

    } else if (type === "vehicle") {
      // Remove 'No Vehicles' row if present
      if (document.getElementById("no-vehicles")) {
        document.getElementById("no-vehicles").remove();
      }

      // Fetch vehicle IDs from current table (ignore Firestore for now)
      const tableRows = document.querySelectorAll("#vehicles-table tbody tr");
      const existingTableIds = Array.from(tableRows).map(row => {
        const idCell = row.children[0]?.innerText?.trim(); // First <td> is ID
        const parsed = parseInt(idCell);
        return isNaN(parsed) ? null : parsed;
      }).filter(id => id !== null);

      // Find the next smallest available ID
      let candidateId = 1;
      while (existingTableIds.includes(candidateId)) {
        candidateId++;
      }
      id = candidateId;

      // Create vehicle row
      const row = document.createElement("tr");
      row.setAttribute("data-id", id);

      row.innerHTML = `
        <td>${id}</td>
        <td contenteditable="true">Vehicle Number</td>
        <td contenteditable="true">Vehicle Type</td>
        <td contenteditable="true">Capacity</td>
        <td contenteditable="true">Assigned Route</td>
        <td contenteditable="true">Active</td>
        <td contenteditable="true">Assigned Driver</td>
        <td>
          <button class="edit"><i class="far fa-edit"></i></button>
          <button class="delete"><i class="fas fa-trash"></i></button>
        </td>
      `;

      table.appendChild(row);
    }
  }

  // Add event listeners
  addRouteBtn.addEventListener("click", function () {
    addRow(routesTable, "route");
  });

  addVehicleBtn.addEventListener("click", function () {
    addRow(vehiclesTable, "vehicle");
  });  


  // Route Merging Functionality
  mergeRoutesBtn.addEventListener("click", function () {
    const selectedRoutes = Array.from(
      document.querySelectorAll(".select-route-checkbox:checked")
    ).map((checkbox) => checkbox.closest("tr"));

    if (selectedRoutes.length < 2) {
      alert("Please select at least two routes to merge.");
      return;
    }

    // Ensure all selected routes have valid route numbers (i.e., they are saved)
    let routeNumbers = selectedRoutes.map((route) =>
      route.children[2].innerText.trim()
    );

    if (
      routeNumbers.some(
        (routeNo) => routeNo === "" || routeNo.toLowerCase().includes("enter")
      )
    ) {
      alert("Please enter and save valid Route Numbers before merging.");
      return;
    }

    // Format merged route number dynamically
    let routeNoText =
      "Route " +
      routeNumbers.slice(0, -1).join(", ") +
      " and " +
      routeNumbers.slice(-1) +
      " merged";

    // Extract common details dynamically
    let startLocation = selectedRoutes[0].children[3].innerText;
    let totalStops = selectedRoutes.length; // Number of merged routes
    let assignedVehicle = selectedRoutes[0].children[5].innerText;
    let assignedDriver = selectedRoutes[0].children[6].innerText;
    let spocName = selectedRoutes[0].children[7].innerText;
    let spocContact = selectedRoutes[0].children[8].innerText;

    // Remove selected routes
    selectedRoutes.forEach((route) => route.remove());

    // Create merged route row dynamically
    let mergedRow = document.createElement("tr");
    mergedRow.innerHTML = `
    <td><input type="checkbox" class="select-route-checkbox"></td>
    <td>${routeId++}</td>
    <td contenteditable="true">${routeNoText}</td>
    <td contenteditable="true">${startLocation}</td>
    <td contenteditable="true">${totalStops}</td>
    <td contenteditable="true">${assignedVehicle}</td>
    <td contenteditable="true">${assignedDriver}</td>
    <td contenteditable="true">${spocName}</td>
    <td contenteditable="true">${spocContact}</td>
    <td contenteditable="true">Merged</td>
    <td>
      <button class="edit"><i class="far fa-edit"></i></button>
      <button class="delete"><i class="fas fa-trash"></i></button>
    </td>
  `;

    routesTable.appendChild(mergedRow);
    alert("Routes merged successfully!");
  });


});

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
  async function checkEmergencyAlerts() {
    try {
      const emergencyAlertsRef = collection(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "Emergency_Alert");
      const snapshot = await getDocs(emergencyAlertsRef);

      if (snapshot.empty) {
        console.log("No emergency alerts found.");
        return;
      }

      snapshot.forEach(async (alertDoc) => {
        const alertData = alertDoc.data();
        const { message, timestamp, driverName, driverRoute, name, routeNo } = alertData;
      
        let senderInfo = "";
      
        // ✅ Student & Driver Alerts Handling
if (message) {
  // 🚨 Common Fields
  const baseTime = `Time: ${timestamp}`;
  const baseMsg = `Message: ${message}`;

  // 🚨 Student Alerts
  if (message.includes("from Student")) {
    if (message.includes("Accident")) {
      senderInfo = `🚨 Student Accident Alert\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Bus Breakdown")) {
      senderInfo = `🚧 Student Breakdown Alert\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Medical Emergency")) {
      senderInfo = `🏥 Student Medical Emergency\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Fire Emergency")) {
      senderInfo = `🔥 Student Fire Emergency\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Speed Alert")) {
      senderInfo = `🚨 Student Speed Alert\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    } else {
      senderInfo = `👤 Unknown Student Alert\nName: ${name}\nRoute: ${routeNo}\n${baseTime}\n${baseMsg}`;
    }
  }

  // 🚨 Driver Alerts
  else if (message.includes("from Driver")) {
    const driverNameToDisplay = driverName ?? "Unknown Driver";
    const driverRouteToDisplay = driverRoute ?? "Unknown Route";

    if (message.includes("Accident")) {
      senderInfo = `🚨 Driver Accident Alert\nDriver Name: ${driverNameToDisplay}\nRoute: ${driverRouteToDisplay}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Bus Breakdown")) {
      senderInfo = `🚧 Driver Breakdown Alert\nDriver Name: ${driverNameToDisplay}\nRoute: ${driverRouteToDisplay}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Medical Emergency")) {
      senderInfo = `🏥 Driver Medical Emergency\nDriver Name: ${driverNameToDisplay}\nRoute: ${driverRouteToDisplay}\n${baseTime}\n${baseMsg}`;
    } else if (message.includes("Fire Emergency")) {
      senderInfo = `🔥 Driver Fire Emergency\nDriver Name: ${driverNameToDisplay}\nRoute: ${driverRouteToDisplay}\n${baseTime}\n${baseMsg}`;
    } else {
      senderInfo = `👤 Unknown Driver Alert\nDriver Name: ${driverNameToDisplay}\nRoute: ${driverRouteToDisplay}\n${baseTime}\n${baseMsg}`;
    }
  }

  // ❌ Unknown Sender
  else {
    senderInfo = `👤 Unknown Sender\n${baseTime}\n${baseMsg}`;
  }
}
      
        const confirmDelete = confirm(`${senderInfo}\n\nClick OK to acknowledge and delete this alert.`);
      
        if (confirmDelete) {
          await deleteDoc(doc(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "Emergency_Alert", alertDoc.id));
          console.log(`Alert with ID ${alertDoc.id} removed from Firestore.`);
        }
      });
      
    } catch (error) {
      console.error("Error checking emergency alerts:", error);
    }
  }

  // Initially check for emergency alerts
  checkEmergencyAlerts();
  setInterval(checkEmergencyAlerts, 30000); // Every 30 seconds
});
