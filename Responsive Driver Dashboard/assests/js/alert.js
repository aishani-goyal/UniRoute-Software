import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
                    <input type="radio" name="emergency" value="🚨 Accident Alert from Driver!" required> 🚨 Accident
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🚧 Bus Breakdown Alert from Driver!"> 🚧 Bus Breakdown
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🏥 Medical Emergency Alert from Driver!"> 🏥 Medical Emergency
                </label><br>
                <label>
                    <input type="radio" name="emergency" value="🔥 Fire Emergency Alert from Driver!"> 🔥 Fire Emergency
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
            // Get the userPhone from localStorage
            let userPhone = localStorage.getItem("userPhone");
            
            if (!userPhone) {
                showPopup("❌ User phone not found. Please check your login details.", false);
                return;
            }

            // Query the Drivers collection based on contact (phone number)
            const driversRef = collection(db, "institutes/iEe3BjNAYl4nqKJzCXlH/Drivers");
            const q = query(driversRef, where("contact", "==", userPhone));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                showPopup("❌ Driver with this phone number not found.", false);
                return;
            }

            // Extract the route number from the driver document
            const driverDoc = querySnapshot.docs[0];
            const routeNumber = driverDoc.data().route;

            // Set document with routeNumber as ID
            await setDoc(doc(db, "Emergency_Alert", routeNumber), {
                message: selectedEmergency,
                timestamp: new Date().toLocaleString()
            });

            showPopup(`✅ ${selectedEmergency} sent successfully!`, true);
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

// Emergency Alert Button Logic
document.getElementById("emergency-alert-btn").addEventListener("click", () => {
    showMCQPopup();
});
