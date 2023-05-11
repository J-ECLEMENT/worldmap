const detailsCountries = [];

//
//on affiche la map
//
const map = L.map('map').setView([20, 30], 2);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.attributionControl.addAttribution('Data from : <a href="https://api-ninjas.com/api/country">API Ninjas</a>');

//	
// Ajout sur la map des donnée geoJson (countries.js) 
//
const geojson = L.geoJson(countries, {
    style,
    onEachFeature
}).addTo(map);


//
//la couleur de l'amour c'est le cian
//
function getColorData(d, dataType) {
    if (dataType == "pop_density") {
        return d > 1000 ? '#800026' :
            d > 500 ? '#BD0026' :
                d > 200 ? '#E31A1C' :
                    d > 100 ? '#FC4E2A' :
                        d > 50 ? '#FD8D3C' :
                            d > 20 ? '#FEB24C' :
                                d > 10 ? '#FED976' :
                                    d > 0.01 ? '#FFEDA0' :
                                        d = 0 ? '#DCDCDC' : '#DCDCDC';
    }
    else if (dataType == "internet_users") {
        return d > 90 ? '#8B008B' :
            d > 75 ? '#8C349F' :
                d > 60 ? '#904CB2' :
                    d > 45 ? '#9566C6' :
                        d > 30 ? '#9678D2' :
                            d > 15 ? '#9D90E2' :
                                d > 0.01 ? '#A5A3EE' :
                                    d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (dataType == 'homicide_rate') {
        return d > 30 ? '#702f04' :
            d > 20 ? '#834427' :
                d > 10 ? '#995C50' :
                    d > 5 ? '#AF7579' :
                        d > 2 ? '#C38A9C' :
                            d > 1 ? '#D9A2C5' :
                                d > 0.5 ? '#D9BAF6' :
                                    d > 0.01 ? '#f4e2f5' :
                                        d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (dataType == 'gdp_growth') {
        return d > 10 ? '#69EB12' :
            d > 5 ? '#00CC62' :
                d > 2 ? '#00A48D' :
                    d > 1 ? '#007F92' :
                        d > 0.5 ? '#00567A' :
                            d > 0.00001 ? '#003E5F' :
                                d > -20 ? '#151B28' :
                                    d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (dataType == 'threatened_species') {
        return d > 1000 ? '#FF0000' :
            d > 500 ? '#D32B00' :
                d > 200 ? '#8F6F00' :
                    d > 100 ? '#639B00' :
                        d > 50 ? '#3EC000' :
                            d > 20 ? '#25D900' :
                                d > 0.01 ? '#00ff00' :
                                    d = 0 ? '#DCDCDC' : '#DCDCDC';
    }
}

function style() {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7,
        fillColor: getColorData(0, 'pop_density')
    };
}

//
//la partie surlignage c'est beau quand on passe dessus + zoom&details
//
function highlightFeature(e) {
    const layer = e.target;

    layer.bringToFront();

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    info.update();
}

function zoomToFeature(e) {
    const country = e.target;
    //on zoom
    map.fitBounds(country.getBounds());
}

function DetailsOfFeature(e) {
    const country = e.target;
    // on recupère les details en appelant l'API
    let data = checkAPIData(country.feature.properties.ISO_A2);
    let capital = data.then(function (result) {
        // On ajoute les details et on update avec les details du pays appuyer
        details.addTo(map);
        details.update(result.name,
            result.capital,
            result.currency,
            result.surface_area,
            result.population,
            result.pop_density,
            result.pop_growth,
            result.fertility,
            result.post_secondary_enrollment_male,
            result.post_secondary_enrollment_female,
            result.life_expectancy_male,
            result.life_expectancy_female,
            result.gdp,
            result.gdp_per_capita,
            result.gdp_growth,
            result.homicide_rate,
            result.threatened_species,
            result.internet_users,
            result.unemployment);
    });
    setTimeout(function () { })
}
function zoomAndDetailsFeature(e) {
    zoomToFeature(e);
    DetailsOfFeature(e);

}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomAndDetailsFeature
    });
}

