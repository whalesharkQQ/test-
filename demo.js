document.addEventListener('DOMContentLoaded', () => {
  localStorage.clear();

  const travelForm = document.getElementById('travel-form');
  const itineraryList = document.getElementById('itinerary-list');
  const saveButton = document.getElementById('saveButton');

  // Load saved itineraries
  loadItineraries();

  travelForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const date = document.getElementById('date').value;

    // Validate date (not before today)
    if (isValidDate(date)) {
      // Create itinerary item
      const itineraryItem = createItineraryElement(start, end, date);

      // Append the itinerary item to the list
      itineraryList.appendChild(itineraryItem);

      // Save the itinerary to local storage
      saveItinerary(start, end, date);

      // Clear the form
      travelForm.reset();
    } else {
      alert('Please select a date not before today.');
    }
  });

  // Function to check if the date is valid (not before today)
  function isValidDate(selectedDate) {
    const today = new Date();
    const selectedDateObj = new Date(selectedDate);
    return selectedDateObj >= today;
  }

  // Save itinerary to local storage and itineraries.json file
    function saveItinerary(start, end, date) {
      let itineraries = JSON.parse(localStorage.getItem('itineraries')) || [];

      const itinerary = {
        start,
        end,
        date,
      };

      itineraries.push(itinerary);

      // Update itineraries.json file
      fetch('./saveItinerary.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itineraries),
      })
        .then(response => {
          if (response.ok) {
            // Save itineraries to local storage
            localStorage.setItem('itineraries', JSON.stringify(itineraries));
          } else {
            console.error('Failed to save itinerary. Response:', response);
            throw new Error('Failed to save itinerary.');
          }
        })
        .catch(error => {
          console.error('Error saving itinerary:', error);
        });
    }


  // Load saved itineraries
  function loadItineraries() {
    fetch('./itineraries.json')
      .then(response => response.json())
      .then(data => {
        let itineraries = data;

        itineraries.forEach((itinerary) => {
          const itineraryItem = createItineraryElement(itinerary.start, itinerary.end, itinerary.date);
          itineraryList.appendChild(itineraryItem);
        });
      })
      .catch(error => {
        console.error('Error loading itineraries:', error);
      });
  }

  // Create itinerary item element
  function createItineraryElement(start, end, date) {
    const itineraryItem = document.createElement('li');
    const identifier = `${start}-${end}-${date}`;
    itineraryItem.id = identifier;
    itineraryItem.textContent = `Start: ${start}, End: ${end}, Date: ${date}`;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      // Remove the itinerary item from the list
      itineraryList.removeChild(itineraryItem);

      // Remove the itinerary from local storage and server
      removeItineraryFromJson(start, end, date);
    });

    // Append delete button to the itinerary item
    itineraryItem.appendChild(deleteButton);

    return itineraryItem;
  }

  function removeItineraryFromJson(start, end, date) {
    const itinerary = {
      start,
      end,
      date,
    };

    fetch('./removeItinerary.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itinerary),
    })
      .then(response => {
        if (response.ok) {
          // Remove the itinerary from the front end without reloading all itineraries
          removeItineraryFromFrontEnd(start, end, date);
        } else {
          throw new Error('Failed to remove itinerary.');
        }
      })
      .catch(error => {
        console.error('Error removing itinerary:', error);
      });
  }

  // Function to remove the itinerary from the front end without reloading all itineraries
  function removeItineraryFromFrontEnd(start, end, date) {
    // Construct a unique identifier for the itinerary
    const identifier = `${start}-${end}-${date}`;

    // Find and remove the itinerary item from the list using the identifier
    const itineraryItem = document.getElementById(identifier);
    if (itineraryItem) {
      itineraryList.removeChild(itineraryItem);
    }
  }
});
