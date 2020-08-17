'use strict';

function getResults(county) {
  const url = `https://api.ebird.org/v2/data/obs/US-OR-${county}/recent/?maxResults=20`;
  console.log(url)

  fetch(url, {
    headers: {
      'X-eBirdApiToken': 'qkif81vn8bji'
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => 
      findData(responseJson))
    .catch(err => {
      console.log(err.message)
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function findData(responseJson, countyName){
  for (let i = 0; i < responseJson.length; i++) {
    let birdSearch = responseJson[i].comName;
    birdSearch = birdSearch.replace(/[^a-zA-Z ]/g, "");
    birdSearch = encodeURIComponent(birdSearch.trim());
    const urls = [
      `https://freesound.org/apiv2/search/text/?query=${birdSearch}%20bird&fields=name,previews&token=YELG5NEx2kxbdqcv0DxxOq74XLrco0UtF9m5mzYH`,
      `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=417cf3b30db7ab7da2e49b9d14490bd0&format=json&nojsoncallback=1&text=${birdSearch}%20wildlife&content_type=1&extras=url_o&per_page=5`
    ]
    Promise.all(urls.map(url => fetch(url))).then(function (responses) {
      // Get a JSON object from each of the responses
      return Promise.all(responses.map(function (response) {
        return response.json();
      }));
    }).then(function (data) {
      // console.log(data[0].results[0]);
      // console.log(data[1].photos.photo[0]);
      let birdLocation = "";
      if (responseJson[i].locationPrivate === true) {
        birdLocation = "Private location"
      } else {birdLocation = responseJson[i].locName}
        $('#results-list').append(
          `<li>
          <h3>${responseJson[i].comName} <i>(${responseJson[i].sciName})</i></h3>
          <div class='group'>
          <div class='item'>
          <img class='bird-img' src="https://farm${data[1].photos.photo[0].farm}.staticflickr.com/${data[1].photos.photo[0].server}/${data[1].photos.photo[0].id}_${data[1].photos.photo[0].secret}.jpg">
          </div>
          <div class='item-double'>
          <p>Learn more about the ${responseJson[i].comName} <a href="https://ebird.org/species/${responseJson[i].speciesCode}" target="_blank">here</a>.<br>
          Spotted at: ${birdLocation}</p>
          <p>Listen here:</p>
          <audio controls src="${data[0].results[0].previews["preview-hq-mp3"]}"> Your browser does not support the <code>audio</code> element.</audio>
          </div>
          </div>
          </li>`)
          $('#results').removeClass('hidden');
          $('#county-name').removeClass('hidden');
    })
    .catch(function (error) {
      // if there's an error, log it
      console.log(error);
    });
    }
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    $('#county-name').addClass('hidden');
    $('#results-list').empty();
    $('#js-error-message').empty();
    const county = $('#js-county').val();
    if (county === null) {
      $('#js-error-message').text("Please select a county!");
      document.getElementById('form').reset();
    }
    const countyName = $('#js-county option:selected').text();
    const recentlySpotted = `<h3>Recently spotted in ${countyName} county:</h3>`;
    $('div.js-recently-spotted').html(`<h3>Recently spotted in ${countyName} county:</h3>`);
    getResults(county);
  });
}

$(watchForm);

