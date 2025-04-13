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
let studentContact = "7014253314"; // Default contact (can be updated based on Firebase)

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
    studentContact = docData.contact; // Fetch contact from Firebase

    checkAndUpdatePaymentStatus(docData.name, docData.email, studentId);
  } else {
    alert("Student not found!");
  }
}

// Step 2: Check Payment Status & Update UI
// Step 2: Check Payment Status & Update UI
async function checkAndUpdatePaymentStatus(name, email, studentId) {
  const feeDocRef = doc(db, "Fees", studentId);
  const feeSnap = await getDoc(feeDocRef);

  if (feeSnap.exists() && feeSnap.data().status === "Paid") {
    feeStatusEl.innerText = "Paid";
    feeStatusEl.classList.remove("pending");
    feeStatusEl.classList.add("paid");

    // ✅ Disable the pay button
    payButton.disabled = true;
    payButton.style.backgroundColor = "#ccc";
    payButton.style.cursor = "not-allowed";
    payButton.innerText = "Already Paid";
  } else {
    feeStatusEl.innerText = "Pending";
    feeStatusEl.classList.remove("paid");
    feeStatusEl.classList.add("pending");

    // ✅ Enable button if not paid
    payButton.disabled = false;
    payButton.style.backgroundColor = "#3399cc";
    payButton.style.cursor = "pointer";
    payButton.innerText = "Pay Now";
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

  // Save payment record with status "Pending"
  const feeDocRef = doc(db, "Fees", studentId);
  await setDoc(feeDocRef, {
    name,
    email,
    amount: feeAmount,
    status: "Pending",
    timestamp: new Date(),
  });

  alert("Redirecting to Razorpay...");

  // Update UI
  feeStatusEl.innerText = "Processing...";
  feeStatusEl.classList.remove("pending");
  feeStatusEl.classList.add("processing");

  // Razorpay Integration
  var options = {
    key: "rzp_test_eqMOPnwcUwJ3Gv", // Replace with your Razorpay Test Key ID
    amount: feeAmount * 100, // Amount in paise (5000 INR)
    currency: "INR",
    name: "Uniroute Software",
    description: "Fee Payment",
    handler: function (response) {
      alert("✅ Payment successful!\nPayment ID: " + response.razorpay_payment_id);
      
      // Update payment status in Firebase after successful payment
      updatePaymentStatus(response.razorpay_payment_id);
    },
    prefill: {
      name: name,
      email: email,
      contact: studentContact, // Fetch the contact from Firebase
    },
    notes: {
      project: "Uniroute Fee Payment"
    },
    theme: {
      color: "#3399cc"
    }
  };

  var rzp = new Razorpay(options);
  rzp.open();
});

// Update payment status in Firebase after successful payment for the logged-in student
async function updatePaymentStatus(paymentId) {
  // Step 1: Fetch the logged-in student's data using email
  const studentsRef = collection(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "Students");
  const q = query(studentsRef, where("email", "==", loggedInEmail));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const studentDoc = querySnapshot.docs[0]; // Get the logged-in student document
    const studentId = studentDoc.id; // Use studentId from document ID

    // Step 2: Update main fee document in the Fees collection for the logged-in student
    const feeDocRef = doc(db, "Fees", studentId);
    await updateDoc(feeDocRef, {
      status: "Paid",
      paymentId: paymentId,
      timestamp: new Date(),
    });

    // Step 3: Fetch and update all monthly fees with status "Pending"
    const monthlyFeesRef = collection(db, "Fees", studentId, "MonthlyFees");
    const q = query(monthlyFeesRef, where("status", "==", "Pending"));
    const querySnapshot = await getDocs(q);

    const updatePromises = [];

    querySnapshot.forEach((docSnap) => {
      const monthlyFeeDocRef = doc(db, "Fees", studentId, "MonthlyFees", docSnap.id);
      updatePromises.push(updateDoc(monthlyFeeDocRef, {
        status: "Paid",
        paymentId: paymentId,
        updatedAt: new Date(),
      }));
    });

    // Wait for all monthly fee updates to complete
    await Promise.all(updatePromises);

    // Step 4: Update the student's fee status in the Students collection
    const studentDocRef = doc(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "Students", studentId);
    await updateDoc(studentDocRef, {
      feeStatus: "Paid",   // Update fee status in student document
      paymentId: paymentId, // Store payment ID in student document
      paymentDate: new Date(), // Store payment date
    });

    // Step 5: Update the UI
    feeStatusEl.innerText = "Paid";
    feeStatusEl.classList.remove("pending", "processing");
    feeStatusEl.classList.add("paid");
  } else {
    alert("Student not found!");
  }
}


// Initialize everything
loadStudentData();
