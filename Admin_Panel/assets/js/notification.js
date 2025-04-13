// Firebase + UI Code for Admin Chat Panel

// UI Navigation Toggle (same as before)
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
  authDomain: "uniroute-3dda9.firebaseapp.com",
  projectId: "uniroute-3dda9",
  storageBucket: "uniroute-3dda9.appspot.com",
  messagingSenderId: "465796690799",
  appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
  measurementId: "G-VWEFWH2517",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get admin name from localStorage
let adminName = null;
const storedUser = localStorage.getItem("UnirouteUser"); // no JSON.parse

if (storedUser) {
  adminName = storedUser; // this is just the email
  console.log("Logged-in Admin Email (Admin Name):", adminName);
}


// Firestore community chat path
const chatCollection = collection(
  db,
  "institutes",
  "iEe3BjNAYl4nqKJzCXlH",
  "community_chat"
);
const chatQuery = query(chatCollection, orderBy("timestamp"));

const chatBox = document.getElementById("chat-box");

// Send chat message
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message && adminName) {
    try {
      const timestampID = new Date().toISOString();
      await setDoc(doc(chatCollection, timestampID), {
        text: message,
        sender: adminName,
        timestamp: timestampID,
      });

      console.log("Message sent successfully");
    } catch (err) {
      console.error("Error sending message:", err);
    }

    messageInput.value = "";
  }
};

// Realtime chat rendering
onSnapshot(chatQuery, (snapshot) => {
  chatBox.innerHTML = "";

  snapshot.forEach((doc) => {
    const messageData = doc.data();
    if (messageData.text) {
      const messageElement = document.createElement("div");

      messageElement.textContent = messageData.text;

      const isCurrentUser = messageData.sender === adminName;
      messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;

      chatBox.appendChild(messageElement);
    }
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});
