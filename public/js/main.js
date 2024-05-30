/*
  Author: Anna Dao
  Description: Fetch facts from the JSON file called facts.json
*/
<<<<<<< HEAD

// Start the clickCount at 0, when the user clicks
let clickCount = 0;
let lastDisplayedFact = null;
=======
//Start the clickCount at 0, when the user clicks
let clickCount = 0;

>>>>>>> dev-dashboard-graphs

// Function to fetch facts from a JSON file
const fetchFacts = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
<<<<<<< HEAD
  }
  catch (error) {
=======
  } catch (error) {
>>>>>>> dev-dashboard-graphs
    console.error(`Error fetching facts from ${url}:`, error);
    return null;
  }
};

<<<<<<< HEAD
=======

>>>>>>> dev-dashboard-graphs
const displayRandomFact = (fact) => {
  document.getElementById('factText').innerText = fact.fact;
  document.getElementById('factSource').innerText = fact.source;
  // document.getElementById('factImage').innerText = fact.image;
};

<<<<<<< HEAD
const getRandomFact = (facts) => {
  let randomFact;
  do {
    randomFact = facts[Math.floor(Math.random() * facts.length)];
  } while (randomFact.fact === lastDisplayedFact);
  
  lastDisplayedFact = randomFact.fact;
  return randomFact;
};

// Display facts from facts or other facts
const handleFactFetching = async () => {
  try {
    const factsData = await fetchFacts('../json/facts.json');
=======

// Display facts from facts or other facts.
const handleFactFetching = async () => {
  try {
    const factsData = await fetchFacts('../json/facts.json');

>>>>>>> dev-dashboard-graphs
    const otherFactsData = await fetchFacts('../json/otherfacts.json');

    if (factsData && otherFactsData) {
      const facts = factsData.facts;
      const otherFacts = otherFactsData.weird_climate_facts;

      // Display initial random fact
<<<<<<< HEAD
      displayRandomFact(getRandomFact(facts));

      // Event listener, when user clicks more facts, will generate a new fact on the page
=======
      displayRandomFact(facts[Math.floor(Math.random() * facts.length)]);
      //event listener, when user clicks more facts, will generate a new fact on the page.
>>>>>>> dev-dashboard-graphs
      document.getElementById('moreFacts').addEventListener('click', () => {
        clickCount++;

        let easterEgg = document.getElementById("easter");
<<<<<<< HEAD

        if (clickCount < 5) {
          displayRandomFact(getRandomFact(facts));
          easterEgg.style.display = "none";
          easterEgg.classList.remove("spin");
        } else {
          displayRandomFact(getRandomFact(otherFacts));
          easterEgg.style.display = "inline-block";
          easterEgg.classList.add("spin");
=======
        if (clickCount < 5) {
          
          displayRandomFact(facts[Math.floor(Math.random() * facts.length)]);
          easterEgg.style.display = "none";
        }
        else {
          displayRandomFact(otherFacts[Math.floor(Math.random() * otherFacts.length)]);
          easterEgg.style.display = "inline-block";
>>>>>>> dev-dashboard-graphs
          clickCount = 0;
        }
      });
    }
<<<<<<< HEAD
  }
  catch (error) {
=======
  } catch (error) {
>>>>>>> dev-dashboard-graphs
    console.error('Error handling facts:', error);
  }
};

<<<<<<< HEAD
handleFactFetching();
=======
handleFactFetching();
>>>>>>> dev-dashboard-graphs
