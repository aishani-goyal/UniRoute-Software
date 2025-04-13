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

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Reference to Firestore subcollections under a specific institute
const routesRef = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("routes");
const vehiclesRef = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("vehicles");
const driversRef = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("drivers");
const vendorsRef = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("vendors"); // ✅ Corrected vendors collection reference

// Function to save vehicle details

document.addEventListener("DOMContentLoaded", function () {
  const editButton = document.getElementById("add-vehicle");
  const saveButton = document.getElementById("save-vehicles");
  const inputFields = document.querySelectorAll(".vendor-info input"); // Select all input fields

  // Initially, disable all input fields
  inputFields.forEach((field) => field.setAttribute("disabled", true));

  // Enable fields when Edit button is clicked
  editButton.addEventListener("click", function () {
    inputFields.forEach((field) => field.removeAttribute("disabled"));
    saveButton.style.display = "inline-block"; // Show Save button
  });

  // Save vehicle details to Firestore
  saveButton.addEventListener("click", async function () {
    const vehicleRows = document.querySelectorAll("#vehicles-table tbody tr");

    if (vehicleRows.length === 1 && vehicleRows[0].id === "no-vehicles") {
      alert("Please add vehicles before saving.");
      return;
    }

    try {
      // Step 1: Get all existing vehicle IDs from Firestore
      const snapshot = await vehiclesRef.get();
      const existingIds = snapshot.docs.map((doc) => doc.id);
      const existingIdSet = new Set(existingIds); // to check existing ones in Firestore
      const usedIds = new Set(existingIds); // to keep track of all being used (Firestore + table)
      let newId = 1;

      const batch = firebase.firestore().batch();

      vehicleRows.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length > 1) {
          let vehicleId = cells[0].innerText.trim();
          const isEmptyId = !vehicleId || vehicleId === "";
          const isNotNumber = !/^\d+$/.test(vehicleId);
          const isNewDuplicate =
            usedIds.has(vehicleId) && !existingIdSet.has(vehicleId);

          // Assign new ID if: it's blank, not a number, or a duplicate in the new session
          if (isEmptyId || isNotNumber || isNewDuplicate) {
            while (usedIds.has(newId.toString())) {
              newId++;
            }
            vehicleId = newId.toString();
            cells[0].innerText = vehicleId; // update table cell with new ID
            usedIds.add(vehicleId);
            newId++;
          } else {
            usedIds.add(vehicleId); // keep track of this ID
          }

          const vehicleDocRef = vehiclesRef.doc(vehicleId);
          batch.set(vehicleDocRef, {
            id: vehicleId,
            vehicleNumber: cells[1].innerText.trim(),
            vehicleType: cells[2].innerText.trim(),
            capacity: cells[3].innerText.trim(),
            assignedRoute: cells[4].innerText.trim(),
            assignedDriver: cells[5].innerText.trim(),
            status: cells[6].innerText.trim(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      });

      await batch.commit();
      alert("All vehicles have been successfully saved! ✅");
    } catch (error) {
      console.error("Error saving vehicles:", error);
      alert("Error saving vehicle details. Please try again.");
    }
  });
});

document.getElementById("save-routes").addEventListener("click", async () => {
  const tableRows = document.querySelectorAll("#routes-table tbody tr");
  const routesRef = firebase
    .firestore()
    .collection("institutes")
    .doc("iEe3BjNAYl4nqKJzCXlH")
    .collection("routes");

  try {
    // Step 1: Fetch existing IDs from Firestore
    const snapshot = await routesRef.get();
    const existingIds = snapshot.docs.map((doc) => doc.id);
    const existingIdSet = new Set(existingIds);

    // Step 2: Track new IDs to avoid duplicates
    let newId = 1;
    const usedIds = new Set(existingIds); // Already used in Firestore
    const savePromises = [];

    tableRows.forEach((row) => {
      const columns = row.querySelectorAll("td");
      let routeId = columns[1].innerText.trim(); // Read ID from table

      // Step 3: Check if it's a new row (ID is missing or ID already exists in Firestore)
      const isEmptyId = !routeId || routeId === "";
      const isDuplicateId = usedIds.has(routeId);

      if (
        isEmptyId ||
        !/^\d+$/.test(routeId) ||
        (isDuplicateId && !existingIdSet.has(routeId))
      ) {
        // Assign new ID only if:
        // - it's blank
        // - not a number
        // - it's a duplicate in this session but not already saved

        while (usedIds.has(newId.toString())) {
          newId++;
        }

        routeId = newId.toString();
        columns[1].innerText = routeId; // update table cell visually
        usedIds.add(routeId);
        newId++;
      } else {
        usedIds.add(routeId); // track this to avoid re-assigning it again
      }

      const routeData = {
        id: routeId,
        route_number: columns[2].innerText.trim(),
        start_location: columns[3].innerText.trim(),
        total_stops: parseInt(columns[4].innerText.trim()) || 0,
        assigned_vehicle: columns[5].innerText.trim(),
        assigned_driver: columns[6].innerText.trim(),
        spoc_name: columns[7].innerText.trim(),
        spoc_contact: columns[8].innerText.trim(),
        merge_status: columns[9].innerText.trim(),
      };

      // Save or overwrite the correct document in Firestore
      savePromises.push(routesRef.doc(routeId).set(routeData));
    });

    await Promise.all(savePromises);
    alert("All routes have been successfully saved! ✅");
  } catch (error) {
    console.error("Error saving routes:", error);
    alert("Failed to save some routes. ❌ Check the console for errors.");
  }
});

function loadRoutesData() {
  db.collection("institutes")
    .doc("iEe3BjNAYl4nqKJzCXlH")
    .collection("routes")
    .get()
    .then((querySnapshot) => {
      const tbody = document.querySelector("#routes-table tbody");
      if (querySnapshot.empty) {
        tbody.innerHTML = `<tr id="no-routes"><td colspan="11" style="text-align:center;">No routes found</td></tr>`;
        return;
      }
      tbody.innerHTML = ""; // Clear existing data to prevent duplicates

      querySnapshot.docs
  .sort((a, b) => parseInt(a.id) - parseInt(b.id))
  .forEach((doc) => {

        const data = doc.data();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td><input type="checkbox" class="route-select"></td>
          <td>${doc.id}</td>
          <td class="editable">${data.route_number || ""}</td>
          <td class="editable">${data.start_location || ""}</td>
          <td class="editable">${data.total_stops || 0}</td>
          <td class="editable">${data.assigned_vehicle || ""}</td>
          <td class="editable">${data.assigned_driver || ""}</td>
          <td class="editable">${data.spoc_name || ""}</td>
          <td class="editable">${data.spoc_contact || ""}</td>
          <td class="editable">${data.merge_status || ""}</td>
          <td>
            <button class="edit"><i class="far fa-edit"></i></button>
            <button class="delete"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading routes data: ", error);
    });
}

function loadVehiclesData() {
  db.collection("institutes")
    .doc("iEe3BjNAYl4nqKJzCXlH")
    .collection("vehicles")
    .get()
    .then((querySnapshot) => {
      const tbody = document.querySelector("#vehicles-table tbody");
      tbody.innerHTML = ""; // Clear existing data to prevent duplicates
      if (querySnapshot.empty) {
        tbody.innerHTML = `<tr id="no-vehicles"><td colspan="8" style="text-align:center;">No vehicles found</td></tr>`;
        return;
      }

      querySnapshot.docs
  .sort((a, b) => parseInt(a.id) - parseInt(b.id))
  .forEach((doc) => {

        const data = doc.data();

        const row = document.createElement("tr");
        row.innerHTML = `
                  <td>${doc.id}</td>
                  <td class="editable">${data.vehicleNumber}</td>
                  <td class="editable">${data.vehicleType}</td>
                  <td class="editable">${data.capacity}</td>
                  <td class="editable">${data.assignedRoute}</td>
                  <td class="editable">${data.assignedDriver}</td>
                  <td class="editable">${data.status}</td>
                  <td>
                      <button class="edit"><i class="far fa-edit"></i></button>
                      <button class="delete"><i class="fas fa-trash"></i></button>
                  </td>
              `;
        tbody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error("Error loading vehicle data: ", error);
    });
}
window.addEventListener("load", () => {
  loadRoutesData();
  loadVehiclesData();
});

// Function to handle table actions (Edit/Delete)
async function handleTableActions(tableId, ref) {
  document
    .querySelector(`#${tableId} tbody`)
    .addEventListener("click", async (event) => {
      const button = event.target.closest("button"); // Get the clicked button
      if (!button) return;

      const row = button.closest("tr");
      let docId;

      if (tableId === "routes-table") {
        docId = row.children[1].textContent.trim(); // "Route No." (2nd column)
      } else if (tableId === "vehicles-table") {
        docId = row.children[0].textContent.trim(); // "ID" (1st column)
      }

      if (!docId) {
        alert("Error: Missing document ID!");
        return;
      }

      if (button.classList.contains("delete")) {
        // DELETE Functionality
        if (
          confirm(`Are you sure you want to delete this entry from ${tableId}?`)
        ) {
          try {
            await ref.doc(docId).delete(); // Delete from Firestore
            row.remove(); // Remove row from UI
            alert("Entry deleted successfully.");
            console.log(`Deleted document with ID: ${docId}`);
          } catch (error) {
            console.error(`Error deleting entry from ${tableId}:`, error);
            alert(`Failed to delete the entry from ${tableId}.`);
          }
        }
      } else if (button.classList.contains("edit")) {
        // EDIT Functionality
        const editableCells = row.querySelectorAll(".editable");

        if (button.classList.contains("editing")) {
          // Save changes
          button.innerHTML = '<i class="far fa-edit"></i>'; // Reset to edit icon
          button.classList.remove("editing");
        } else {
          // Disable editing for all rows before enabling this one
          document.querySelectorAll(`#${tableId} tbody tr`).forEach((tr) => {
            tr.querySelectorAll(".editable").forEach((cell) => {
              cell.setAttribute("contenteditable", "false");
            });

            const otherEditButton = tr.querySelector(".edit");
            if (otherEditButton) {
              otherEditButton.innerHTML = '<i class="far fa-edit"></i>';
              otherEditButton.classList.remove("editing");
            }
          });

          // Enable editing for this row
          editableCells.forEach((cell) => {
            cell.setAttribute("contenteditable", "true");
            cell.focus();
          });

          button.innerHTML = '<i class="fas fa-save"></i>'; // Change icon to save
          button.classList.add("editing");
        }
      }
    });
}

// Function to Save Changes on Button Click
async function saveChanges(tableId, ref) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);

  for (const row of rows) {
    let docId =
      row.children[tableId === "routes-table" ? 1 : 0].textContent.trim();

    if (!docId) {
      console.error(`Missing document ID in table ${tableId}`);
      continue;
    }

    const docRef = ref.doc(docId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.error(`No document found with ID: ${docId} in ${tableId}`);

      continue;
    }

    const updatedData = {};
    row.querySelectorAll(".editable").forEach((cell) => {
      updatedData[cell.getAttribute("data-field")] = cell.textContent.trim();
    });

    try {
      await docRef.update(updatedData);

      row.querySelectorAll(".editable").forEach((cell) => {
        cell.setAttribute("contenteditable", "false");
      });

      const editButton = row.querySelector(".edit");
      if (editButton) {
        editButton.innerHTML = '<i class="far fa-edit"></i>';
        editButton.classList.remove("editing");
      }
    } catch (error) {
      console.error(`Error saving changes in ${tableId}:`, error);
      alert(`Failed to save changes in ${tableId}.`);
    }
  }
}

// Firestore References
const routes = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("routes");
const vehicles = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("vehicles");

// Apply to both Routes and Vehicles tables
handleTableActions("routes-table", routes);
handleTableActions("vehicles-table", vehicles);

// Save buttons
document.getElementById("save-routes").addEventListener("click", () => {
  saveChanges("routes-table", routes);
});

document.getElementById("save-vehicles").addEventListener("click", () => {
  saveChanges("vehicles-table", vehicles);
});

document.getElementById("add").addEventListener("click", () => {
  document.getElementById("excelFile").click();
});
document.getElementById("add2").addEventListener("click", () => {
  document.getElementById("excelFile").click();
});

document.getElementById("excelFile").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
      alert("⚠ No data found in the Excel sheet!");
      return;
    }

    const firstRow = jsonData[0];

    if ("Route No." in firstRow && "Starting Point" in firstRow) {
      uploadRoutesToFirestore(jsonData); // Routes data
    } else if (
      "vehicleNumber" in firstRow &&
      "vehicleType" in firstRow &&
      "capacity" in firstRow &&
      "assignedRoute" in firstRow &&
      "assignedDriver" in firstRow &&
      "status" in firstRow
    ) {
      uploadVehiclesToFirestore(jsonData); // Vehicles data
    } else {
      alert(
        "❌ Unknown data format. Please upload a valid Routes or Vehicles sheet."
      );
    }
  };

  reader.readAsArrayBuffer(file);
});

// 🔁 Upload Routes to Firestore
async function uploadRoutesToFirestore(data) {
  const uploadPromises = data.map((row) => {
    const routeData = {
      route_number: row["Route No."],
      start_location: row["Starting Point"],
      total_stops: row["Total Stops"],
      assigned_vehicle: row["Assigned Vehicle"],
      assigned_driver: row["Assigned Driver"],
      spoc_name: row["SPOC Name"],
      spoc_contact: row["SPOC Contact"],
      merge_status: row["Merge Status"],
    };

    const docId = String(row["ID"]);

    return db
      .collection("institutes")
      .doc("iEe3BjNAYl4nqKJzCXlH")
      .collection("routes")
      .doc(docId)
      .set(routeData)
      .then(() => {
        console.log("✅ Uploaded route:", routeData);
      })
      .catch((error) => {
        console.error("❌ Route Upload Error:", error);
      });
  });

  await Promise.all(uploadPromises);
  alert("✅ Routes uploaded successfully!");
  loadRoutesData();
}

// 🚚 Upload Vehicles to Firestore
async function uploadVehiclesToFirestore(data) {
  const uploadPromises = data.map((row, index) => {
    // 🔍 Debug: Clean up and inspect row
    const cleanedRow = {};
    Object.keys(row).forEach((key) => {
      const trimmedKey = key.trim();
      const trimmedValue =
        typeof row[key] === "string" ? row[key].trim() : row[key];
      cleanedRow[trimmedKey] = trimmedValue;
    });

    console.log(`🔍 Cleaned Row ${index + 1}:`, cleanedRow);

    const vehicle_no = cleanedRow["vehicleNumber"];
    const vehicle_type = cleanedRow["vehicleType"];
    const capacity = cleanedRow["capacity"];
    const assigned_route = cleanedRow["assignedRoute"];
    const assigned_driver = cleanedRow["assignedDriver"];
    const status = cleanedRow["status"];
    const docId = String(cleanedRow["ID"]);

    if (
      !vehicle_no ||
      !vehicle_type ||
      !capacity ||
      !assigned_route ||
      !assigned_driver ||
      !status ||
      !docId
    ) {
      console.warn(`⚠ Skipping row ${index + 1} due to missing fields.`);
      return Promise.resolve(); // Skip this row
    }

    const vehicleData = {
      vehicleNumber: vehicle_no,
      vehicleType: vehicle_type,
      capacity,
      assignedRoute: assigned_route,
      assignedDriver: assigned_driver,
      status,
    };

    return db
      .collection("institutes")
      .doc("iEe3BjNAYl4nqKJzCXlH")
      .collection("vehicles")
      .doc(docId)
      .set(vehicleData)
      .then(() => {
        console.log("✅ Uploaded vehicle:", vehicleData);
      })
      .catch((error) => {
        console.error("❌ Vehicle Upload Error:", error);
      });
  });

  await Promise.all(uploadPromises);
  alert("✅ Vehicles uploaded successfully!");
  loadVehiclesData();
}



