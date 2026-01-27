function initMap() {
    const location = { lat: 43.8971, lng: -78.8658 }; 
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: location,
    });

    new google.maps.Marker({
        position: location,
        map: map,
        title: "Oshawa"
    });
}