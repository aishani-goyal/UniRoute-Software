document.addEventListener("DOMContentLoaded", () => {
  // ✅ Firebase configuration (replace with your actual config)
  const firebaseConfig = {
    apiKey: "AIzaSyCs3IGjFjg1Mj0Sb7h2WNfUTm4uefNlXcI",
    authDomain: "uniroute-3dda9.firebaseapp.com",
    databaseURL:
      "https://uniroute-3dda9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "uniroute-3dda9",
    storageBucket: "uniroute-3dda9.firebasestorage.app",
    messagingSenderId: "465796690799",
    appId: "1:465796690799:web:cab2801937f2d4cac7ee9a",
    measurementId: "G-VWEFWH2517",
  };

  // ✅ Initialize Firebase if not already initialized
  if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const db = firebase.firestore();
  const instituteId = "iEe3BjNAYl4nqKJzCXlH";

  // ✅ Generic function to fetch count and update DOM
  async function fetchCountAndUpdate(collectionPath, elementId) {
    try {
      const snapshot = await db.collection(collectionPath).get();
      const count = snapshot.size;

      const targetElem = document.getElementById(elementId);
      if (targetElem) {
        targetElem.textContent = count;
      } else {
        console.warn(`Element with ID '${elementId}' not found in DOM.`);
      }
    } catch (error) {
      console.error(`Error fetching ${collectionPath}:`, error);
    }
  }

  // ✅ Fetch counts and update respective HTML elements
  fetchCountAndUpdate(`institutes/${instituteId}/routes`, "totalRoutes");
  fetchCountAndUpdate(`institutes/${instituteId}/vehicles`, "activeVehicles");
  fetchCountAndUpdate(`institutes/${instituteId}/Students`, "totalUsers");

  // ✅ Fetch feedback data and display chart
  async function fetchFeedbackAndPlotChart() {
    try {
      const feedbackCollection = await db.collection("Feedback").get();
      let total = {
        driverBehaviour: 0,
        onTimeService: 0,
        routeAvailability: 0,
        seatingComfort: 0,
        vehicleSpeed: 0,
      };
      let count = 0;

      feedbackCollection.forEach((doc) => {
        const data = doc.data();
        total.driverBehaviour += data.driverBehaviour || 0;
        total.onTimeService += data.onTimeService || 0;
        total.routeAvailability += data.routeAvailability || 0;
        total.seatingComfort += data.seatingComfort || 0;
        total.vehicleSpeed += data.vehicleSpeed || 0;
        count++;
      });

      if (count === 0) return;

      const averages = {
        driverBehaviour: total.driverBehaviour / count,
        onTimeService: total.onTimeService / count,
        routeAvailability: total.routeAvailability / count,
        seatingComfort: total.seatingComfort / count,
        vehicleSpeed: total.vehicleSpeed / count,
      };

      const ctx = document.getElementById("userFeedbackChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Driver Behaviour",
            "On-Time Service",
            "Route Availability",
            "Seating Comfort",
            "Vehicle Speed",
          ],
          datasets: [
            {
              label: "Average Rating",
              data: [
                averages.driverBehaviour,
                averages.onTimeService,
                averages.routeAvailability,
                averages.seatingComfort,
                averages.vehicleSpeed,
              ],
              backgroundColor: [
                "rgba(100, 149, 237, 0.8)", // Cornflower Blue
                "rgba(60, 179, 113, 0.8)", // Medium Sea Green
                "rgba(255, 165, 0, 0.8)", // Orange
                "rgba(186, 85, 211, 0.8)", // Medium Orchid
                "rgba(189, 183, 107, 0.8)", // Dark Khaki
              ],
              borderColor: [
                "rgba(100, 149, 237, 1)",
                "rgba(60, 179, 113, 1)",
                "rgba(255, 165, 0, 1)",
                "rgba(186, 85, 211, 1)",
                "rgba(189, 183, 107, 1)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              labels: {
                color: "#7f8c8d", // neutral color for label text
                generateLabels: (chart) => {
                  return [
                    {
                      text: "Average Rating",
                      fillStyle: "rgba(127, 140, 141, 0.8)",
                      strokeStyle: "rgba(127, 140, 141, 1)",
                      lineWidth: 2,
                      hidden: false,
                      index: 0,
                    },
                  ];
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 180,
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  }

  fetchFeedbackAndPlotChart();

  //Users with Pending Fee
  async function fetchFeeStatusAndRenderChart() {
    try {
      const studentsRef = db
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("Students");
      const snapshot = await studentsRef.get();

      let pendingCount = 0;
      let paidCount = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.feeStatus?.toLowerCase() === "pending") {
          pendingCount++;
        } else {
          paidCount++;
        }
      });

      const ctx = document.getElementById("pendingFeeChart").getContext("2d");

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Pending Fee", "Paid Fee"],
          datasets: [
            {
              label: "Fee Status",
              data: [pendingCount, paidCount],
              backgroundColor: [
                "rgba(223, 221, 63, 0.91)", // Red for pending
                "rgba(46, 80, 190, 0.8)", // Teal for paid
              ],
              borderColor: [
                "rgba(223, 221, 63, 0.91)",
                "rgba(46, 80, 190, 0.8)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#34495e", // dark gray text
                font: {
                  size: 14,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || "";
                  const value = context.raw;
                  const total = pendingCount + paidCount;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching student fee data:", error);
    }
  }

  fetchFeeStatusAndRenderChart();

  //Route data with bar chart
  async function fetchRouteWiseDistributionAndRenderChart() {
    try {
      const studentsRef = db
        .collection("institutes")
        .doc("iEe3BjNAYl4nqKJzCXlH")
        .collection("Students");
      const snapshot = await studentsRef.get();

      const routeCounts = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        const routeNo = data.routeNo || "Unknown";

        routeCounts[routeNo] = (routeCounts[routeNo] || 0) + 1;
      });

      const sortedRoutes = Object.keys(routeCounts).sort(
        (a, b) => parseInt(a) - parseInt(b)
      );
      const routeData = sortedRoutes.map((route) => routeCounts[route]);

      const ctx = document.getElementById("routeChart").getContext("2d");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: sortedRoutes.map((r) => `Route ${r}`),
          datasets: [
            {
              label: "No. of Passengers",
              data: routeData,
              backgroundColor: "rgba(54, 162, 235, 0.7)",
              borderColor: "rgba(54, 162, 235, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              title: { display: true, text: "Route Number" },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Passengers" },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error fetching route-wise passenger distribution:", error);
    }
  }

  fetchRouteWiseDistributionAndRenderChart();

  //Complaints
  async function loadUserComplaints() {
    const instituteId = "iEe3BjNAYl4nqKJzCXlH";
    const studentsRef = db
      .collection("institutes")
      .doc(instituteId)
      .collection("Students");
    const driversRef = db
      .collection("institutes")
      .doc(instituteId)
      .collection("Drivers");
    const feedbackRef = db.collection("Feedback");
    const complaintsTableBody = document.getElementById("complaintsBody");
    complaintsTableBody.innerHTML = "";

    try {
      // Step 1: Fetch all drivers once and store by route number
      const driverSnapshot = await driversRef.get();
      const routeToDriverName = {};

      driverSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.route != null && data.name) {
          routeToDriverName[data.route.toString()] = data.name;
        }
      });

      // Step 2: Fetch all students
      const studentSnapshot = await studentsRef.get();

      let complaintFound = false; // Track if any complaints exist

      for (const studentDoc of studentSnapshot.docs) {
        const studentData = studentDoc.data();
        const { name, routeNo, email } = studentData;

        if (!email) continue;

        const normalizedEmail = email.trim().replace(/\./g, "_");
        const feedbackDoc = await feedbackRef.doc(normalizedEmail).get();

        if (feedbackDoc.exists) {
          const feedbackData = feedbackDoc.data();
          const complaint = (feedbackData.complaint || "").trim();

          if (
            complaint &&
            !["no", "n/a", "none"].includes(complaint.toLowerCase())
          ) {
            complaintFound = true; // Mark as found

            // Get date
            let rawTimestamp = feedbackData.timestamp || studentData.timestamp;
            let complaintDate = "N/A";

            if (rawTimestamp && rawTimestamp.seconds) {
              complaintDate = new Date(
                rawTimestamp.seconds * 1000
              ).toLocaleDateString();
            }

            // Get driver name from route number
            const driverName = routeToDriverName[routeNo] || "Unknown Driver";

            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${name || "Unknown"}</td>
              <td>${routeNo || "N/A"}</td>
              <td>${driverName}</td>
              <td>${complaint}</td>
              <td>${complaintDate}</td>
            `;
            complaintsTableBody.appendChild(row);
          }
        }
      }

      // If no complaints found, show message
      if (!complaintFound) {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td colspan="5" style="text-align:center; color: grey;">No complaints</td>
        `;
        complaintsTableBody.appendChild(row);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
    }
  }

  loadUserComplaints();

  const ctx = document.getElementById("semesterTrendChart").getContext("2d");

  const semesterTrendChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Sem 1", "Sem 2", "Sem3", "Sem 4", "Sem 5", "Sem 6"],
      datasets: [
        {
          label: "Number of Users",
          data: [120, 150, 180, 160, 200, 220],
          fill: false,
          borderColor: "#007bff",
          backgroundColor: "#007bff",
          tension: 0.3,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#007bff",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
        },
      },
      interaction: {
        mode: "nearest",
        axis: "x",
        intersect: false,
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Users",
          },
        },
        x: {
          title: {
            display: true,
            text: "Semester",
          },
        },
      },
    },
  });
});
