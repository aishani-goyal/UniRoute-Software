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

// Get logged-in driver's name based on phone from localStorage
async function fetchDriverName() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) return;

  const driversRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Drivers"
  );

  const q = query(driversRef, where("contact", "==", phone));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    driverName = snapshot.docs[0].data().name;
    console.log("Logged-in Driver Name:", driverName);
  } else {
    console.error("Driver not found for phone:", phone);
  }
}

// Call the function to get driver name
await fetchDriverName();

// Reference Firestore collection with ordering by timestamp
const chatCollection = collection(db, "chats");
const chatQuery = query(chatCollection, orderBy("timestamp"));

const chatBox = document.getElementById("chat-box");

// Send message with actual driver's name
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message && driverName) {
    try {
      const timestampID = new Date().toISOString();
      await setDoc(doc(chatCollection, timestampID), {
        text: message,
        sender: driverName,
        timestamp: timestampID,
      });

      console.log("Message sent successfully");
    } catch (err) {
      console.error("Error sending message:", err);
    }

    messageInput.value = "";
  }
};

// Display messages in real-time
onSnapshot(chatQuery, (snapshot) => {
  chatBox.innerHTML = "";

  snapshot.forEach((doc) => {
    const messageData = doc.data();

    if (messageData.text) {
      const messageElement = document.createElement("div");

      // Show only the message text, without sender name
      messageElement.textContent = `${messageData.text}`;

      // If the sender is the logged-in driver, apply 'sent' style
      const isCurrentUser = messageData.sender === driverName;
      messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;

      chatBox.appendChild(messageElement);
    }
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});
