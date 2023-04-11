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