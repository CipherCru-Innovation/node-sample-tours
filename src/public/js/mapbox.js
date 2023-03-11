/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWFnYXJ3YWwiLCJhIjoiY2xlM3pyejBnMGR5bDN3bHhmanMxOGQ1ZiJ9.bEGkRwaSQNpWWx2zKU1-PA';

    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/aagarwal/cle421br0005c01ogrrp947f3', // style URL
        zoom: 13,
        scrollZoom: false // starting zoom
    });

    const bound = new mapboxgl.LngLatBounds();
    locations.forEach((element) => {
        // Add Marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(element.coordinates)
            .addTo(map);

        new mapboxgl.Popup({ offset: 30 })
            .setLngLat(element.coordinates)
            .setHTML(`<p> ${element.day} : ${element.description}</p>`)
            .addTo(map);
        bound.extend(element.coordinates);
    });

    map.fitBounds(bound, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
};
