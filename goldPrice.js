function getGoldPrice() {
    // Make an API request to get the gold price
    fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      .then(response => response.json())
      .then(data => {
        // Extract the gold price from the API response
        const goldPrice = data.bpi.USD.rate;
  
        // Update the webpage with the new gold price
        const goldPriceElement = document.getElementById('goldPrice');
        goldPriceElement.innerHTML = goldPrice;
      })
      .catch(error => {
        console.error('Error fetching gold price:', error);
      });
  }

  function createGoldChart() {
    const canvas = document.getElementById("goldChart");
  
    fetch("https://www.goldapi.io/api/XAU/USD")
      .then(response => response.json())
      .then(data => {
        const chart = new Chart(canvas, {
          type: "line",
          data: {
            labels: data.prices.map(price => price.timestamp),
            datasets: [
              {
                label: "Gold Price",
                data: data.prices.map(price => price.price),
                fill: false,
                borderColor: "rgb(255, 165, 0)",
                tension: 0.1
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        });
      });
  }