var layers = [];
map.eachLayer(function (layer) {
    layers.push(layer);
}
);


//
// Les info basics en haut à droite
//
const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    const contents = props ? `<b>${props.ADMIN}</b><br />${props.ISO_A2}` : 'Hover over a country and click for more details';
    this._div.innerHTML = `<h4>Country</h4>${contents}`;
};

info.addTo(map);


//
// Detail session !! On y croit c'est du beau code
//
const details = L.control();

details.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

details.update = function (name,
    capital,
    currency,
    surface_area,
    population,
    pop_density,
    pop_growth,
    fertility,
    post_secondary_enrollment_male,
    post_secondary_enrollment_female,
    life_expectancy_male,
    life_expectancy_female,
    gdp,
    gdp_per_capita,
    gdp_growth,
    homicide_rate,
    threatened_species,
    internet_users,
    unemployment
) {
    surface_area = betterNumber(surface_area);
    population = betterNumber(population);
    gdp = betterNumber(gdp);
    const contents = name ? `Capital : ${capital}<br />
								Currency : ${currency}</b><br />
								Surface Area : ${surface_area} km²</b><br />
								<b>Population</b><br />
								Population : ${population} 000 people</b><br />
								Population density : ${pop_density} p/km²</b><br />
								Population growth : ${pop_growth}%</b><br />
								Fertility : ${fertility} child/woman</b><br />
								<b>Education</b><br />
								Post secondary school male : ${post_secondary_enrollment_male}%</b><br />
								Post secondary school female : ${post_secondary_enrollment_female}%</b><br />
								<b>Economy</b><br />
								GDP : ${gdp}k$</b><br />
								GDP per capita : ${gdp_per_capita} $/capita</b><br />
								GDP growth : ${gdp_growth} %</b><br />
								Unemployment : ${unemployment}%<br />
								<b>Divers</b><br />
								Homicide rate : ${homicide_rate} hom/100kpop</b><br />
								Threatened Species : ${threatened_species}</b><br />
								Internet users : ${internet_users}%</b><br />` : 'No data';
    this._div.innerHTML = `<h4>Details of ${name}</h4>${contents}`;
};



//
// ajout de la legende (a travailler)
//

const legend = L.control({ position: 'bottomleft' });

legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend');
    const grades = [];
    const labels = [];
    let from, to;

    for (let i = -1; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(`<i style="background:${getColorData(from + 1, "pop_density")}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(map);

function addLegend(dataType) {

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [];
        const labels = [];
        if (dataType == 'pop_density') {
            grades.push(0, 10, 20, 50, 100, 200, 500, 1000);
            labels.push(`Population density (people/km²)`);
        } else if (dataType == 'internet_users') {
            grades.push(0, 15, 30, 45, 60, 75, 90);
            labels.push(`Internet Users (%)`);
        } else if (dataType == 'homicide_rate') {
            grades.push(0, 0.5, 1, 2, 5, 10, 20, 30)
            labels.push(`Homicide rate (homicide for 100k people)`)
        } else if (dataType == 'gdp_growth') {
            grades.push(-20, 0, 0.5, 1, 2, 5, 10)
            labels.push(`GDP growth (%)`)
        } else if (dataType == 'threatened_species') {
            grades.push(0, 20, 50, 100, 200, 500, 1000)
            labels.push(`Threatened sepecies (number of species))`)
        }
        let from, to;
        for (let i = -1; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(`<i style="background:${getColorData(from + 0.1, dataType)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}

function addLegendInternetUsers() {

    legend.onAdd = function (map) {

        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 15, 30, 45, 60, 75, 90];
        const labels = [];
        let from, to;
        labels.push(`Internet users (%)`);
        for (let i = -1; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(`<i style="background:${getColorInternetUser(from + 1)}"></i> ${from}${to ? `&ndash;${to}` : '+'}`);
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

}


//
//recuperation des donné via l'API
//
const checkAPIData = async (countryName, callback) => {
    //la clé recupere via mon compte de api_ninja
    let myKey = '4bDlM4D9VLAVa7AQWh2X3Rt2hvZu3aJ5l3uBIsQU'
    let options = {
        method: 'GET',
        headers: { 'x-api-key': myKey }
    }

    let url = 'https://api.api-ninjas.com/v1/country?name=' + countryName

    let APIdata = await fetch(url, options)
        .then(res => res.json()) // parse response as JSON
        .then(data => {

            const country = new Country(data[0].name,
                data[0].iso2,
                data[0].capital,
                data[0].currency.name,
                data[0].surface_area,
                data[0].population,
                data[0].pop_density,
                data[0].pop_growth,
                data[0].fertility,
                data[0].post_secondary_enrollment_male,
                data[0].post_secondary_enrollment_female,
                data[0].life_expectancy_male,
                data[0].life_expectancy_female,
                data[0].gdp,
                data[0].gdp_per_capita,
                data[0].gdp_growth,
                data[0].homicide_rate,
                data[0].threatened_species,
                data[0].internet_users,
                data[0].unemployment
            );
            return country;
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
    return APIdata;
}

//
// Récuperation de tout les données
//

let downladedCountries = 0;

const load = L.control({ position: 'topleft' });

load.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
load.update = function (dw_countries) {
    const contents = dw_countries ? `Countries/Territories downloaded : ${dw_countries}/255<br />` : `Click on : Load all Data`;
    this._div.innerHTML = `<h4>Data Countries</h4>${contents}`
}

load.addTo(map);

function allDataAPI() {
    let nbCountries = countries.features.length;
    console.log(nbCountries);
    for (let i = 0; i < nbCountries; i++) {
        let data = checkAPIData(countries.features[i].properties.ISO_A2);
        let dataClass = data.then(function (result) {
            if (result) {
                detailsCountries[i] = result;
            }
            else {
                detailsCountries[i] = 0;
            }
            downladedCountries = downladedCountries + 1;
            load.update(downladedCountries);
            console.log(downladedCountries + '/' + nbCountries);
            if (downladedCountries > nbCountries - 10) {
                var compare = document.getElementById("compare1");
                compare.style.visibility = "visible";
                compare = document.getElementById("compare2");
                compare.style.visibility = "visible";
                compare = document.getElementById("compare3");
                compare.style.visibility = "visible";
                compare = document.getElementById("compare4");
                compare.style.visibility = "visible";
                compare = document.getElementById("compare5");
                compare.style.visibility = "visible";
            }
        });


    };
}

function setData(dataType) {
    addLegend(dataType);
    for (let i = 3; i < layers.length; i++) {
        const even = (element) => element.iso2 == layers[i].feature.properties.ISO_A2;
        if (detailsCountries.some(even)) {
            let found = detailsCountries.find(element => element.iso2 == layers[i].feature.properties.ISO_A2);
            if (dataType == 'pop_density') {
                layers[i].setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: getColorData(found.pop_density, dataType)
                })
            } else if (dataType == 'internet_users') {
                layers[i].setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: getColorData(found.internet_users, dataType)
                })
            } else if (dataType == 'homicide_rate') {
                layers[i].setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: getColorData(found.homicide_rate, dataType)
                })
            } else if (dataType == 'gdp_growth') {
                layers[i].setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: getColorData(found.gdp_growth, dataType)
                })
            } else if (dataType == 'threatened_species') {
                layers[i].setStyle({
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: getColorData(found.threatened_species, dataType)
                })
            }
        }

    };
}

function betterNumber(number) {
    var stringNumber = '' + number;
    let len = stringNumber.length;
    let nbSpace = Math.floor(len / 3);
    for (let i = 1; i <= nbSpace; i++) {
        stringNumber = stringNumber.slice(0, len - 3 * i) + " " + stringNumber.slice(len - 3 * i, len - 1 + i)
    }
    return stringNumber;

}

function test() {
    console.log("hola =" + detailsCountries[2].name)
}