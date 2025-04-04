import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. Firebase Configuration
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

// 2. Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 3. Role-Based Form Handling
document.addEventListener("DOMContentLoaded", () => {
  const roleDropdown = document.getElementById("role");
  const idPasswordFields = document.getElementById("idPasswordFields");
  const mobileOtpFields = document.getElementById("mobileOtpFields");
  const adminFields = document.getElementById("adminFields");

  roleDropdown.addEventListener("change", function () {
    let role = this.value;
    idPasswordFields.style.display =
      role === "student" || role === "authority" ? "block" : "none";
    mobileOtpFields.style.display = role === "driver" ? "block" : "none";
    adminFields.style.display = role === "admin" ? "block" : "none";
  });

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let role = roleDropdown.value;
      if (role === "student" || role === "authority") {
        studentAuthorityLogin(role);
      } else if (role === "driver") {
        driverLogin();
      } else if (role === "admin") {
        adminLogin();
      }
    });
  }
});

// 4. Student & Authority Login
function studentAuthorityLogin(role) {
  let userId = document.getElementById("userId").value;
  let password = document.getElementById("password").value;

  if (userId && password) {
    alert(`${role.charAt(0).toUpperCase() + role.slice(1)} Login Successful!`);
    window.location.href = `${role}Dashboard.html`;
  } else {
    alert("⚠ Enter valid credentials!");
  }
}

// 5. Driver Login
function driverLogin() {
  let mobileNumber = document.getElementById("mobileNumber").value;
  let otp = document.getElementById("otp").value;

  if (mobileNumber && otp) {
    alert("✅ Driver Login Successful!");
    window.location.href = "Responsive Driver Dashboard/driver.html";
  } else {
    alert("⚠ Invalid OTP!");
  }
}

// 6. Admin Login Function
async function adminLogin() {
  const adminEmail = document.getElementById("adminEmail").value.trim();
  const adminPassword = document.getElementById("adminPassword").value.trim();

   if (!adminEmail || !adminPassword) {
     alert("⚠ Please enter both Email and Password!");
     return; // Stop function execution if fields are empty
   }

  try {
    const institutesRef = collection(db, "institutes");
    const institutesSnapshot = await getDocs(institutesRef);
    let foundAdminData = null;

    for (const instituteDoc of institutesSnapshot.docs) {
      const adminDocRef = doc(
        db,
        "institutes",
        instituteDoc.id,
        "adminDetails",
        "admin"
      );
      const adminDocSnap = await getDoc(adminDocRef);

      if (adminDocSnap.exists()) {
        const adminData = adminDocSnap.data();
        if (adminData.email === adminEmail) {
          foundAdminData = adminData;
          break;
        }
      }
    }

    if (!foundAdminData) {
      alert("⚠ No matching admin found.");
      return;
    }

    if (foundAdminData.password === adminPassword) {
      alert("✅ Admin Login Successful!");
      window.location.href =
        "Admin_Panel/admin_home.html";
    } else {
      alert("⚠ Invalid Email or Password!");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("⚠ Error during login. Try again.");
  }
}
