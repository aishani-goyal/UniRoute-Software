// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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

// Reference Firestore collection with ordering by timestamp
const chatCollection = collection(db, 'chats');
const chatQuery = query(chatCollection, orderBy('timestamp'));

const chatBox = document.getElementById("chat-box");

window.sendMessage = async function () {
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value.trim();

    if (message) {
        try {
            await addDoc(chatCollection, {
                text: message,
                sender: "driver", // Identify the sender
                timestamp: new Date() // Ensures proper time ordering
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
    chatBox.innerHTML = ""; // Clear and re-render all messages to avoid duplicates

    snapshot.forEach((doc) => {
        const messageData = doc.data();

        if (messageData.text) {
            const messageElement = document.createElement("div");
            messageElement.textContent = messageData.text;
            messageElement.className = `message ${messageData.sender === "driver" ? "sent" : "received"}`;

            chatBox.appendChild(messageElement); // Maintains correct order
        }
    });

    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
});