document.getElementById("merge-routes").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(".route-select:checked");
  if (checkboxes.length !== 2) {
    alert("Please select exactly two routes to merge.");
    return;
  }

  const rows = Array.from(checkboxes).map(cb => cb.closest("tr"));
  const [row1, row2] = rows;

  const cols1 = row1.querySelectorAll("td");
  const cols2 = row2.querySelectorAll("td");

  // Extract values
  const route_number = `${cols1[2].innerText.trim()} + ${cols2[2].innerText.trim()}`;
  const start_location = cols1[3].innerText.trim(); // take from first row
  const total_stops =
    (parseInt(cols1[4].innerText.trim()) || 0) +
    (parseInt(cols2[4].innerText.trim()) || 0);

  // Fill from first selected row
  const assigned_vehicle = cols1[5].innerText.trim();
  const assigned_driver = cols1[6].innerText.trim();
  const spoc_name = cols1[7].innerText.trim();
  const spoc_contact = cols1[8].innerText.trim();
  const merge_status = "merged";

  // Generate unique merged ID
  let maxMergedId = 0;
  document.querySelectorAll("#routes-table tbody tr").forEach(row => {
    const idCell = row.cells[1]; // ID column
    if (idCell) {
      const idText = idCell.innerText.trim();
      const match = idText.match(/^Merged-(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        if (!isNaN(num)) {
          maxMergedId = Math.max(maxMergedId, num);
        }
      }
    }
  });
  const uniqueId = `Merged-${maxMergedId + 1}`;

  // Create new row
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="checkbox" class="route-select"></td>
    <td>${uniqueId}</td>
    <td class="editable">${route_number}</td>
    <td class="editable">${start_location}</td>
    <td class="editable">${total_stops}</td>
    <td class="editable">${assigned_vehicle}</td>
    <td class="editable">${assigned_driver}</td>
    <td class="editable">${spoc_name}</td>
    <td class="editable">${spoc_contact}</td>
    <td class="editable">${merge_status}</td>
    <td>
      <button class="edit"><i class="far fa-edit"></i></button>
      <button class="delete"><i class="fas fa-trash"></i></button>
    </td>
  `;

  document.querySelector("#routes-table tbody").appendChild(newRow);
  alert("Merged route added. Don’t forget to click 'Save Routes' to store it in Firestore.");
});

