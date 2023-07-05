const load_countries = [];

const country_select = [];
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
function getColorData(d, data_type) {
    if (data_type == "pop_density") {
        return d > 1000 ? '#800026' :
            d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
            d > 100 ? '#FC4E2A' :
            d > 50 ? '#FD8D3C' :
            d > 20 ? '#FEB24C' :
            d > 10 ? '#FED976' :
            d > 0.01 ? '#FFEDA0' :
            d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (data_type == "internet_users") {
        return d > 90 ? '#8B008B' :
            d > 75 ? '#8C349F' :
            d > 60 ? '#904CB2' :
            d > 45 ? '#9566C6' :
            d > 30 ? '#9678D2' :
            d > 15 ? '#9D90E2' :
            d > 0.01 ? '#A5A3EE' :
            d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (data_type == 'homicide_rate') {
        return d > 30 ? '#6b2d04' :
            d > 20 ? '#834427' :
            d > 10 ? '#995C50' :
            d > 5 ? '#AF7579' :
            d > 2 ? '#C38A9C' :
            d > 1 ? '#D9A2C5' :
            d > 0.5 ? '#D9BAF6' :
            d > 0.01 ? '#f4e2f5' :
            d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if (data_type == 'gdp_growth') {
        return d > 10 ? '#69EB12' :
            d > 5 ? '#00CC62' :
            d > 2 ? '#00A48D' :
            d > 1 ? '#007F92' :
            d > 0.5 ? '#00567A' :
            d > 0 ? '#003E5F' :
            d > -20 ? '#151B28' : '#DCDCDC';
    } else if (data_type == 'threatened_species') {
        return d > 1000 ? '#FF0000' :
            d > 500 ? '#D32B00' :
            d > 200 ? '#8F6F00' :
            d > 100 ? '#639B00' :
            d > 50 ? '#3EC000' :
            d > 20 ? '#25D900' :
            d > 0.01 ? '#00ff00' :
            d = 0 ? '#DCDCDC' : '#DCDCDC';
    } else if(data_type == 'life_expectancy'){
        return d > 80 ? '#10d147' :
            d > 75 ? '#1d9840' :
            d > 70 ? '#16724B' :
            d > 65 ? '#305774' :
            d > 60 ? '#4A3C9D' :
            d > 55 ? '#780DE5' :
            d > 50 ? '#ba6bff' : '#DCDCDC';
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
//la partie surlignage c'est beau quand on passe dessus + on met à jour les info si detailsCOuntry>254 + la partie  on clique :zoom&details
//
function highlightFeature(e) {
    const layer = e.target;
    if(layer != country_select[0]){
	    layer.setStyle({
		    weight: 5,
		    color: '#666',
		    dashArray: '',
		    fillOpacity: 0.7
	    });
    }
    layer.bringToFront();
    const dw_countries=load_countries.length;
    if(dw_countries>254){
        let found = load_countries.find(element => element.iso2 == layer.feature.properties.ISO_A2);
        info.update(layer.feature.properties,found.name,
            found.capital,
            found.currency,
            found.currencyCode,
            found.currencyConvert,
            found.surface_area,
            found.population,
            found.pop_density,
            found.pop_growth,
            found.fertility,
            found.post_secondary_enrollment_male,
            found.post_secondary_enrollment_female,
            found.life_expectancy_male,
            found.life_expectancy_female,
            found.gdp,
            found.gdp_per_capita,
            found.gdp_growth,
            found.homicide_rate,
            found.threatened_species,
            found.internet_users,
            found.unemployment);
    }else{
        info.update(layer.feature.properties);
    }   
}

function resetHighlight(e) {
    const layer = e.target;
    if(layer != country_select[0]){
        layer.setStyle({
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
        });
    }
    if(country_select[0]){
        country_select[0].setStyle({
            weight: 5,
            opacity: 2,
            color: 'black',
            fillOpacity: 0.7
        });
    }
    info.update();
}

function zoomToFeature(e) {
    const country = e.target;
    //on zoom
    map.fitBounds(country.getBounds());
}

function DetailsOfFeature(e) {
    const country = e.target;
    country_select[1] = country_select[0];
    country_select[0] = country;
    country_select[0].setStyle({
        weight: 5,
        opacity: 2,
		color: '#111',
		fillOpacity: 0.7
    });
    if(country_select[1]){
        country_select[1].setStyle({
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7,
        })
    }
    // on recupère les details en appelant l'API
    let data = checkAPIData(country.feature.properties.ISO_A2);
    let capital = data.then(function (result) {
        // On ajoute les details et on update avec les details du pays appuyer
        details.update(result.name,
            result.capital,
            result.currency,
            result.currencyCode,
            result.currencyConvert,
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
                        currencyCode,
                        currencyConvert,
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
                        unemployment) {
    surface_area = betterNumber(surface_area);
    population = betterNumber(population);
    gdp = betterNumber(gdp);
    const contents = name ? `Capital : ${capital}<br />
								Currency : ${currency} (${currencyCode} = ${currencyConvert}$USD)<br />
								Surface Area : ${surface_area} km²<br />
								<b>Population</b><br />
								Population : ${population} 000 people<br />
								Population density : ${pop_density} p/km²<br />
								Population growth : ${pop_growth}%<br />
                                Life expectancy male : ${life_expectancy_male} years<br />
                                Life expectancy female : ${life_expectancy_female} years<br />
								Fertility : ${fertility} child/woman<br />
								<b>Education</b><br />
								Post secondary school male : ${post_secondary_enrollment_male}%<br />
								Post secondary school female : ${post_secondary_enrollment_female}%<br />
								<b>Economy</b><br />
								GDP : ${gdp}k$<br />
								GDP per capita : ${gdp_per_capita} $/capita</b><br />
								GDP growth : ${gdp_growth}%<br />
								Unemployment : ${unemployment}%<br />
								<b>Divers</b><br />
								Homicide rate : ${homicide_rate} hom/100kpop<br />
								Threatened Species : ${threatened_species}<br />
								Internet users : ${internet_users}%<br />` : 'Click on a country for save data here';
    this._div.innerHTML = `<h4>Details of ${name}</h4>${contents}`;
};

details.addTo(map);

//
// Les info basics en haut à droite
//
const info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props, name,
                    capital,
                    currency,
                    currencyCode,
                    currencyConvert,
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
                    unemployment){
    const dw_countries=load_countries.length;
    let compare_pop = compare(population, 'population')
    let compare_sur = compare(surface_area,'surface_area')
    let compare_gdp = compare(gdp,'gdp');
    let compare_pod = compare(pop_density, 'pop_density')
    let compare_pog = compare(pop_growth, 'pop_growth')
    let compare_lem = compare(life_expectancy_male, 'life_expectancy_male')
    let compare_lef = compare(life_expectancy_female, 'life_expectancy_female')
    let compare_fer = compare(fertility, 'fertility')
    let compare_psm = compare(post_secondary_enrollment_male, 'post_secondary_enrollment_male')
    let compare_psf = compare(post_secondary_enrollment_female, 'post_secondary_enrollment_female')
    let compare_gpc = compare(gdp_per_capita, 'gdp_per_capita')
    let compare_gdg = compare(gdp_growth, 'gdp_growth')
    let compare_unp = compare(unemployment, 'unemployment')
    let compare_hmr = compare(homicide_rate, 'homicide_rate')
    let compare_ths = compare(threatened_species, 'threatened_species')
    let compare_inu = compare(internet_users, 'internet_users')
    surface_area = betterNumber(surface_area);
    population = betterNumber(population);
    gdp = betterNumber(gdp);
    if(dw_countries>254){
        const contents = name ? `Capital : ${capital}<br />
                                Currency : ${currency} (${currencyCode} = ${currencyConvert}$USD)<br />
                                Surface Area : ${surface_area} km² ${compare_sur}<br />
                                <b>Population</b><br />
                                Population : ${population} 000 people ${compare_pop}<br />
                                Population density : ${pop_density} p/km² ${compare_pod}<br />
                                Population growth : ${pop_growth}% ${compare_pog}<br />
                                Life expectancy male : ${life_expectancy_male} years ${compare_lem}<br />
                                Life expectancy female : ${life_expectancy_female} years ${compare_lef}<br />
                                Fertility : ${fertility} child/woman ${compare_fer}<br />
                                <b>Education</b><br />
                                Post secondary school male : ${post_secondary_enrollment_male}% ${compare_psm}<br />
                                Post secondary school female : ${post_secondary_enrollment_female}% ${compare_psf}<br />
                                <b>Economy</b><br />
                                GDP : ${gdp}k$ ${compare_gdp}<br />
                                GDP per capita : ${gdp_per_capita} $/capita ${compare_gpc}<br />
                                GDP growth : ${gdp_growth}% ${compare_gdg}<br />
                                Unemployment : ${unemployment}% ${compare_unp}<br />
                                <b>Divers</b><br />
                                Homicide rate : ${homicide_rate} hom/100kpop ${compare_hmr}<br />
                                Threatened Species : ${threatened_species} ${compare_ths}<br />
                                Internet users : ${internet_users}% ${compare_inu}<br />` : 'No data';
        this._div.innerHTML = `<h4>${name}</h4>${contents}`;
    } else {
        const contents = props ? `<b>${props.ADMIN}</b><br />${props.ISO_A2}` : 'No country';
        this._div.innerHTML = `<h4>Country</h4>${contents}`;
    }
};

info.addTo(map);

//
// Ajout d'un legende en fonction du data_type
//
const legend = L.control({ position: 'bottomleft' });

function addLegend(data_type) {
    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [];
        const labels = [];
        if (data_type == 'pop_density') {
            grades.push(0, 10, 20, 50, 100, 200, 500, 1000);
            labels.push(`Population density (people/km²)`);
        } else if (data_type == 'internet_users') {
            grades.push(0, 15, 30, 45, 60, 75, 90);
            labels.push(`Internet Users (%)`);
        } else if (data_type == 'homicide_rate') {
            grades.push(0, 0.5, 1, 2, 5, 10, 20, 30)
            labels.push(`Homicide rate (homicide for 100k people)`)
        } else if (data_type == 'gdp_growth') {
            grades.push(-20, 0, 0.5, 1, 2, 5, 10)
            labels.push(`GDP growth (%)`)
        } else if (data_type == 'threatened_species') {
            grades.push(0, 20, 50, 100, 200, 500, 1000)
            labels.push(`Threatened sepecies (number of species)`)
        } else if (data_type == "life_expectancy"){
            grades.push(50, 55, 60, 65, 70, 75, 80)
            labels.push(`Life expectancy (years)`)
        }
        let from, to;
        for (let i = -1; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];
            labels.push(`<i style="background:${getColorData(from + 0.1, data_type)}"></i> ${from}${from==undefined ? `` : to != undefined ? `&ndash;${to}` : '+'}`);
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(map);
}

//
//recuperation des données via l'API
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
        .then(res => res.json()) 
        .then(data => {
            const country = new Country(data[0].name,
                data[0].iso2,
                data[0].capital,
                data[0].currency.name,
                data[0].currency.code,
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
    if(APIdata && APIdata.currencyCode != 'MRU' && APIdata.currencyCode !='VEF' && APIdata.currencyCode !='SSP' && APIdata.currencyCode !='STN'){
        let url2 = 'https://api.api-ninjas.com/v1/convertcurrency?want=USD&have='+APIdata.currencyCode+'&amount=1000'
        let APIdata2 = await fetch(url2, options)
            .then(res => res.json()) 
            .then(data => {
                const  currencyConvert = data.new_amount
                return currencyConvert;
            })
            .catch(err => {
                console.log(`error ${err}`)
                });
        APIdata.currencyConvert = (APIdata2/1000).toPrecision(4)
    }
    

    return APIdata;
}

//
//recuperation des données via l'API
//


//
// Fenetre decompte des pays telechargé
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

//
// Récuperation de tout les données
//
function allDataAPI() {
    let nbCountries = countries.features.length;
    for (let i = 0; i < nbCountries; i++) {
        console.log(countries.features[i].properties.ISO_A2)
        let data = checkAPIData(countries.features[i].properties.ISO_A2);
        let dataClass = data.then(function (result) {
            if (result) {
                load_countries[i] = result;
            }
            else {
                load_countries[i] = 0;
            }
            downladedCountries = downladedCountries + 1;
            load.update(downladedCountries);
            if (downladedCountries > nbCountries - 10) {
                var compare = document.getElementById("button_life_expectancy");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_homicide_rate");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_threatened_species");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_gdp_growth");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_pop_density");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_internet_user");
                compare.style.visibility = "visible";
                compare = document.getElementById("button_load_data");
                compare.style.visibility = "hidden"
            }
        });
    };
}

//
// met en place la couleur sur tout les pays en fonction du data_type
//

var layers = [];
map.eachLayer(function (layer) {
    layers.push(layer);
});

function setData(data_type) {
    addLegend(data_type);
    for (let i = 3; i < layers.length; i++) {
        const even = (element) => element.iso2 == layers[i].feature.properties.ISO_A2;
        if (load_countries.some(even)) {
            let found = load_countries.find(element => element.iso2 == layers[i].feature.properties.ISO_A2);
            if (data_type == 'pop_density') {
                layers[i].setStyle({
                    fillColor: getColorData(found.pop_density, data_type)
                })
            } else if (data_type == 'internet_users') {
                layers[i].setStyle({
                    fillColor: getColorData(found.internet_users, data_type)
                })
            } else if (data_type == 'homicide_rate') {
                layers[i].setStyle({
                    fillColor: getColorData(found.homicide_rate, data_type)
                })
            } else if (data_type == 'gdp_growth') {
                layers[i].setStyle({
                    fillColor: getColorData(found.gdp_growth, data_type)
                })
            } else if (data_type == 'threatened_species') {
                layers[i].setStyle({
                    fillColor: getColorData(found.threatened_species, data_type)
                })
            } else if (data_type == 'life_expectancy') {
                let life_expectancy = (found.life_expectancy_female + found.life_expectancy_male)/2;
                layers[i].setStyle({
                    fillColor: getColorData(life_expectancy, data_type)
                })
            }
        }
    };
}

//
// Change les nombres en des nombres plus visible (ex: 1234567890 => 1 234 567 890)
//
function betterNumber(number) {
    var stringNumber = '' + number;
    let len = stringNumber.length;
    let nbSpace = Math.floor(len / 3);
    for (let i = 1; i <= nbSpace; i++) {
        stringNumber = stringNumber.slice(0, len - 3 * i) + " " + stringNumber.slice(len - 3 * i, len - 1 + i)
    }
    return stringNumber;
}

//
// compare_symb : compare valeur et valeur_select et en fonction de l'écart retourn un symb de couleur
//
function compareSymb(valeur, valeur_select){
    if(valeur > 2*valeur_select){
        return '<b><a style="color:green">++</a></b>';
    } else if(valeur > 1.10*valeur_select){
        return '<b><a style="color:green">+</a></b>';
    } else if(valeur > valeur_select*0.90 ){
        return '<b><a style="color:brown">=</a></b>';
    } else if(valeur >= valeur_select*0.50 ){
        return '<b><a style="color:red">-</a></b>';
    } else if(valeur < valeur_select*0.50 ){
        return '<b><a style="color:red">--</a></b>';
    }
    return 'err'
}
//
// compare : recupère la valeur d'un data_type et le nom du data_type et le compare avec le pays Selection et retourne un symb de couleur
//
function compare(data_type_valeur,data_type){
    let symb = '';
    if(country_select[0]){
        if(load_countries[1]){
            let found = load_countries.find(element => element.iso2 == country_select[0].feature.properties.ISO_A2);
            if(country_select[0]){
                if(data_type == 'population'){
                    symb = compareSymb(data_type_valeur, found.population)
                }
                if(data_type == 'surface_area'){
                    symb = compareSymb(data_type_valeur, found.surface_area)
                }
                if(data_type == 'pop_growth'){
                    symb = compareSymb(data_type_valeur, found.pop_growth)
                }
                if(data_type == 'pop_density'){
                    symb = compareSymb(data_type_valeur, found.pop_density)
                }
                if(data_type == 'fertility'){
                    symb = compareSymb(data_type_valeur, found.fertility)
                }
                if(data_type == 'currency'){
                    symb = compareSymb(data_type_valeur, found.currency)
                }
                if(data_type == 'post_secondary_enrollment_male'){
                    symb = compareSymb(data_type_valeur, found.post_secondary_enrollment_male)
                }
                if(data_type == 'post_secondary_enrollment_female'){
                    symb = compareSymb(data_type_valeur, found.post_secondary_enrollment_female)
                }
                if(data_type == 'life_expectancy_male'){
                    symb = compareSymb(data_type_valeur, found.life_expectancy_male)
                }
                if(data_type == 'life_expectancy_female'){
                    symb = compareSymb(data_type_valeur, found.life_expectancy_female)
                }
                if(data_type == 'gdp'){
                    symb = compareSymb(data_type_valeur, found.gdp)
                }
                if(data_type == 'gdp_per_capita'){
                    symb = compareSymb(data_type_valeur, found.gdp_per_capita)
                }
                if(data_type == 'gdp_growth'){
                    symb = compareSymb(data_type_valeur, found.gdp_growth)
                }
                if(data_type == 'homicide_rate'){
                    symb = compareSymb(data_type_valeur, found.homicide_rate)
                }
                if(data_type == 'threatened_species'){
                    symb = compareSymb(data_type_valeur, found.threatened_species)
                }
                if(data_type == 'internet_users'){
                    symb = compareSymb(data_type_valeur, found.internet_users)
                }
                if(data_type == 'unemployment'){
                    symb = compareSymb(data_type_valeur, found.unemployment)
                }
            } 
        }
    }
    return symb;
}