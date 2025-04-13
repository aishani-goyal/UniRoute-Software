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
  storageBucket: "uniroute-3dda9.appspot.com",
  messagingSenderId: "465796690799",
  appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
  measurementId: "G-VWEFWH2517",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const studentsRef = db
  .collection("institutes")
  .doc("iEe3BjNAYl4nqKJzCXlH")
  .collection("Students");

document.addEventListener("DOMContentLoaded", () => {
  const studentsTable = document.querySelector("#students-table tbody");
  const addBtn = document.getElementById("add-student");
  const saveBtn = document.getElementById("save-students");
  const uploadBtn = document.getElementById("upload-student");
  const fileInput = document.getElementById("excelFile");
  const usedIds = new Set();

  function getNextId() {
    let id = 1;
    while (usedIds.has(id)) id++;
    return id;
  }

  function createRow(student = {}, docId = null) {
    if (document.getElementById("no-students")) {
      document.getElementById("no-students").remove();
    }

    const id = student.studentId ? parseInt(student.studentId) : getNextId();
    usedIds.add(id);

    const uniqueId = docId || `student-${Date.now()}`;
    const isNew = !student.studentId;

    const row = document.createElement("tr");
    row.setAttribute("data-id", uniqueId);
    row.innerHTML = `
      <td>${id}</td>
      <td contenteditable="${isNew}">${student.name || "Enter Name"}</td>
      <td contenteditable="${isNew}">${student.roll || "Enter Roll No."}</td>
      <td contenteditable="${isNew}">${student.email || "Enter Email"}</td>
      <td contenteditable="${isNew}">${student.contact || "Enter Contact"}</td>
      <td contenteditable="${isNew}">${
      student.routeNo || "Enter Route No."
    }</td>
    <td contenteditable="${isNew}">${student.feeStatus || "Pending"}</td>
      <td>
        <button class="edit"><i class="far fa-edit"></i></button>
        <button class="delete"><i class="fas fa-trash"></i></button>
        <button class="send" data-student-id="${id}" data-email="${
      student.email
    }">
        <i class="fas fa-paper-plane"></i>
      </button>
      </td>
    `;

    const editBtn = row.querySelector(".edit");
    const deleteBtn = row.querySelector(".delete");

    editBtn.addEventListener("click", async () => {
      const editableCells = row.querySelectorAll("td[contenteditable]");
      const isEditing = editBtn.classList.contains("editing");

      if (!isEditing) {
        // 🔒 Lock all other rows and reset their buttons
        document
          .querySelectorAll("#students-table tbody tr")
          .forEach((otherRow) => {
            if (otherRow !== row) {
              otherRow
                .querySelectorAll("td[contenteditable]")
                .forEach((cell) => {
                  cell.setAttribute("contenteditable", "false");
                });
              const otherEditBtn = otherRow.querySelector(".edit");
              if (otherEditBtn) {
                otherEditBtn.innerHTML = '<i class="far fa-edit"></i>';
                otherEditBtn.classList.remove("editing");
              }
            }
          });

        // ✅ Make current row editable
        editableCells.forEach((cell) =>
          cell.setAttribute("contenteditable", "true")
        );
        editBtn.innerHTML = '<i class="fas fa-save"></i>';
        editBtn.classList.add("editing");
      } else {
        // ✅ Collect updated data
        const studentId = row.cells[0].innerText.trim();
        const student = {
          studentId: studentId,
          name: row.cells[1].innerText.trim(),
          roll: row.cells[2].innerText.trim(),
          email: row.cells[3].innerText.trim(),
          contact: row.cells[4].innerText.trim(),
          routeNo: row.cells[5].innerText.trim(),
          feestatus: row.cells[6].innerText.trim(),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        };

        if (Object.values(student).some((val) => !val)) {
          alert("⚠ Please fill all fields before saving.");
          return;
        }

        try {
          await studentsRef.doc(studentId).set(student);
          // 🔒 Lock row and switch icon back
          editableCells.forEach((cell) =>
            cell.setAttribute("contenteditable", "false")
          );
          editBtn.innerHTML = '<i class="far fa-edit"></i>';
          editBtn.classList.remove("editing");

          alert("✅ Student updated.");
        } catch (err) {
          console.error("Save error:", err);
          alert("❌ Error updating student.");
        }
      }
    });

    deleteBtn.addEventListener("click", async () => {
      const idToRemove = parseInt(row.cells[0].innerText.trim());
      const confirmDel = confirm("Delete this student?");
      if (!confirmDel) return;

      usedIds.delete(idToRemove);
      row.remove();

      if (docId) {
        try {
          await studentsRef.doc(docId).delete();
          alert("✅ Student deleted.");
        } catch (err) {
          console.error("Delete error:", err);
          alert("❌ Failed to delete.");
        }
      }
    });

    studentsTable.appendChild(row);
    row.scrollIntoView({ behavior: "smooth" });
  }

  async function loadStudents() {
    try {
      const snapshot = await studentsRef.orderBy("studentId").get();
      const students = [];

      if (snapshot.empty) {
        studentsTable.innerHTML = `<tr id="no-students"><td colspan="8" style="text-align:center">No students found.</td></tr>`;
        return;
      }

      // Step 1: Prepare all students first
      snapshot.docs
  .sort((a, b) => parseInt(a.data().studentId) - parseInt(b.data().studentId))
  .forEach((doc) => {
        const data = doc.data();
        usedIds.add(parseInt(data.studentId));
        students.push({ ...data, docId: doc.id });
      });

      // Step 2: Fetch Fees status for each student
      const feeChecks = await Promise.all(
        students.map(async (student) => {
          try {
            const feeDoc = await db.collection("Fees").doc(student.docId).get();
            if (feeDoc.exists) {
              const feeData = feeDoc.data();
              if (feeData.status === "Paid") {
                student.feeStatus = "Paid"; // Only set to Paid if it really is
              } else {
                student.feeStatus = "Pending";
              }
            }
          } catch (err) {
            console.warn("Error checking Fees for", student.docId, err);
          }
          return student;
        })
      );

      // Step 3: Clear table & append all rows together
      studentsTable.innerHTML = ""; // clear old rows
      feeChecks.forEach((student) => createRow(student, student.docId));
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  addBtn.addEventListener("click", () => createRow());

  saveBtn.addEventListener("click", async () => {
    const rows = studentsTable.querySelectorAll("tr");
    if (rows.length === 0) return alert("Add some students first.");

    const batch = db.batch();
    let hasError = false;

    rows.forEach((row) => {
      const studentId = row.cells[0].innerText.trim();
      const student = {
        studentId: studentId,
        name: row.cells[1].innerText.trim(),
        roll: row.cells[2].innerText.trim(),
        email: row.cells[3].innerText.trim(),
        contact: row.cells[4].innerText.trim(),
        routeNo: row.cells[5].innerText.trim(),
        feeStatus: row.cells[6].innerText.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (Object.values(student).some((val) => !val)) {
        alert("⚠ Fill all fields before saving.");
        hasError = true;
        return;
      }

      batch.set(studentsRef.doc(studentId), student);
    });

    if (hasError) return;

    try {
      await batch.commit();
      alert("✅ Students saved!");

      // Disable editing after saving
      rows.forEach((row) => {
        const editableCells = row.querySelectorAll("td[contenteditable]");
        editableCells.forEach((cell) =>
          cell.setAttribute("contenteditable", "false")
        );
      });
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving.");
    }
  });

  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (jsonData.length === 0) return alert("⚠ No data found in Excel.");
      const first = jsonData[0];

      if (
        "ID" in first &&
        "Name" in first &&
        "Roll No." in first &&
        "Email" in first &&
        "Contact No." in first &&
        "Route No." in first &&
        "Fee Status" in first
      ) {
        uploadToFirestore(jsonData);
      } else {
        alert(
          "❌ Excel headers don't match.\nExpected headers: ID, Name, Roll No., Email, Contact No., Route No."
        );
      }
    };
    reader.readAsArrayBuffer(file);
  });

  async function uploadToFirestore(data) {
    const uploads = data.map((row) => {
      const student = {
        studentId: String(row["ID"] || "").trim(),
        name: String(row["Name"] || "").trim(),
        roll: String(row["Roll No."] || "").trim(),
        email: String(row["Email"] || "").trim(),
        contact: String(row["Contact No."] || "").trim(),
        routeNo: String(row["Route No."] || "").trim(),
        feeStatus: String(row["Fee Status"] || "").trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };
      return studentsRef.doc(student.studentId).set(student);
    });

    await Promise.all(uploads);
    alert("✅ Excel uploaded.");
    setTimeout(loadStudents, 1000);
  }

  loadStudents();
});

