

document.addEventListener("DOMContentLoaded", function () {
  const steps = document.querySelectorAll(".form-step");
  const nextBtns = document.querySelectorAll(".next-btn");
  const prevBtns = document.querySelectorAll(".back-btn");
  const submitBtn = document.getElementById("submit-btn"); // Final submission button
  let currentStep = 0;

  // Initialize Firebase (Replace with your Firebase Config)
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
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.style.display = index === stepIndex ? "block" : "none";
    });
  }

  function validateStep(stepIndex) {
    const currentStepFields = steps[stepIndex].querySelectorAll(
      "input[required], select[required]"
    );

    for (let field of currentStepFields) {
      if (!field.value.trim()) {
        alert(`Please fill in the required field: ${field.name || field.id}`);
        field.focus();
        return false;
      }
    }

    // Validate Admin Details (Step 2)
    if (stepIndex === 1) {
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      const passwordPattern =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordPattern.test(password)) {
        alert(
          "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."
        );
        document.getElementById("password").focus();
        return false;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match. Please re-enter.");
        document.getElementById("confirmPassword").focus();
        return false;
      }
    }

    return true;
  }

  nextBtns.forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep(currentStep) && currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  prevBtns.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Handle form submission
  submitBtn.addEventListener("click", async () => {
    if (!validateStep(currentStep)) return;

    // Collect data from form
    const instituteName = document.getElementById("instituteName").value;
    const instituteEmail = document.getElementById("instituteEmail").value;
    const instituteType = document.getElementById("instituteType").value;
    const instituteAddress = document.getElementById("instituteAddress").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const pincode = document.getElementById("pincode").value;
    const phone = document.getElementById("phone").value;
    
    const adminName = document.getElementById("adminName").value;
    const designation = document.getElementById("designation").value;
    const adminEmail = document.getElementById("adminEmail").value;
    const adminPhone = document.getElementById("adminPhone").value;
    const password = document.getElementById("password").value;

    const subscriptionType = document.getElementById("subscriptionType").value;
    const category = document.getElementById("category").value;
    

    try {
      // Create a new document in 'institutes' collection
      const instituteRef = await db.collection("institutes").doc(instituteName).set({
        name: instituteName,
        email: instituteEmail,
        registeredAt: firebase.firestore.Timestamp.now(),
      });

      // Store Admin Details in subcollection
      await db.collection("institutes")
    .doc(instituteName)  // Use the university name as the doc ID
    .collection("adminDetails")
    .doc("admin")
    .set({

        name: adminName,
        email: adminEmail,
        password: password, // Ideally, store hashed passwords
        designation: designation,
        phoneNo: adminPhone
      });

      // Store Institute Details in subcollection
      await db.collection("institutes")
    .doc(instituteName)  // Use the university name as the doc ID
    .collection("instituteDetails")
    .doc("details")
    .set({

        name: instituteName,
        type : instituteType,
        email: instituteEmail,
        address: instituteAddress,
        city: city,
        state : state,
        pincode : pincode,
        phoneNo : phone
      });

      // Store Subscription Details in subcollection
      await db.collection("institutes")
    .doc(instituteName)  // Use the university name as the doc ID
    .collection("subscriptionDetails")
    .doc("subscription")
    .set({
          type : subscriptionType,
          category : category
          
        });

      alert("Registration successful!");
      //window.location.href = "success.html"; // Redirect to success page
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Error in registration. Please try again.");
    }
  });

  showStep(currentStep);
});
