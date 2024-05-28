/*
  Author: Anna Dao
  Description: Fetch facts from the JSON file called facts.json
*/
// Start the clickCount at 0, when the user clicks
let clickCount = 0;

// Function to fetch facts from a JSON file
const fetchFacts = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching facts from ${url}:`, error);
    return null;
  }
};

const displayRandomFact = (fact) => {
  document.getElementById('factText').innerText = fact.fact;
  document.getElementById('factSource').innerText = fact.source;
  // document.getElementById('factImage').innerText = fact.image;
};

// Display facts from facts or other facts
const handleFactFetching = async () => {
  try {
    const factsData = await fetchFacts('../json/facts.json');
    const otherFactsData = await fetchFacts('../json/otherfacts.json');

    if (factsData && otherFactsData) {
      const facts = factsData.facts;
      const otherFacts = otherFactsData.weird_climate_facts;

      // Display initial random fact
      displayRandomFact(facts[Math.floor(Math.random() * facts.length)]);

      // Event listener, when user clicks more facts, will generate a new fact on the page
      document.getElementById('moreFacts').addEventListener('click', () => {
        clickCount++;

        let easterEgg = document.getElementById("easter");

        if (clickCount < 5) {
          displayRandomFact(facts[Math.floor(Math.random() * facts.length)]);
          easterEgg.style.display = "none";
          easterEgg.classList.remove("spin");
        } else {
          displayRandomFact(otherFacts[Math.floor(Math.random() * otherFacts.length)]);
          easterEgg.style.display = "inline-block";
          easterEgg.classList.add("spin");
          clickCount = 0;
        }
      });
    }
  } catch (error) {
    console.error('Error handling facts:', error);
  }
};

handleFactFetching();
