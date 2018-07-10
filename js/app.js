// Globals
var map;
var locations = [
    {
        title: "Carlo's Bakery",
        location: {
            lat: 40.737205,
            lng: -74.030814
        }
    },
    {
        title: "O'Bagel",
        location: {
            lat: 40.743601,
            lng: -74.029188
        }
    },
    {
        title: "Illuzion",
        location: {
            lat: 40.741154,
            lng: -74.029512
        }
    },
    {
        title: "La Isla",
        location: {
            lat: 40.737758,
            lng: -74.0311
        }
    },
    {
        title: "Bareburger",
        location: {
            lat: 40.742694,
            lng: -74.02907
        }
    },
    {
        title: "Arthurs",
        location: {
            lat: 40.739855,
            lng: -74.029976
        }
    }
];

// Main ViewModel function
function myViewModel() {

    var self = this;
    this.listView = ko.observableArray(locations);      // Observable array holding locations on the sidebar
    this.filterText = ko.observable("");                // Observable tracking text entered into sidebar filter
    this.markers = [];                                  // Markers array holding all Google Maps markers

    // Initializing the map and markers
    this.initMap = function() {

        // Create a styles array to use with the map. Credit to SnazzyMaps site for template style.
        var styles = [
            {
                "featureType": "administrative",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": "-100"
                    }
                ]
            },
            {
                "featureType": "administrative.province",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": 65
                    },
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "lightness": "50"
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": "-100"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "all",
                "stylers": [
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "all",
                "stylers": [
                    {
                        "lightness": "30"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "all",
                "stylers": [
                    {
                        "lightness": "40"
                    }
                ]
            },
            {
                "featureType": "transit",
                "elementType": "all",
                "stylers": [
                    {
                        "saturation": -100
                    },
                    {
                        "visibility": "simplified"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "hue": "#ffff00"
                    },
                    {
                        "lightness": -25
                    },
                    {
                        "saturation": -97
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels",
                "stylers": [
                    {
                        "lightness": -25
                    },
                    {
                        "saturation": -100
                    }
                ]
            }
        ];

        // Creating a new Google Maps map
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 40.741154, lng: -74.029512},
            zoom: 16,
            styles: styles,
            mapTypeControl: false
        });

        // Setting up Google Maps objects
        var largeInfowindow = new google.maps.InfoWindow();
        var bounds = new google.maps.LatLngBounds();

        // Setting marker icon color
        var defaultIcon = self.makeMarkerIcon('0091ff');
        var highlightedIcon = self.makeMarkerIcon('e51b1b');

        // Creating the Google Maps markers
        for (var i = 0; i < locations.length; i++) {
            var position = locations[i].location;
            var title = locations[i].title;

            var marker = new google.maps.Marker({
                position: position,
                title: title,
                animation: google.maps.Animation.DROP,
                icon: defaultIcon,
                map: map,
                id: i
            });

            bounds.extend(marker.position);
            this.markers.push(marker);

            // Creating event listeners for markers to open the infowindow and change colors
            marker.addListener('click', function() {
                self.populateInfoWindow(this, largeInfowindow);
            });
            marker.addListener('mouseover', function() {
                this.setIcon(highlightedIcon);
            });
            marker.addListener('mouseout', function() {
                this.setIcon(defaultIcon);
            });
        };

        map.fitBounds(bounds);
    };

    // Set up and opem marker information window
    this.populateInfoWindow = function(marker, infowindow) {

        // Check to make sure the infowindow is not already opened
        if (infowindow.marker != marker) {

            infowindow.setContent('');
            infowindow.marker = marker;

            // Make the marker bounce for 2 seconds when clicked 
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() { 
                marker.setAnimation(null);
            }, 2000);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            // Setting up FourSquare query for venue information
            var FS_CLIENT_ID = 'GTKDTXJBPAPD3BHM44MHZOLJ1GULTZISFBBOPTK31R5JA5CC';
            var FS_CLIENT_SECRET = '4OVUQ35BJN5N5DDDGNBQKXDA14L3MFXYEPSVW30TRBF02KOO';
            var fsquery = 'https://api.foursquare.com/v2/venues/search?ll=' + marker.position.lat() + ',' + marker.position.lng() + '&client_id=' + FS_CLIENT_ID + '&client_secret=' + FS_CLIENT_SECRET + '&v=20180708&radius=1&query=' + marker.title;
            var content = '<div id=place><h2>' + marker.title + '</h2></div>';

            // Get FourSquare venue information
            $.getJSON(fsquery, function(data) {

                content += '<div id=address><h3>Address:</h3>';
                var address = data.response.venues[0].location.formattedAddress;
                var venueID = data.response.venues[0].id;

                for(var i = 0; i < address.length; i++) {           
                    content += '<p>' + address[i] + '</p>';
                };

                infowindow.setContent(content + '</div>');

                // Creating second FourSquare query to get tips information
                var fsquery2 = 'https://api.foursquare.com/v2/venues/' + venueID + '/tips?client_id=' + FS_CLIENT_ID + '&client_secret=' + FS_CLIENT_SECRET + '&v=20180708&limit=1';

                // Get FourSquare tips information for venue
                $.getJSON(fsquery2, function(data) {

                    content += '<div id=tip>';
                    var tip = data.response.tips.items[0].text;
                    infowindow.setContent(content + '<h3>Latest Review:</h3><p><i>"' + tip + '"</i></p></div>');

                }).fail(function() {
                    // Error handling for when tips data cannot be retrieved
                    alert('Something went wrong when contacting the FourSquare API! Cannot load tips data!');
                });

            }).fail(function() {
                // Error handling for when address data cannot be retrieved
                infowindow.setContent(content);
                alert('Something went wrong when contacting the FourSquare API! Cannot load address data!');
            });

            // Open info window
            infowindow.open(map, marker);
        };
    };

    // Show listings during filtering operation
    this.showListings = function(markersToShow) {

        var bounds = new google.maps.LatLngBounds();

        for (var i = 0; i < markersToShow.length; i++) {
            var foundMarker = this.markers[this.markers.findIndex(x => x.title==markersToShow[i].title)];
            foundMarker.setMap(map);
            bounds.extend(foundMarker.position);
        };

        map.fitBounds(bounds);
    };

    // Hide listings during filtering operation
    this.hideListings = function(markersToHide) {

        for (var i = 0; i < markersToHide.length; i++) {
            var foundMarker = this.markers[this.markers.findIndex(x => x.title==markersToHide[i].title)];
            foundMarker.setMap(null);
        };
    };

    // Stylizes marker dynamically
    this.makeMarkerIcon = function(markerColor) {

        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));

        return markerImage;
    };

    // Start of Knockout.JS Functions for View

    // Runs when filter is clicked and adjusts sidebar location list
    this.rebuildList = function() {

        this.listView([]);

        for(var i = 0; i < locations.length; i++) {
            this.listView.push(locations[i]);
        };

        var removedPlaces = this.listView.remove(function(toRemove) {
            return !toRemove.title.toLowerCase().includes(self.filterText().toLowerCase());
        });

        this.showListings(this.listView());
        this.hideListings(removedPlaces);
    }

    // Runs when a sidebar location is clicked and simulates a click event on the marker
    this.passToInfoWindow = function(listItemClicked) {

        google.maps.event.trigger(self.markers[self.markers.findIndex(x => x.title==listItemClicked.title)], 'click');
    };

    // Highlights sidebar location when hovering over it
    this.normalToHighlight = function(param1, event) {
        event.target.style.color = "red";
        event.target.style.backgroundColor = "gray";
    };

    // Returns sidebar location to no highlight when not hovering over it    
    this.highlightToNormal = function(param1, event){
        event.target.style.color = "white";
        event.target.style.backgroundColor = null;
    }

    this.initMap();
}

// Error function that sends an alert when Google Maps API can't be reached
function mapError() {

    alert("Google Maps API could not load!");
}

// Applying Knockout.JS bindings
function startIt() {

    ko.applyBindings(new myViewModel());
}