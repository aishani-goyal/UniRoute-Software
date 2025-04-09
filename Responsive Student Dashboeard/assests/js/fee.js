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
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Firebase config
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

// Get HTML elements
const studentNameEl = document.getElementById("student-name");
const studentEmailEl = document.getElementById("student-email");
const feeAmountEl = document.getElementById("fee-amount");
const feeStatusEl = document.getElementById("fee-status");
const payButton = document.getElementById("pay-now");

// Get logged-in email from localStorage
const loggedInEmail = localStorage.getItem("loggedInEmail");
let studentId = null;

// Amount (can also be fetched dynamically)
const feeAmount = "5000";
feeAmountEl.innerText = feeAmount;

// Step 1: Fetch Student Info
async function loadStudentData() {
  const studentsRef = collection(
    db,
    "institutes/iEe3BjNAYl4nqKJzCXlH/Students"
  );
  const q = query(studentsRef, where("email", "==", loggedInEmail));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const docData = querySnapshot.docs[0].data();
    studentNameEl.innerText = docData.name;
    studentEmailEl.innerText = docData.email;
    studentId = docData.studentId;

    checkAndUpdatePaymentStatus(docData.name, docData.email, studentId);
  } else {
    alert("Student not found!");
  }
}

// Step 2: Check Payment Status & Update UI
async function checkAndUpdatePaymentStatus(name, email, studentId) {
  const feeDocRef = doc(db, "Fees", studentId);
  const feeSnap = await getDoc(feeDocRef);

  if (feeSnap.exists() && feeSnap.data().status === "Paid") {
    feeStatusEl.innerText = "Paid";
    feeStatusEl.classList.remove("pending");
    feeStatusEl.classList.add("paid");
  } else {
    feeStatusEl.innerText = "Pending";
    feeStatusEl.classList.remove("paid");
    feeStatusEl.classList.add("pending");
  }
}

// Step 3: Handle Payment Button Click
payButton.addEventListener("click", async () => {
  if (!studentId) {
    alert("Student not loaded yet!");
    return;
  }

  const name = studentNameEl.innerText;
  const email = studentEmailEl.innerText;
  const upiID = "7014253314@pytes";

  // Save payment record with status "Pending"
  const feeDocRef = doc(db, "Fees", studentId);
  await setDoc(feeDocRef, {
    name,
    email,
    amount: feeAmount,
    status: "Pending",
    timestamp: new Date(),
  });

  alert("Redirecting to Paytm...");

  // Update UI
  feeStatusEl.innerText = "Processing...";
  feeStatusEl.classList.remove("pending");
  feeStatusEl.classList.add("processing");

  // Redirect
  const paytmURL = `https://paytm.com/upi/payment?pa=${upiID}&pn=${encodeURIComponent(
    name
  )}&am=${feeAmount}&cu=INR&tn=Fee Payment`;
  setTimeout(() => {
    window.location.href = paytmURL;
  }, 1000);
});

// Initialize everything
loadStudentData();
