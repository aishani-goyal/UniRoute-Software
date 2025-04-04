// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
  authDomain: "uniroute-3dda9.firebaseapp.com",
  databaseURL:
    "https://uniroute-3dda9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "uniroute-3dda9",
  storageBucket: "uniroute-3dda9.firebasestorage.app",
  messagingSenderId: "465796690799",
  appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
  measurementId: "G-VWEFWH2517",
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener("DOMContentLoaded", function () {
  let usedIds = new Set();

  const driversTable = document.querySelector("#drivers-table tbody");
  const addDriverBtn = document.getElementById("add-driver");
  const saveDriverBtn = document.getElementById("save-drivers");

  const driversRef = db
    .collection("institutes")
    .doc("iEe3BjNAYl4nqKJzCXlH")
    .collection("Drivers");

  function getSmallestAvailableId() {
    let id = 1;
    while (usedIds.has(id)) {
      id++;
    }
    return id;
  }

  function addDriverRow(driver = null, docId = null) {
    if (document.getElementById("no-drivers")) {
      document.getElementById("no-drivers").remove();
    }

    const isNew = !driver;
    const currentDriverId = driver ? parseInt(driver.driverId) : getSmallestAvailableId();
    if (isNew) usedIds.add(currentDriverId);

    const uniqueId = docId || `temp-${Date.now()}`; // Temporary ID until saved
    const disabledAttr = isNew ? "" : "disabled";

    let row = document.createElement("tr");
    row.setAttribute("data-id", uniqueId);

    row.innerHTML = `
      <td>${currentDriverId}</td>
      <td><input type="text" class="driver-name" value="${driver ? driver.name : ""}" ${disabledAttr}></td>
      <td><input type="text" class="contact-number" value="${driver ? driver.contact : ""}" ${disabledAttr}></td>
      <td><input type="text" class="assigned-vehicle" value="${driver ? driver.vehicle : ""}" ${disabledAttr}></td>
      <td><input type="text" class="assigned-route" value="${driver ? driver.route : ""}" ${disabledAttr}></td>
      <td>
        <button class="edit"><i class="far fa-edit"></i></button>
        <button class="delete"><i class="fas fa-trash"></i></button>
      </td>
    `;

    driversTable.appendChild(row);

    let editButton = row.querySelector(".edit");
    let deleteButton = row.querySelector(".delete");
    let inputFields = row.querySelectorAll("input");

    editButton.addEventListener("click", function () {
      inputFields.forEach((field) => field.removeAttribute("disabled"));
    });

    deleteButton.addEventListener("click", async function () {
      const idToRemove = parseInt(row.cells[0].innerText.trim());
      usedIds.delete(idToRemove);
      row.remove();

      if (docId && !docId.startsWith("temp-")) {
        try {
          await driversRef.doc(docId).delete();
          console.log("Driver deleted from Firebase ✅");
        } catch (error) {
          console.error("Error deleting driver:", error);
        }
      }
    });

    row.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  addDriverBtn.addEventListener("click", function () {
    addDriverRow();
  });

  saveDriverBtn.addEventListener("click", async function () {
    const driverRows = document.querySelectorAll("#drivers-table tbody tr");

    if (driverRows.length === 0) {
      alert("Please add drivers before saving.");
      return;
    }

    let batch = db.batch();
    let hasError = false;

    for (let row of driverRows) {
      const cells = row.querySelectorAll("input");

      const name = cells[0].value.trim();
      const contact = cells[1].value.trim();
      const vehicle = cells[2].value.trim();
      const route = cells[3].value.trim();

      if (!name || !contact || !vehicle || !route) {
        alert("Please fill out all fields before saving.");
        hasError = true;
        break;
      }

      // Construct docId as "driver name_route no."
      const safeName = name.replace(/\s+/g, "_").toLowerCase();
      const safeRoute = route.replace(/\s+/g, "_").toLowerCase();
      const newDocId = `${safeName}_${safeRoute}`;

      row.setAttribute("data-id", newDocId); // Update row for future reference

      const driverData = {
        driverId: row.cells[0].innerText.trim(),
        name,
        contact,
        vehicle,
        route,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      const driverDocRef = driversRef.doc(newDocId);
      batch.set(driverDocRef, driverData);
    }

    if (hasError) return;

    try {
      await batch.commit();
      alert("All drivers saved successfully! ✅");

      driverRows.forEach((row) => {
        const inputs = row.querySelectorAll("input");
        inputs.forEach((input) => input.setAttribute("disabled", true));
      });

    } catch (error) {
      console.error("Error saving drivers:", error);
      alert("Error saving drivers. Please try again.");
    }
  });

  async function loadDrivers() {
    try {
      const snapshot = await driversRef.orderBy("driverId").get();
      if (snapshot.empty) {
        driversTable.innerHTML = `<tr id="no-drivers"><td colspan="6" style="text-align:center;">No drivers found</td></tr>`;
        return;
      }

      snapshot.forEach((doc) => {
        const driverData = doc.data();
        usedIds.add(parseInt(driverData.driverId));
        addDriverRow(driverData, doc.id);
      });
    } catch (error) {
      console.error("Error loading drivers:", error);
    }
  }

  loadDrivers();
});
