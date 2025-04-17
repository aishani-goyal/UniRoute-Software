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
  

  const driversTable = document.querySelector("#drivers-table tbody");
  const addDriverBtn = document.getElementById("add-driver");
  const saveDriverBtn = document.getElementById("save-drivers");
  const instituteId = localStorage.getItem("InstituteName");

  const driversRef = db
    .collection("institutes")
    .doc(instituteId)
    .collection("Drivers");
  
  const usedIds = new Set();
  
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
    const currentDriverId = driver
      ? parseInt(driver.driverId)
      : getSmallestAvailableId();
  
    if (isNew) usedIds.add(currentDriverId);
  
    const uniqueId = docId || `${currentDriverId}`; // ✅ Use driverId as document ID
    const disabledAttr = isNew ? "" : "disabled";
  
    let row = document.createElement("tr");
    row.setAttribute("data-id", uniqueId); // ✅ Store actual driverId here
  
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
      const confirmation = confirm("❗ Are you sure you want to delete this driver?");
      if (!confirmation) return;
  
      usedIds.delete(idToRemove);
      row.remove();
  
      if (docId) {
        try {
          await driversRef.doc(docId).delete();
          alert("✅ Driver deleted successfully!");
          console.log("Driver deleted from Firebase ✅");
        } catch (error) {
          console.error("❌ Error deleting driver:", error);
          alert("⚠️ Failed to delete driver. Please try again.");
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
  
    driverRows.forEach((row) => {
      const docId = row.cells[0].innerText.trim(); // ✅ Use driverId from first column
      const cells = row.querySelectorAll("input");
  
      const name = cells[0].value.trim();
      const contact = cells[1].value.trim();
      const vehicle = cells[2].value.trim();
      const route = cells[3].value.trim();
  
      if (!name || !contact || !vehicle || !route) {
        alert("Please fill out all fields before saving.");
        hasError = true;
        return;
      }
  
      const driverData = {
        driverId: docId,
        name,
        contact,
        vehicle,
        route,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };
  
      const driverDocRef = driversRef.doc(docId); // ✅ Save with driverId
      batch.set(driverDocRef, driverData);
    });
  
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
  

  //Load driver data
  async function loadDrivers() {
    try {
      const snapshot = await driversRef.orderBy("driverId").get();
      if (snapshot.empty) {
        driversTable.innerHTML = `<tr id="no-drivers"><td colspan="6" style="text-align:center;">No drivers found</td></tr>`;
        return;
      }

      snapshot.docs
  .sort((a, b) => parseInt(a.data().driverId) - parseInt(b.data().driverId))
  .forEach((doc) => {
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

document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();
  const instituteId = localStorage.getItem("InstituteName");
  const driversRef = db
    .collection("institutes")
    .doc(instituteId)
    .collection("Drivers");
  const driversTable = document.querySelector("#drivers-table tbody");

  const usedIds = new Set();

  // 🔘 Upload Button Trigger
  document.getElementById("add3").addEventListener("click", () => {
    document.getElementById("excelFile").click();
  });

  // 📂 Handle Excel File Selection
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

      if (
        "ID" in firstRow &&
        "Driver Name" in firstRow &&
        "Contact No." in firstRow &&
        "Assigned Vehicle" in firstRow &&
        "Assigned Route" in firstRow
      ) {
        uploadDriversToFirestore(jsonData);
      } else {
        alert("❌ Unknown data format. Please upload a valid Drivers sheet.");
      }
    };

    reader.readAsArrayBuffer(file);
  });

  // 🚐 Upload Drivers to Firestore
  async function uploadDriversToFirestore(data) {
    const uploadPromises = data.map((row, index) => {
      const cleanedRow = {};
      Object.keys(row).forEach((key) => {
        const trimmedKey = key.trim();
        const trimmedValue =
          typeof row[key] === "string" ? row[key].trim() : row[key];
        cleanedRow[trimmedKey] = trimmedValue;
      });

      const driverId = String(cleanedRow["ID"]);
      const name = cleanedRow["Driver Name"];
      const contact = cleanedRow["Contact No."];
      const vehicle = cleanedRow["Assigned Vehicle"];
      const route = cleanedRow["Assigned Route"];

      if (!driverId || !name || !contact || !vehicle || !route) {
        console.warn(`⚠ Skipping row ${index + 1} due to missing fields.`);
        return Promise.resolve(); // Skip
      }

      const driverData = {
        driverId,
        name,
        contact,
        vehicle,
        route,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      return driversRef
        .doc(driverId)
        .set(driverData)
        .then(() => {
          console.log("✅ Uploaded driver:", driverData);
        })
        .catch((error) => {
          console.error("❌ Driver Upload Error:", error);
        });
    });

    await Promise.all(uploadPromises);
    alert("✅ Drivers uploaded successfully!");

    // ✅ Wait briefly to allow Firestore sync
    setTimeout(() => {
      loadDrivers();
    }, 1000);
  }
});
const instituteId = localStorage.getItem("InstituteName");
const vendorRef = db
  .collection("institutes")
  .doc(instituteId)
  .collection("Vendors")
  .doc("mainVendor");

const inputs = {
  companyName: document.getElementById("company-name"),
  ownerName: document.getElementById("owner-name"),
  contact: document.getElementById("vendor-contact"),
  email: document.getElementById("vendor-email"),
  address: document.getElementById("vendor-address"),
};

const editBtn = document.getElementById("edit-vendor");
const saveBtn = document.getElementById("save-vendor");

// 🔒 Disable or enable all fields
function setInputsDisabled(disabled) {
  Object.values(inputs).forEach((input) => {
    input.disabled = disabled;
  });
}

// ✏️ Edit Button
editBtn.addEventListener("click", () => {
  setInputsDisabled(false);
});

// 💾 Save Button
saveBtn.addEventListener("click", async () => {
  const vendorData = {
    companyName: inputs.companyName.value.trim(),
    ownerName: inputs.ownerName.value.trim(),
    contact: inputs.contact.value.trim(),
    email: inputs.email.value.trim(),
    address: inputs.address.value.trim(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await vendorRef.set(vendorData);
    alert("✅ Vendor details saved successfully!");
    setInputsDisabled(true);
  } catch (error) {
    console.error("❌ Error saving vendor data:", error);
    alert("❌ Failed to save vendor details.");
  }
});

// 🔁 Load Existing Vendor Data
async function loadVendor() {
  try {
    const doc = await vendorRef.get();
    if (doc.exists) {
      const data = doc.data();
      inputs.companyName.value = data.companyName || "";
      inputs.ownerName.value = data.ownerName || "";
      inputs.contact.value = data.contact || "";
      inputs.email.value = data.email || "";
      inputs.address.value = data.address || "";
    }
  } catch (error) {
    console.error("❌ Error loading vendor:", error);
  }
}

// 🚀 Load data on page load
document.addEventListener("DOMContentLoaded", loadVendor);
