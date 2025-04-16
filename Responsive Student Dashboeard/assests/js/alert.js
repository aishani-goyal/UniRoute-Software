import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getFirestore, collection, addDoc, query, where, getDocs, setDoc, doc
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
    authDomain: "uniroute-3dda9.firebaseapp.com",
    projectId: "uniroute-3dda9",
    storageBucket: "uniroute-3dda9.appspot.com",
    messagingSenderId: "465796690799",
    appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
    measurementId: "G-VWEFWH2517"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to show custom popup with MCQ options
function showMCQPopup() {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup-content">
            <p>Select Emergency Type:</p>
            <form id="emergency-form">
                <label>
                    <input type="radio" name="emergency" value="🚨 Accident Alert from Student!" required> 🚨 Accident
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🚧 Bus Breakdown Alert from Student!"> 🚧 Bus Breakdown
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🏥 Medical Emergency Alert from Student!"> 🏥 Medical Emergency
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🔥 Fire Emergency Alert from Student!"> 🔥 Fire Emergency
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🚨 Speed Alert from Student!"> 🚨 Speed Alert
                </label><br><br>
                <button type="submit" id="submit-alert">Send Alert</button>
                <button type="button" id="cancel-alert">Cancel</button>
            </form>
        </div>
    `;

    document.body.appendChild(popup);

    const popupStyle = document.createElement("style");
    popupStyle.innerHTML = `
        .popup {
            display: block;
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #fff;
            padding: 20px;
            border: 2px solid #4CAF50;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 999;
            width: 300px;
        }
        .popup-content {
            text-align: center;
        }
        #submit-alert, #cancel-alert {
            background-color: #4CAF50;
            color: #fff;
            border: none;
            padding: 8px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        #cancel-alert {
            background-color: #F44336;
        }
    `;
    document.head.appendChild(popupStyle);

    // Form Submission Logic
    document.getElementById("emergency-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedEmergency = document.querySelector('input[name="emergency"]:checked').value;

        try {
            // Get the logged-in student email from localStorage
            let loggedInEmail = localStorage.getItem("loggedInEmail");

            if (!loggedInEmail) {
                showPopup("❌ User email not found. Please check your login details.", false);
                return;
            }

            // Query the Students collection using the email
            const studentsRef = collection(db, "institutes/iEe3BjNAYl4nqKJzCXlH/Students");
            const q = query(studentsRef, where("email", "==", loggedInEmail));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showPopup("❌ Student with this email not found.", false);
                return;
            }

            // Extract student data
            const studentDoc = querySnapshot.docs[0];
            const studentData = studentDoc.data();
            const { studentId, name, routeNo } = studentData;

            // Create the alert with student info
            await setDoc(doc(db, "institutes", "iEe3BjNAYl4nqKJzCXlH", "Emergency_Alert", studentId), {
                name: name,
                routeNo: routeNo,
                message: selectedEmergency,
                timestamp: new Date().toLocaleString()
            });

            showPopup(`✅ Alert sent successfully by ${name} (Route ${routeNo})!`, true);
        } catch (error) {
            showPopup("❌ Failed to send alert. Please try again.", false);
            console.error("Error:", error);
        }

        popup.remove();
    });

    // Cancel Button Logic
    document.getElementById("cancel-alert").addEventListener("click", () => {
        popup.remove();
    });
}
// Function to show success/failure popups
function showPopup(message, isSuccess) {
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.innerHTML = `
        <div class="popup-content">
            <p>${message}</p>
            <button id="close-popup">OK</button>
        </div>
    `;
    document.body.appendChild(popup);

    document.getElementById("close-popup").addEventListener("click", () => {
        popup.remove();
    });
}

// ✅ Corrected button ID
document.getElementById("emergency-alert-btn").addEventListener("click", showMCQPopup);
