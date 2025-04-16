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
// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
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

// Get admin name from localStorage (email stored as plain string)
let adminName = localStorage.getItem("UnirouteUser");
const instituteId = localStorage.getItem("InstituteName");
// Firestore collection reference
const chatCollection = collection(
  db,
  "institutes",
  instituteId,
  "community_chat"
);
const chatQuery = query(chatCollection, orderBy("timestamp"));

// Reference to message display box (div#chat-box required in HTML)
const chatBox = document.getElementById("chat-box");

// Real-time listener to fetch and display messages
onSnapshot(chatQuery, (snapshot) => {
  chatBox.innerHTML = ""; // Clear previous messages

  snapshot.forEach((doc) => {
    const messageData = doc.data();

    const messageElement = document.createElement("div");
    messageElement.textContent = `${messageData.text}`;

    const isCurrentUser = messageData.sender === adminName;
    messageElement.className = `message ${isCurrentUser ? "sent" : "received"}`;

    chatBox.appendChild(messageElement);
  });

  chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
});
