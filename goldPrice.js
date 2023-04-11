// // function getGoldPrice() {
// //     // Make an API request to get the gold price
// //     fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
// //       .then(response => response.json())
// //       .then(data => {
// //         // Extract the gold price from the API response
// //         const goldPrice = data.bpi.USD.rate;
  
// //         // Update the webpage with the new gold price
// //         const goldPriceElement = document.getElementById('goldPrice');
// //         goldPriceElement.innerHTML = goldPrice;
// //       })
// //       .catch(error => {
// //         console.error('Error fetching gold price:', error);
// //       });
// //   }

//   const apiUrl = 'https://api.coindesk.com/v1/bpi/currentprice.json';

// // fetch current gold price data from API
// fetch(apiUrl)
//   .then(response => response.json())
//   .then(data => {
//     const currentPrice = data.bpi.USD.rate;
//     document.getElementById('gold-price').innerHTML = '$' + currentPrice;
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//   });

// // fetch historical gold price data from API
// const historicalApiUrl = 'https://api.coindesk.com/v1/bpi/historical/close.json?currency=USD&start=2010-07-17&end=2023-04-10';

// fetch(historicalApiUrl)
//   .then(response => response.json())
//   .then(data => {
//     const goldPrices = Object.values(data.bpi);
//     const dates = Object.keys(data.bpi);

//     // create a Chart.js line chart
//     const ctx = document.getElementById('goldPriceChart').getContext('2d');
//     const chart = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: dates,
//         datasets: [{
//           label: 'Gold Prices',
//           data: goldPrices,
//           backgroundColor: 'rgba(255, 206, 86, 0.2)',
//           borderColor: 'rgba(255, 206, 86, 1)',
//           borderWidth: 1
//         }]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }
//     });
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//   });
const refreshBtn = document.getElementById("refresh-btn");
const goldPrice = document.getElementById("gold-price");
const apiUrl = "https://api.coindesk.com/v1/bpi/currentprice.json";

// Fetch gold price from API and update page
async function getGoldPrice() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const price = data.bpi.USD.rate_float.toFixed(2);
    goldPrice.textContent = price;
  } catch (error) {
    console.log("Error fetching gold price: ", error);
  }
}

// Call getGoldPrice function when page loads and refresh button is clicked
document.addEventListener("DOMContentLoaded", getGoldPrice);
refreshBtn.addEventListener("click", getGoldPrice);

// Chart configuration
const goldPriceChart = document.getElementById("goldPriceChart").getContext("2d");
const chart = new Chart(goldPriceChart, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Gold Price (USD)",
        data: [],
        backgroundColor: "rgba(255, 205, 86, 0.2)",
        borderColor: "rgba(255, 205, 86, 1)",
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  },
  options: {
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        display: false
      }]
    },
    legend: {
      display: true
    }
  }
});

// Update chart with new data
function updateChart(price) {
  chart.data.labels.push("");
  chart.data.datasets[0].data.push(price);
  chart.update();
}

// Call updateChart function with current gold price every 10 seconds
setInterval(() => {
  getGoldPrice().then(() => {
    const price = parseFloat(goldPrice.textContent.replace(",", ""));
    updateChart(price);
  });
}, 10000);