// Add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => item.classList.remove("hovered"));
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
  setDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
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

let driverName = null;
let driverRoute = null;
const instituteId = localStorage.getItem("InstituteName");

// Get logged-in driver's name and route from Firestore
async function fetchDriverDetails() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) return;

  const driversRef = collection(
    db,
    "institutes",
    instituteId,
    "Drivers"
  );

  const q = query(driversRef, where("contact", "==", phone));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    driverName = data.name;
    driverRoute = data.route;
    console.log("Driver:", driverName, "| Route:", driverRoute);
  } else {
    console.error("Driver not found for phone:", phone);
  }
}

await fetchDriverDetails();

// Reference chat collection
const chatCollection = collection(
  db,
  "institutes",
  instituteId,
  "chats"
);
const chatQuery = query(chatCollection, orderBy("timestamp"));

const chatBox = document.getElementById("chat-box");

// Send message with route
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message && driverName && driverRoute) {
    try {
      const timestampID = new Date().toISOString();
      await setDoc(doc(chatCollection, timestampID), {
        text: message,
        sender: driverName,
        timestamp: timestampID,
        route: driverRoute,
      });

      console.log("Message sent successfully");
    } catch (err) {
      console.error("Error sending message:", err);
    }

    messageInput.value = "";
  }
};

// Real-time message listener
onSnapshot(chatQuery, (snapshot) => {
  chatBox.innerHTML = "";

  snapshot.forEach((doc) => {
    const messageData = doc.data();

    // Show messages for same route only
    if (messageData.text && messageData.route === driverRoute) {
      const messageElement = document.createElement("div");
      messageElement.textContent = messageData.text;

      const isCurrentUser = messageData.sender === driverName;
      messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;

      chatBox.appendChild(messageElement);
    }
  });

  chatBox.scrollTop = chatBox.scrollHeight;
  });