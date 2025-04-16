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

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  where,
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

// Firebase Config
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

const chatBox = document.getElementById("chat-box");

let studentRoll = null;
let studentName = null;
let studentRoute = null; // ✅ Store the route number
const instituteId = localStorage.getItem("InstituteName");
// ✅ Get student's roll number, name, and route from Firestore
async function getStudentDetailsByEmail(email) {
  const studentsRef = collection(
    db,
    "institutes",
    instituteId,
    "Students"
  );
  const q = query(studentsRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const studentData = snapshot.docs[0].data();
    return {
      roll: studentData.roll,
      name: studentData.name,
      route: studentData.routeNo?.toString() || "", // ✅ Ensure route is a string
    };
  } else {
    throw new Error("Student not found for this email.");
  }
}

// ✅ Send message
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message && studentRoll && studentName && studentRoute) {
    try {
      const timestamp = new Date().toISOString();
      const chatRef = collection(
        db,
        "institutes",
        instituteId,
        "chats"
      );
      const messageDocRef = doc(chatRef, timestamp);

      await setDoc(messageDocRef, {
        text: message,
        sender: studentName,
        timestamp: timestamp,
        route: studentRoute, // ✅ Save route with message
      });

      console.log("Message sent");
    } catch (err) {
      console.error("Error sending message:", err);
    }

    messageInput.value = ""; // Clear the input
  }
};

// ✅ Display messages for same route only
function listenForMessages() {
  const chatRef = collection(
    db,
    "institutes",
    instituteId,
    "chats"
  );
  const chatQuery = query(chatRef, orderBy("timestamp"));

  onSnapshot(chatQuery, (snapshot) => {
    chatBox.innerHTML = ""; // Clear previous messages

    snapshot.forEach((doc) => {
      const messageData = doc.data();

      // ✅ Filter messages by route
      if (messageData.text && messageData.route === studentRoute) {
        const messageElement = document.createElement("div");
        messageElement.textContent = messageData.text;

        const isCurrentStudent = messageData.sender === studentName;
        messageElement.className = `message ${isCurrentStudent ? "sent" : "received"}`;

        messageElement.style.backgroundColor = isCurrentStudent ? "#E1FFC7" : "white";
        messageElement.style.color = "black";

        chatBox.appendChild(messageElement);
      }
    });

    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to latest
  });
}

// ✅ On page load
document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("loggedInEmail");

  if (!email) {
    alert("No email found in localStorage.");
    return;
  }

  try {
    const details = await getStudentDetailsByEmail(email);
    studentRoll = details.roll;
    studentName = details.name;
    studentRoute = details.route;
    console.log("Student loaded:", studentName, studentRoll, studentRoute);

    listenForMessages();
  } catch (error) {
    console.error("Error fetching student details:", error);
  }
});
