document.addEventListener("DOMContentLoaded", function () {
  // User Feedback Analysis (Bar Chart)
  var ctx1 = document.getElementById("userFeedbackChart").getContext("2d");

  new Chart(ctx1, {
    type: "bar",
    data: {
      labels: [
        "Driver Behavior",
        "Vehicle Speed",
        "Seating Comfort",
        "On-Time Service",
        "Route Availability",
      ],
      datasets: [
        {
          label: "User Feedback (Higher is Better)",
          data: [80, 60, 75, 40, 70], // Sample Feedback Scores
          backgroundColor: [
            "#4CAF50", // Driver Behavior
            "#FFC107", // Vehicle Speed
            "#2196F3", // Seating Comfort
            "#FF5722", // On-Time Service (Previously Punctuality)
            "#5bc0f9", // Route Availability
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "User Satisfaction Score",
            font: {
              size: 15,
              weight: "bold",
            },
            padding: { bottom: 10 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Feedback Categories",
            font: { size: 15, weight: "bold" },
            padding: { top: 20 }, // Adjust this value as needed
          },
        },
      },
      plugins: {
        legend: {
          display: false, // Hides legend since the chart is self-explanatory
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          color: "#000",
          font: {
            weight: "bold",
            size: 15,
          },
          anchor: "center",
          align: "top",
          formatter: (value) => value, // Display exact values on top of bars
        },
      },
    },
    plugins: [ChartDataLabels],
  });


  // Users with Pending Fee (Pie Chart)
  // Ensure Chart.js and ChartDataLabels plugin are included in your HTML
  // Ensure Chart.js and ChartDataLabels plugin are included in your HTML
  var ctx2 = document.getElementById("pendingFeeChart").getContext("2d");

  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: ["Paid", "Pending"],
      datasets: [
        {
          data: [110, 40], // Sample Data (110 Paid, 40 Pending)
          backgroundColor: ["#4CAF50", "#FF5722"],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom", // Move legend below the chart
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          color: "#ffffff", // White text for better visibility
          font: {
            weight: "bold",
            size: 15,
          },
          formatter: (value) => value, // Show only the number (no percentage)
          anchor: "center",
          align: "center",
        },
      },
    },
    plugins: [ChartDataLabels], // Enable data labels inside pie chart
  });

  // Transport Users Over Semesters (Line Chart)
  var ctx3 = document.getElementById("semesterTrendChart").getContext("2d");

  new Chart(ctx3, {
    type: "line",
    data: {
      labels: [
        "Odd Sem (2022-23)",
        "Even Sem (2022-23)",
        "Odd Sem (2023-24)",
        "Even Sem (2023-24)",
      ],
      datasets: [
        {
          label: "No. of Transport Users",
          data: [100, 120, 110, 95], // Sample Data
          borderColor: "#FF5722",
          backgroundColor: "rgba(255, 87, 34, 0.2)",
          fill: true,
          tension: 0.3, // Adds slight curve to the line
          pointStyle: "circle",
          pointRadius: 5,
          pointBackgroundColor: "#FF5722",
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          suggestedMin: 80, // Ensures the chart doesn't start too low
          suggestedMax: 140, // Adjust max range for better readability
          ticks: {
            stepSize: 10, // Show numbers at intervals of 10
            callback: function (value) {
              return value;
            }, // Display actual values
          },
          title: {
            display: true,
            text: "No. of Transport Users",
            font: {
              size: 15,
              weight: "bold",
            },
            padding: { bottom: 20 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Semesters (Annual Year)",
            font: {
              size: 15,
              weight: "bold",
            },
            padding: { top: 20 },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          enabled: true,
        },
      },
    },
  });



  // Route-Wise Passenger Distribution (Bar Chart)
  // Ensure Chart.js and ChartDataLabels plugin are included in your HTML
  var ctx4 = document.getElementById("routeChart").getContext("2d");

  new Chart(ctx4, {
    type: "bar",
    data: {
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // Route numbers
      datasets: [
        {
          label: "Passengers",
          data: [43, 36, 28, 27, 26, 26, 24, 20, 11, 10], // Sample Data
          backgroundColor: [
            "#3F51B5",
            "#009688",
            "#FF9800",
            "#E91E63",
            "#9C27B0",
            "#2196F3",
            "#8BC34A",
            "#FF5722",
            "#795548",
            "#607D8B",
          ],
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Routes", // X-axis label
            font: {
              size: 15,
              weight: "bold",
            },
            padding: { top: 20 },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Transport Users", // Y-axis label
            font: {
              size: 15,
              weight: "bold",
            },
            padding: { bottom: 10 },
          },
          ticks: {
            stepSize: 10,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
        },
        datalabels: {
          anchor: "center", // Position text inside the bar
          align: "center",
          formatter: (value) => value, // Display the exact number
          color: "#ffffff", // White text for better contrast
          font: {
            weight: "bold",
            size: 14,
          },
        },
      },
    },
    plugins: [ChartDataLabels], // Enable data labels inside bars
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Sample complaints data (Replace this with data from your backend)
  const complaints = [
    {
      user: "Prachi Gupta",
      routeNo: "4",
      routeName: "Mansarovar-Sodala",
      complaint: "Daily Bus Delay",
      date: "2024-03-23",
    },
    {
      user: "Amit Sharma",
      routeNo: "2",
      routeName: "Triveni Nagar-Jklu",
      complaint: "Daily change of bus",
      date: "2024-03-22",
    },
    {
      user: "Mahi Sen",
      routeNo: "7",
      routeName: "Murlipura-Jklu",
      complaint: "Bus capacity less than total bus users",
      date: "2024-03-21",
    },
  ];

  // Populate the complaints table
  const complaintsBody = document.getElementById("complaintsBody");
  complaints.forEach((item) => {
    const row = `<tr>
                        <td>${item.user}</td>
                        <td>${item.routeNo}</td>
                        <td>${item.routeName}</td>
                        <td>${item.complaint}</td>
                        <td>${item.date}</td>
                    </tr>`;
    complaintsBody.innerHTML += row;
  });
});


