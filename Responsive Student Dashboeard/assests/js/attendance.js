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
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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

// 🔁 Get today's date as dd-mm-yyyy
function getTodayDate() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
const instituteId = localStorage.getItem("InstituteName");
// 🔍 Fetch roll number from logged in email
async function getRollFromEmail(email) {
  const studentsRef = collection(
    db,
    "institutes",
    instituteId,
    "Students"
  );
  const q = query(studentsRef, where("email", "==", email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    throw new Error("❌ No student found for this email.");
  }
  return snapshot.docs[0].data().roll;
}

// ✅ Function to store attendance in Firestore
async function markAttendance(roll) {
  const dateKey = getTodayDate();
  const attendancePath = collection(
    db,
    "institutes",
    instituteId,
    "Attendance",
    roll,
    dateKey
  );

  await addDoc(attendancePath, {
    roll: roll,
    status: "Present",
    timestamp: serverTimestamp(),
  });

  alert("✅ Attendance marked successfully!");
}

// 🚀 Start QR Code Scanner and attendance marking
document.addEventListener("DOMContentLoaded", async function () {
  const email = localStorage.getItem("loggedInEmail");

  if (!email) {
    alert("❌ Email not found in localStorage.");
    return;
  }

  const roll = await getRollFromEmail(email);

  const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 250,
  });
  html5QrcodeScanner.render(async function onScanSuccess(
    decodedText,
    decodedResult
  ) {
    console.log(`QR Code detected: ${decodedText}`);
    const params = new URLSearchParams(decodedText);
    const studentIDFromQR = params.get("studentID");

    if (!studentIDFromQR) {
      console.error("❌ Invalid QR Code: No student ID found!");
      return;
    }
    await html5QrcodeScanner.clear();
    // Hide QR Scanner
    document.getElementById("reader").style.display = "none";
    // Mark attendance using roll instead of studentID
    await markAttendance(roll);

    // Show today's attendance and past 6 days
    await fetchAttendanceHistory(roll);
  });

  // Show history immediately if attendance already exists
  await fetchAttendanceHistory(roll);
});

// ✅ Attendance History Function (7 days)
async function fetchAttendanceHistory(roll) {
  const today = new Date();
  let last7Days = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    let date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    last7Days.push({ date, status: "❌ Absent", timestamp: null });
  }

  let isTodayMarked = false;

  // Fetch all subcollections for past 7 days
  for (let i = 0; i < last7Days.length; i++) {
    const dateStr = getTodayDateFromObj(last7Days[i].date);
    const attendanceRef = collection(
      db,
      "institutes",
      instituteId,
      "Attendance",
      roll,
      dateStr
    );
    const snapshot = await getDocs(attendanceRef);

    if (!snapshot.empty) {
      last7Days[i].status = "✅ Present";
      last7Days[i].timestamp = snapshot.docs[0]
        .data()
        .timestamp.toDate()
        .toLocaleString();

      const todayStr = getTodayDate();
      if (dateStr === todayStr) {
        isTodayMarked = true;
      }
    }
  }

  // Update table UI
  const attendanceList = document.getElementById("attendance-log");
  attendanceList.innerHTML = "";

  last7Days.forEach((record) => {
    const formattedDate = record.date.toLocaleDateString();
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${record.timestamp || "Not Marked"}</td>
            <td class="${
              record.status === "✅ Present" ? "positive" : "negative"
            }">${record.status}</td>
        `;
    attendanceList.appendChild(row);
  });

  // Show success message
  if (isTodayMarked) {
    const qrDiv = document.getElementById("reader");
    qrDiv.style.display = "none";
    const msg = document.getElementById("attendance-message");
    msg.textContent = "📅 Today's attendance has been marked successfully!";
    msg.style.color = "#28a745";
  }
}

// Helper for formatting date obj to dd-mm-yyyy
function getTodayDateFromObj(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
