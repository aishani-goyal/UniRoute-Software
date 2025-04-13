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
  doc,
  setDoc,
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

const chatBox = document.getElementById("chat-box");

let studentRoll = null;
let studentName = null;

// ✅ Get student's roll number and name from Firestore
async function getStudentDetailsByEmail(email) {
  const studentsRef = collection(
    db,
    "institutes",
    "iEe3BjNAYl4nqKJzCXlH",
    "Students"
  );
  const q = query(studentsRef, where("email", "==", email));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const studentData = snapshot.docs[0].data();
    return {
      roll: studentData.roll,
      name: studentData.name,
    };
  } else {
    throw new Error("Student not found for this email.");
  }
}

// ✅ Send message with student's name as sender and timestamp as document ID
window.sendMessage = async function () {
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (message && studentRoll && studentName) {
    try {
      // Create a timestamp for the message (current date)
      const timestamp = new Date().toISOString(); // Use timestamp as the document ID

      // Reference to the 'chats' collection for storing messages
      const chatRef = collection(db, "chats");

      // Use doc() with the timestamp as the document ID
      const messageDocRef = doc(chatRef, timestamp);

      // Store the message with timestamp as the document ID
      await setDoc(messageDocRef, {
        text: message,
        sender: studentName,
        timestamp: timestamp, // Save timestamp as part of the message
      });

      console.log("Message sent");
    } catch (err) {
      console.error("Error sending message:", err);
    }

    messageInput.value = ""; // Clear the input field after sending
  }
};

// ✅ Display real-time messages from all chats
function listenForMessages() {
  const chatRef = collection(db, "chats");
  const chatQuery = query(chatRef, orderBy("timestamp"));

  onSnapshot(chatQuery, (snapshot) => {
    chatBox.innerHTML = ""; // Clear existing chat messages

    snapshot.forEach((doc) => {
      const messageData = doc.data();

      if (messageData.text) {
        const messageElement = document.createElement("div");
        messageElement.textContent = messageData.text;

        // ✅ Apply green color if the message sender is the logged-in student
        const isCurrentStudent = messageData.sender === studentName;
        messageElement.className = `message ${
          isCurrentStudent ? "sent" : "received"
        }`;

        // Add color styles
        if (isCurrentStudent) {
          messageElement.style.backgroundColor = "#E1FFC7";
          messageElement.style.color = "black";
        } else {
          messageElement.style.backgroundColor = "white";
          messageElement.style.color = "black";
        }

        chatBox.appendChild(messageElement);
      }
    });

    // Scroll to the bottom of the chat box after new messages
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// ✅ On page load — get student name & roll and start listening
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
    console.log("Student loaded:", studentName, studentRoll);

    listenForMessages();
  } catch (error) {
    console.error("Error fetching student details:", error);
  }
});
