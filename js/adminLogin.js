import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
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
      role === "student" ? "block" : "none";
    mobileOtpFields.style.display = role === "driver" ? "block" : "none";
    adminFields.style.display = role === "admin" ? "block" : "none";

    if (role === "driver") {
      loginBtn.textContent = "Verify and Login";
      loginBtn.setAttribute("onclick", "verifyOTP()");
    } else {
      loginBtn.textContent = "Login";
      loginBtn.removeAttribute("onclick");
    }
  });

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let role = roleDropdown.value;
      if (role === "student") {
        studentAuthorityLogin(role);
      } else if (role === "driver") {
        driverLogin();
      } else if (role === "admin") {
        adminLogin();
      }
    });
  }
});

// 4. Student Login
// Debugging: Check what data is returned from Firestore
async function studentAuthorityLogin(role) {
  let userId = document.getElementById("userId").value;
  let password = document.getElementById("password").value;
  let data1 = "";

  if (userId && password) {
    // Query Firestore
    const userRef = collection(
      db,
      "institutes",
      "iEe3BjNAYl4nqKJzCXlH",
      "User_password"
    );
    const q = query(userRef, where("email", "==", userId));
    let foundStudentData = null;
    try {
      const querySnapshot = await getDocs(q);
      

      // Debugging: Log the querySnapshot to see the returned data
      console.log(querySnapshot);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const storedCredentials = doc.data();
          console.log(storedCredentials); // Debugging: Log the stored credentials

          // Check credentials
          if (
            storedCredentials.email === userId &&
            storedCredentials.password === password
          ) {
            // Save email in localStorage
            localStorage.setItem("loggedInEmail", userId);
            foundStudentData = userId;
            data1 = userId;

            alert(
              `${
                role.charAt(0).toUpperCase() + role.slice(1)
              } Login Successful!`
            );
            const remember = document.getElementById("remember");
            if (remember.checked) {
              localStorage.setItem("UnirouteStudent", data1);
            }
            window.location.href = `Responsive Student Dashboeard/home.html`;
          } else {
            alert("⚠ Invalid email ID or password!");
          }
        });
      } else {
        alert("⚠ User not found!");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      alert("⚠ Error fetching user data. Please try again.");
    }
  } else {
    alert("⚠ Enter valid credentials!");
  }
}

// 6. Admin Login Function
async function adminLogin() {
  const adminEmail = document.getElementById("adminEmail").value.trim();
  const adminPassword = document.getElementById("adminPassword").value.trim();
  let data = "";
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
          data = adminData.email;
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
      const rememberMe = document.getElementById("rememberMe");
      if (rememberMe.checked) {
        localStorage.setItem("UnirouteUser", data);
      }
      // remMe(adminData.email)
      window.location.href = "Admin_Panel/admin_home.html";
    } else {
      alert("⚠ Invalid Email or Password!");
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("⚠ Error during login. Try again.");
  }

  // function remMe(mail){
  //   const rememberMe = document.getElementById("rememberMe");
  //   if (rememberMe.checked) {
  //     localStorage.setItem("UnirouteUser", mail );
  //     }
  // }
}

const API_BASE_URL = "https://uniroute-software.onrender.com";

window.sendOTP = async function sendOTP() {
  const phone = document.getElementById("phone").value;
  const last10 = phone.replace(/[^0-9]/g, "").slice(-10); // Extract last 10 digits
  localStorage.setItem("userPhone", last10);              // Store it

  try {
    const res = await fetch(`${API_BASE_URL}/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
      credentials: "include",
    });

    const responseText = await res.text();
    if (!responseText) {
      alert("No response from server.");
      return;
    }
    const data = JSON.parse(responseText);
    alert(data.message);
  } catch (error) {
    console.error("Error during sendOTP:", error);
    alert("Failed to send OTP. Check console for details.");
  }
};

window.verifyOTP = async function verifyOTP() {
  const otp = document.getElementById("otp").value;
  const phone = document.getElementById("phone").value; // Get phone number
  const rem = document.getElementById("rem");

  try {
    const res = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
      credentials: "include",
    });

    const responseText = await res.text();
    if (!responseText) {
      alert("No response from server.");
      return;
    }
    const data = JSON.parse(responseText);
    alert(data.message);

    // If OTP is correct
    if (data.success) {
      let data2 = "";
      let foundDriverData = null;

      // Save the phone number as driver identifier
      foundDriverData = phone;
      data2 = phone;

      // Store in localStorage if "Remember Me" is checked
      if (rem && rem.checked) {
        localStorage.setItem("UnirouteDriver", data2);
        
      }

      // Redirect to dashboard
      window.location.href = "Responsive Driver Dashboard/driver.html";
    }
  } catch (error) {
    console.error("Error during verifyOTP:", error);
    alert("Failed to verify OTP. Check console for details.");
  }
};

