/*
  Author: Anna Dao
  Description: Fetch facts from the JSON file called facts.json
*/
fetch('../json/facts.json')
  .then(response => response.json())
  .then(data => {
    const facts = data.facts;

    function getRandomFact() {
        const randomNumber = Math.floor(Math.random() * facts.length);
        const randomFact = facts[randomNumber];
        document.getElementById('factText').innerText = randomFact.fact;
        document.getElementById('factSource').innerText = randomFact.source;
    }

    // This is the new initial fact when the user loads the page
    getRandomFact();

    // Click "More facts" button click to generate a new random fact.
    document.getElementById('moreFacts').addEventListener('click', getRandomFact);
  })
.catch(error => console.error('Error fetching facts:', error));