// ✅ Custom password generator using first name and full roll
function createCustomPassword(name, roll) {
  const firstName = name.trim().split(" ")[0].toLowerCase(); // get first name in lowercase
  return `${firstName}_${roll}`;
}

// ✅ Main click event to handle the whole flow
document.addEventListener("click", async function (e) {
  if (e.target.closest(".send")) {
    const button = e.target.closest(".send");
    const studentId = button.dataset.studentId;

    if (!studentId) {
      alert("Missing student ID.");
      return;
    }

    // Disable button to avoid double clicks
    button.disabled = true;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i>`;

    try {
      // ✅ Step 1: Check if password already sent
      const existingDoc = await db
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("User_password")
        .doc(studentId)
        .get();

      if (existingDoc.exists) {
        alert("Password has already been sent to this student.");
        button.innerHTML = `<i class="fas fa-check-circle text-success"></i>`;
        return;
      }

      // ✅ Step 2: Fetch student data
      const studentDoc = await db
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("Students")
        .doc(studentId)
        .get();

      if (!studentDoc.exists) {
        throw new Error("Student record not found.");
      }

      const studentData = studentDoc.data();
      const { name, roll, email } = studentData;

      if (!name || !roll || !email) {
        throw new Error("Incomplete student data.");
      }

      // ✅ Step 3: Generate password
      const password = createCustomPassword(name, roll);

      // ✅ Step 4: Save password to Firestore
      await db
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("User_password")
        .doc(studentId)
        .set({
          email: email,
          password: password,
          timestamp: new Date(),
        });

      // ✅ Step 5: Send email via Flask API
      const res = await fetch(
        "https://uniroute-software.onrender.com/send-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send password");
      }

      button.innerHTML = `<i class="fas fa-check-circle text-success"></i>`;
      alert(`✅ Password sent to ${email}`);
    } catch (err) {
      console.error("❌ Error:", err);
      alert("❌ Failed to send password or store data.");
      button.disabled = false;
      button.innerHTML = `<i class="fas fa-paper-plane"></i>`;
    }
  }
});

// ✅ On page load, disable buttons for students already sent
window.addEventListener("DOMContentLoaded", () => {
  (async () => {
    const buttons = document.querySelectorAll(".send");

    for (const button of buttons) {
      const studentId = button.dataset.studentId;
      if (!studentId) continue;

      try {
        const passwordDoc = await db
          .collection("institutes")
          .doc("iEe3BjNAYl4nqKJzCXlH")
          .collection("User_password")
          .doc(studentId)
          .get();

        if (passwordDoc.exists) {
          button.disabled = true;
          button.innerHTML = `<i class="fas fa-check-circle text-success"></i>`;
        }
      } catch (err) {
        console.error(`Error for student ${studentId}:`, err);
      }
    }
  })();
});
