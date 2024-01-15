<?php
// Get the request payload
$data = json_decode(file_get_contents('php://input'), true);

// Extract the location and date from the payload
$location = $data['location'] ?? '';
$date = $data['date'] ?? '';

// Debug output
file_put_contents('debug.log', "Location: $location, Date: $date\n", FILE_APPEND);

if ($location === '' || $date === '') {
  // Return error response if location or date is missing
  http_response_code(400);
  echo json_encode(['message' => 'Invalid location or date.']);
  exit;
}

// Read the contents of itineraries.json file
$jsonFile = 'itineraries.json';
$jsonContents = file_get_contents($jsonFile);

// Parse JSON into an array
$itineraries = json_decode($jsonContents, true);

// Debug output
file_put_contents('debug.log', "Existing Itineraries: " . print_r($itineraries, true) . "\n", FILE_APPEND);

// Find the index of the itinerary to be removed
$index = -1;
foreach ($itineraries as $key => $itinerary) {
  if ($itinerary['location'] === $location && $itinerary['date'] === $date) {
    $index = $key;
    break;
  }
}

// Debug output
file_put_contents('debug.log', "Index: $index\n", FILE_APPEND);

// If found, remove the itinerary
if ($index !== -1) {
  array_splice($itineraries, $index, 1);

  // Debug output
  file_put_contents('debug.log', "Updated Itineraries: " . print_r($itineraries, true) . "\n", FILE_APPEND);

  // Convert the updated itineraries back to JSON
  $updatedJson = json_encode($itineraries);

  // Write the updated JSON back to the file
  file_put_contents($jsonFile, $updatedJson);
  
  // Return success response
  http_response_code(200);
  echo json_encode(['message' => 'Itinerary successfully removed.']);
} else {
  // Return error response
  http_response_code(400);
  echo json_encode(['message' => 'Itinerary not found.']);
}
?>
