let dateSelect; // Declare dateSelect globally

function initMap() {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 25.032969, lng: 121.565418 },
  });

  directionsRenderer.setMap(map);

  const onChangeHandler = function () {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  document.getElementById("location").addEventListener("change", onChangeHandler);
  document.getElementById("mode").addEventListener("change", onChangeHandler);

  // XMLHttpRequest to fetch itinerary data
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          document.getElementById("itinerary-data").textContent = xhr.responseText;

          const itineraryScript = document.getElementById("itinerary-data");
          let demoLocations;

          try {
            demoLocations = JSON.parse(itineraryScript.textContent);
          } catch (jsonError) {
            console.error("Error parsing JSON:", jsonError);
            demoLocations = [];
          }

          const locationSelect = document.getElementById("location");
          locationSelect.innerHTML = '';

          demoLocations.forEach((entry) => {
            const option = document.createElement("option");
            option.value = entry.location;
            option.textContent = `${entry.start} to ${entry.end}`;
            locationSelect.appendChild(option.cloneNode(true));
          });

          // Set dateSelect globally
          dateSelect = document.getElementById("date");

          // Trigger the change event after loading options
          onChangeHandler();
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        console.error("Request failed with status:", xhr.status);
      }
    }
  };


  xhr.open("GET", "itineraries.json", true);
  xhr.send();

  function calculateAndDisplayRoute() {
    const locationSelect = document.getElementById("location");
    const dateSelect = document.getElementById("date");
    const jsonData = JSON.parse(document.getElementById("itinerary-data").textContent);
  
    const selectedLocation = locationSelect.value;
    const selectedDate = dateSelect.value;
  
    const selectedItinerary = jsonData.find((itinerary) => {
      return itinerary.start === selectedLocation && itinerary.end === selectedEndLocation && itinerary.date === selectedDate;
    });
  
    if (!selectedItinerary) {
      window.alert("Selected itinerary not found.");
      return;
    }
  
    const startLocation = selectedItinerary.start;
    const endLocation = selectedItinerary.end;
  
    if (startLocation === undefined || endLocation === undefined) {
      window.alert("Invalid itinerary data. Start or end location is undefined.");
      return;
    }
  
    const selectedMode = document.getElementById("mode").value;
 
  
    directionsService
      .route({
        origin: { query: startLocation },
        destination: { query: endLocation },
        travelMode: google.maps.TravelMode[selectedMode],
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
  
        const route = response.routes[0];
        if (route && route.legs && route.legs.length > 0) {
          const firstLeg = route.legs[0];
          const durationInSeconds = firstLeg.duration.value;
          const durationInMinutes = Math.ceil(durationInSeconds / 60);
  
          document.getElementById("estimated-time").textContent = `Estimated travel time: ${durationInMinutes} minutes`;
  
          const stepsContainer = document.getElementById("route-steps");
          if (selectedMode === "TRANSIT") {
            stepsContainer.style.display = "block";
            stepsContainer.innerHTML = "<strong>Route Steps:</strong><br>";
  
            firstLeg.steps.forEach((step, index) => {
              const stepDescription = `${index + 1}. ${step.instructions}`;
              const stepElement = document.createElement("div");
              stepElement.textContent = stepDescription;
              stepsContainer.appendChild(stepElement);
            });
          } else {
            stepsContainer.style.display = "none";
          }
        }
      })
      .catch((error) => {
        window.alert("Directions request failed due to " + error);
      });
  } 
}

document.addEventListener("DOMContentLoaded", function () {
  initMap();
});

window.initMap = initMap;
