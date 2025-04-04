// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

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
const attendanceCollection = collection(db, "Attendance");

// Wait for the page to load
document.addEventListener("DOMContentLoaded", function () {
    // Initialize QR Code scanner
    const html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    html5QrcodeScanner.render(onScanSuccess);

    // Callback when QR code is scanned
    function onScanSuccess(decodedText, decodedResult) {
        console.log(`QR Code detected: ${decodedText}`);
    
        // Extract studentID from QR Code
        const params = new URLSearchParams(decodedText);
        const studentIDFromQR = params.get("studentID");
    
        if (!studentIDFromQR) {
            console.error("❌ Invalid QR Code: No student ID found!");
            return;
        }
    
        // ✅ Proceed to mark attendance
        markAttendance(studentIDFromQR);
        // Hide the QR code scanner once it is scanned
        const qrScannerDiv = document.getElementById("reader");
        qrScannerDiv.style.display = "none";  // Hide the QR code scanner
    }
     // Start scanning
     html5QrcodeScanner.render(onScanSuccess);

    // Function to store attendance in Firebase
    function markAttendance(studentID) {
        addDoc(attendanceCollection, {
            studentID: studentID,
            timestamp: serverTimestamp(),
            status: "Present"
        })
        .then(() => {
            alert("✅ Attendance marked successfully!");
            console.log(`Attendance recorded for Student ID: ${studentID}`);
            
        })
        .catch(error => {
            console.error("❌ Error marking attendance: ", error);
            alert("❌ Error marking attendance.");
        });
    }
});
// Function to fetch last 7 days' attendance (including absent days)
async function fetchAttendanceHistory(studentID) {
    try {
        const querySnapshot = await getDocs(attendanceCollection); // Fetch all records
        const today = new Date();
        let last7Days = [];

        // Generate last 7 days' dates
        for (let i = 6; i >= 0; i--) {
            let date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0); // Normalize to midnight for accurate comparison
            last7Days.push({ date, status: "❌ Absent", timestamp: null });
        }

        let isTodayAttendanceMarked = false;

        // Process Firebase records
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.studentID === studentID) {
                const recordDate = data.timestamp.toDate();
                recordDate.setHours(0, 0, 0, 0); // Normalize for comparison

                // Check if attendance for today is marked
                const todayDate = new Date();
                todayDate.setHours(0, 0, 0, 0); // Normalize today's date to compare

                if (recordDate.getTime() === todayDate.getTime()) {
                    isTodayAttendanceMarked = true;
                }

                // Update attendance status if a record exists
                last7Days.forEach((day) => {
                    if (day.date.getTime() === recordDate.getTime()) {
                        day.status = "✅ Present";
                        day.timestamp = data.timestamp.toDate().toLocaleString(); // Add the timestamp
                    }
                });
            }
        });

        // Display attendance immediately
        const attendanceList = document.getElementById("attendance-log");
        attendanceList.innerHTML = ""; // Clear previous entries

        last7Days.forEach((record) => {
            const formattedDate = record.date.toLocaleDateString();
            const timestamp = record.timestamp || "Not Marked"; // Show "Not Marked" if there's no timestamp
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${timestamp}</td>
                <td class="${record.status === '✅ Present' ? 'positive' : 'negative'}">${record.status}</td>
            `;

            attendanceList.appendChild(row);
        });

        // If today's attendance is marked, hide QR code scanner and show success message
        if (isTodayAttendanceMarked) {
            const qrScannerDiv = document.getElementById("reader");
            qrScannerDiv.style.display = "none"; // Hide the QR code scanner
            const attendanceMessage = document.getElementById("attendance-message");
            attendanceMessage.textContent = "📅 Today's attendance has been marked successfully!";
            attendanceMessage.style.color = "#28a745"; // Green color for success
        }

    } catch (error) {
        console.error("❌ Error fetching attendance history:", error);
    }
}

// Call this function when the page loads to show attendance immediately
document.addEventListener("DOMContentLoaded", function () {
    const studentID = "12345"; // Replace with the actual student ID dynamically
    fetchAttendanceHistory(studentID);
});


