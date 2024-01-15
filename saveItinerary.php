<?php
$itinerariesFile = 'itineraries.json';

$requestPayload = file_get_contents('php://input');
$newItinerary = json_decode($requestPayload, true);

if ($newItinerary) {
    $existingItineraries = json_decode(file_get_contents($itinerariesFile), true) ?? [];
    
    // Merge the new itinerary into the existing array
    $existingItineraries = array_merge($existingItineraries, $newItinerary);

    if (file_put_contents($itinerariesFile, json_encode($existingItineraries)) !== false) {
        $response = ["message" => "Itinerary saved successfully."];
    } else {
        $response = ["message" => "Failed to save itinerary. Check file permissions and try again."];
    }
} else {
    $response = ["message" => "Failed to save itinerary. Invalid data received."];
}

echo json_encode($response);
?>
