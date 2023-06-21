let db;


(async () => {
  document.addEventListener("DOMContentLoaded", createIndexedDatabase);
})();

/**
 * Performs the necessary tasks during application startup, including checking for data in the indexedDB and cloud database,
 * fetching API data if needed, and rendering all jokes on the web page.
 * @returns {Promise} A promise that resolves when the startup tasks are completed.
 */

async function onStartup() {
    const dataExistsInIndexedDB = await checkDataExistsInIndexedDB(db);
    if(dataExistsInIndexedDB){
      getAllJokesAndRender(db);
    }
    else if (await checkCloudDBData()) {
      getAllJokesAndRender(db);
    } else {
      await fetchAPIData();
      getAllJokesAndRender(db);
    }
  }
  

/**
 * Creates or opens an indexedDB database named "jokes_db" and sets up the necessary object store.
 * This function is  called during application startup.
 */
function createIndexedDatabase() {
  const openCreateDB = indexedDB.open("jokes_db", 1);

  openCreateDB.onerror = function () {
    console.error("Error opening DB");
  };

  openCreateDB.onsuccess = function () {
    db = openCreateDB.result;
    onStartup();
  };

  openCreateDB.onupgradeneeded = function (event) {
    db = event.target.result;

    // Create the 'jokesStore' object store and an index on the 'id' property
    if (!db.objectStoreNames.contains("jokesStore")) {
      const objectStore = db.createObjectStore("jokesStore", { keyPath: "id" });
      objectStore.createIndex("id", "id", { unique: true });
    }
  };
}

/**
 * Checks if data exists in the 'jokesStore' object store of the indexedDB.
 * @param {IDBDatabase} db - The indexedDB database to check for data existence.
 * @returns {Promise<boolean>} A promise that resolves with a boolean value indicating whether data exists (true) or not (false) in the 'jokesStore' object store.
 */

function checkDataExistsInIndexedDB(db) {
  if (db) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction("jokesStore", "readonly");
      const store = tx.objectStore("jokesStore");

      const request = store.count();

      request.onsuccess = function (event) {
        const count = event.target.result;
        const dataExists = count > 0;
        resolve(dataExists);
      };

      request.onerror = function (event) {
        reject(new Error("Error checking if data exists in jokesStore"));
      };
    });
  }
}

/**
 * Retrieves all jokes data from the indexedDB and renders them on the web page.
 * @param {IDBDatabase} db - The indexedDB database to retrieve jokes data from.
 */
function getAllJokesAndRender(db) {
  const tx = db.transaction("jokesStore", "readonly");
  const store = tx.objectStore("jokesStore");

// Retrieve all jokes data from the 'jokesStore' object store
  const request = store.getAll();

  request.onsuccess = function (event) {
    const jokes = event.target.result;

    const itemList = document.getElementById("jokesList");
            // Render each joke on the web page

    jokes.forEach((joke) => {
              // Create the necessary DOM elements for each joke

      const div = document.createElement("div");
      div.classList.add(
        "flex",
        "flex-col",
        "justify-center",
        "mt-5",
        "text-2xl"
      );

      const borderDiv = document.createElement("div");
      borderDiv.classList.add("p-4", "border-gray-900", "shadow", "rounded-xl");

      const titleDiv = document.createElement("div");
      titleDiv.classList.add("text-lg");

      const title = document.createElement("h4");
      title.textContent = joke.title;

      titleDiv.appendChild(title);
      borderDiv.appendChild(titleDiv);
      const hr = document.createElement("hr");
      borderDiv.appendChild(hr);
      const bodyDiv = document.createElement("div");
      bodyDiv.classList.add("text-lg");
      const bodyParagraph = document.createElement("p");
      bodyParagraph.textContent = joke.body;

      bodyDiv.append(bodyParagraph);
      borderDiv.appendChild(bodyDiv);
      const scoreDiv = document.createElement("div");

      scoreDiv.classList.add("flex", "font-semibold");
      const scoreTextDiv = document.createElement("div");

      scoreTextDiv.classList.add("text-blue-500");
      const scoreHeader = document.createElement("h4");

      scoreHeader.classList.add("pr-2");

      scoreHeader.textContent = "Score:";

      scoreTextDiv.appendChild(scoreHeader);
      scoreDiv.appendChild(scoreTextDiv);

      const score = document.createElement("div");

      const header = document.createElement("h4");

      header.textContent = joke.score;
      score.appendChild(header);

      scoreDiv.appendChild(score);

      borderDiv.appendChild(scoreDiv);

      div.append(borderDiv);

            // Append the joke element to the item list on the web page
      itemList.appendChild(div);
    });
  };
}

/**
 * Checks the cloud database for available data by fetching it using the fetchData function.
 * @returns {Promise} A promise that resolves with the fetched data from the cloud database.
 */

async function checkCloudDBData() {
  return await fetchData();
}


/**
 * Fetches jokes data from the API and adds it to the local IndexedDB.
 * @returns {Promise<boolean|null>} A promise that resolves with a boolean value indicating success (true) or no data (null).
 */
async function fetchData() {
  const url = "https://world-of-jokes-victor-mwania.vercel.app/api/jokes";
  const options = {
    method: "GET",
  };

  // Fetch jokes data from the API
  const jokes = await fetch(url, options);
  const response = await jokes.json();

  if (response.length > 0) {
    // Add the fetched jokes data to the local IndexedDB
    addJokes(response);
    return true;
  }
 // No data was fetched from the API
  return null;
}

function addJokes(data) {
  const tx = db.transaction("jokesStore", "readwrite");
  const store = tx.objectStore("jokesStore");

  data.forEach((re) => {
    store.add(re);
  });
}

/**
 * Fetches jokes data from an API and adds it to the cloud database.
 * @returns {Promise} A promise that resolves when the data is successfully fetched and added to the database.
 */
async function fetchAPIData() {
  const url =
    "https://world-of-jokes1.p.rapidapi.com/v1/jokes?limit=30&page=1&sortBy=score%3Adesc";
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "EXbQh0IyV7msh6JVwQy5zGmx3bjhp1sj8XCjsnD6jJm992Rzi1",
      "X-RapidAPI-Host": "world-of-jokes1.p.rapidapi.com",
    },
  };

  // Fetch jokes data from the API
  const jokes = await fetch(url, options);
  const response = await jokes.json();

  // Add the fetched jokes data to the cloud database
  await addDataToCloudDB(response.results);
}


/**
 * Adds jokes data to the cloud database.
 * @param {Array} jokes - An array of jokes to be added to the database.
 * @returns {Promise} A promise that resolves when the data is successfully added to the database.
 */

async function addDataToCloudDB(jokes) {
  const url = "https://world-of-jokes-victor-mwania.vercel.app/api/jokes";
  const options = {
    method: "POST",
    body: JSON.stringify(jokes),
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
  };

// Send a POST request to the API with the jokes data
  fetch(url, options)
    .then((response) => response.json())
    .then((result) => console.log(result));
 // Call the addJokes function with the jokes data to be added to indexedDB
  addJokes(jokes);
}
