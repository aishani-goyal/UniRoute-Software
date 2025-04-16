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
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
    import {
      getFirestore,
      collection,
      setDoc,
      doc,
      onSnapshot,
      query,
      orderBy
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

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get admin name from localStorage
    let adminName = null;
    const storedUser = localStorage.getItem("AdminEmail");
    if (storedUser) {
      adminName = storedUser;
      console.log("Logged-in Admin Email (Admin Name):", adminName);
    } else {
      alert("Admin not logged in.");
    }
    const instituteId = localStorage.getItem("InstituteName");
    // Firestore path
    const chatCollection = collection(
      db,
      "institutes",
      instituteId,
      "community_chat"
    );
    const chatQuery = query(chatCollection, orderBy("timestamp"));

    const chatBox = document.getElementById("chat-box");

    // Send message function
    const sendMessage = async () => {
      const messageInput = document.getElementById("message-input");
      const message = messageInput.value.trim();

      if (message && adminName) {
        try {
          const timestamp = new Date().toISOString();
          await setDoc(doc(chatCollection, timestamp), {
            text: message,
            sender: adminName,
            timestamp: timestamp,
          });
          console.log("Message sent");
          messageInput.value = "";
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    };

    // Make available to button onclick
    window.sendMessage = sendMessage;

    // Real-time chat updates
    onSnapshot(chatQuery, (snapshot) => {
      chatBox.innerHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement("div");
        div.textContent = data.text;
        div.className = `message ${
          data.sender === adminName ? "sent" : "received"
        }`;
        chatBox.appendChild(div);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });