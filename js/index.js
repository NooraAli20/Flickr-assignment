// Flickr personal API Key
const APIkey = 'a498e6e237c5d3a3c29ab672a224df95';

// Flickr format to URL
var format = '&format=json&nojsoncallback=1'; 
var photos = 0;

// Gallery json object - NB. its not it use apparently, but its meant to create a navigation on the model popup
const gallery = [{}];

// Pagnition
var currentPage = 5;

// How many items to show on the page after a search
var numberOfItemsPerPage = 5; // default

// Number of pages returned when Flickr API has been queried
var totalNumberOfPages = 0;

// The items to search with i.e the text
var searchTermGlobal = '';

// Item that helps sort results from the Flickr API
var sortBy = 'date-posted-desc';      // default = date-posted-desc

// To hold an array of what to search for on the Flickr API i.e. ['text', 'tag'],
var searchTermSelections = ['tag'];

/* -------------------  start Pagnition functions ----------------------  */
function nextPage(){
  document.querySelector('.allImages').innerHTML = '';
  currentPage += 1;
  search(document.querySelector('#query').value);
}

function firstPage(){
  document.querySelector('.allImages').innerHTML = '';
  currentPage = 1;
  search(document.querySelector('#query').value);
}

function prevPage(){
  document.querySelector('.allImages').innerHTML = '';
  currentPage -= 1;
  search(document.querySelector('#query').value);
}

function lastPage(){
  document.querySelector('.allImages').innerHTML = '';
  currentPage = totalNumberOfPages;
  search(document.querySelector('#query').value);
}

/* -------------------  end Pagnition functions ----------------------  */


/* This function is called when we want to call any specific flickr API method and its corresponding parameters or query strings */
async function apiRequest(_method, ..._params) 
{
    const params = [];
    params.push(..._params);
    const apiParams = params.join('');
    try {
      const url = `https://api.flickr.com/services/rest/?method=${_method}&api_key=${APIkey}${apiParams}${format}`;
      console.log(url);
      const flickrApi = await fetch(url);

      const data = await flickrApi.json();

      if(data.stat === 'fail') {
        console.log('Ops, something went wrong :(');
      }else{  
        return data;
      }
    } catch (e) {
        return e;
    }
  };

  // In this function, we initiate the search functionality to the Flickr API using the flickr.photos.search method.
  function search(searchTerm)
  {
    // Not that flickr.photos.search always returns back an album of photos, so we are supposed to 
    // loop through the album, photo by photo, with the flickr.photos.getInfo and flickr.photos.getSizes API endpoints
    // to get both information on each and every individual photo thats contained in the album
    apiRequest(
       
        `flickr.photos.search`,
        `&tags=${searchTermSelections.includes('tag') ? searchTerm : ''}`, 
        `&text=${searchTermSelections.includes('text') ? searchTerm : ''}`,
        '&per_page=' + numberOfItemsPerPage, 
        '&safe_search=3',
        '&sort=' + sortBy,
        '&content_type=1',
        '&page=' + currentPage,
        '&extras=[\'url_q\',\'url_m\']'
      ).then((res) => {

          const photos = res.photos.photo;

          document.querySelector('.results').innerHTML = '';
          document.querySelector('.results').innerHTML = "Results returned : " + res.photos.total + "  -  # of pages " + + res.photos.pages;

          totalNumberOfPages = res.photos.pages;
        
          document.querySelector('.pagnition').innerHTML = '';
          document.querySelector('.pagnition').innerHTML = "Displaying page : (" + currentPage + ") of (" + totalNumberOfPages + ")";

          var imageId = 1;

          photos.map(p => {
              this.photos++;

              // Here we call the flickr.photos.getSizes to know about which sizes of a given specific photo does flickr have in its database
              this.apiRequest('flickr.photos.getSizes', `&photo_id=${p.id}`)
              .then(_pictureSizes => {

                // We return back the sizes of both images to display on the page and to display on the model popup
                var imageUrl = _pictureSizes.sizes.size.filter( (imageSize) => {
                   return (imageSize.label === 'Small 400' || imageSize.label === 'Medium');
                });

                // Then here we call the flickr.photos.getInfo to get more information of a specific photo with its photo id. 
                this.apiRequest('flickr.photos.getInfo', `&photo_id=${p.id}`)
                  .then((imageInfoResponse) => {

                    // We build an imageInfo json object that contains all the necessary information that we think we might need to display
                    var imageInfo = { 
                      photoId : p.id,
                      ownerName : imageInfoResponse.photo.owner.username,
                      realName : imageInfoResponse.photo.owner.realname,
                      dateUploaded : imageInfoResponse.photo.dates.posted,
                      dateTaken : imageInfoResponse.photo.dates.taken,
                      title : imageInfoResponse.photo.title._content,
                      description : imageInfoResponse.photo.description._content,
                      views : imageInfoResponse.photo.views === undefined ? "0" : imageInfoResponse.photo.views,
                      favorites: imageInfoResponse.photo.isfavorite === undefined ? "0" : imageInfoResponse.photo.isfavorite,
                      numberOfComments : imageInfoResponse.photo.comments._content,

                      // Not that for tags, we sliced them to only 5 items due to the fact that they are sometimes too too many to display
                      tags : imageInfoResponse.photo.tags.tag.slice(0, 5).map((key, index) => {
                        return key._content
                      })
                    }

                    // This object is going to be used to build a navigation on the model popup
                    gallery.push({
                      "id": imageId,
                      "imageId": p.id,
                      "imageURL" : imageUrl[1].source,
                      "imageInfo" : imageInfo
                    });

                    // we call a custom method to render the image onto the canvas
                    createAndRenderImageFromFlickr(imageUrl, imageInfo);

                    imageId++;
                });
              });
          });
      });
  }

  // Renders a given image to the DOM
  function createAndRenderImageFromFlickr(imageUrl, imageInfo)
  {
      const imageSection = document.querySelector('.allImages');
      let innerhtml = '<section class=\'col s12 m3 l6 center-align missort\'>' + 
                        '<article class=\'card medium\'>' + 
                          '<article class=\'card-image\'>' + 
                            '<img id=' + imageInfo.photoId + ' data-target=modal1 src=' + imageUrl[0].source + ' class=\'responsive-img modal-trigger\' width=400 height=267 />' +
                            '<span class=\'card-title\'>' + 
                              '<span> <i class=\'material-icons md-18 right-align\'>visibility</i> ' + imageInfo.views + '</span>' +
                              '<span> <i class=\'material-icons md-18 right-align\'>favorite</i> ' + imageInfo.favorites  + '</span>' +
                            '</span>' +
                          '</article>' +
                          '<article class=card-content>' +
                            '<h6 class=cardTitle>' + imageInfo.title  + '</h6>' +
                            '<p class=flow-text>Taken by : ' + imageInfo.realName + '</p>' +
                            '<p class=flow-text>Date Taken : ' + imageInfo.dateTaken + '</p>' ;

                            /*  */ 
        imageInfo.tags.forEach(key => {
           innerhtml += '<span class=chip>' + key.slice(0, 10) + '</span>'
        });
                         
        innerhtml += '</article></article></article></section>';

      const image = document.createElement('img');
      image.setAttribute('src', imageUrl[0].source);

      imageSection.innerHTML += innerhtml;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
  // The load event is fired when the whole page has loaded, including all dependent resources such as stylesheets and images. 
  window.addEventListener('load',() => {

    // When the change event of the select itemsPerPage is fired
    document.querySelector('#itemsPerPage').addEventListener('change', (x) => {
      numberOfItemsPerPage = parseInt(document.querySelector('#itemsPerPage').value);
    });

    // WHen the change event of the items to search by is fired
    document.querySelector('#searchBy').addEventListener('change', (x) => {
        searchTermSelections = [];
        var instance = M.FormSelect.getInstance(document.querySelector('#searchBy'));
        searchTermSelections.push(...instance.getSelectedValues());
    });

    // When the onkeyup event is fired on the textbox
    document.querySelector('#query').addEventListener('keyup', (x) => {
      searchTermGlobal = document.querySelector('#query').value;
      console.log(searchTermGlobal);
    });

    document.querySelector('#sortItems').selectedIndex = 0;
    // When the sort items has changed
    document.querySelector('#sortItems').addEventListener('change', (x) => {
      sortBy = document.querySelector('#sortItems').value;
      console.log(sortBy);
    });

    document.querySelector('#photos_search_form')
      .addEventListener('submit', (e) => {
        
        e.preventDefault();

        // If we have returned some photos from the Flickr API, then refresh and reset the .allImages Section in the HMTL
        if(photos)
            document.querySelector('.allImages').innerHTML = '';

        // We grab the search term from the input field of the form
        var searchInput = document.querySelector('#query').value;

        // If we haven't provided a seach term, 
        if(!searchInput) {
            // TODO : Change the console.log into something more user friendly to show the user that they havent provided a search term
            console.log('No search term provided');
        }else{
            search(searchInput);
        }     
    });

  });

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
  // The DOMContentLoaded event fires when the initial HTML document has been completely loaded and parsed, without waiting for stylesheets, 
  // images, and subframes to finish loading.
  document.addEventListener('DOMContentLoaded', function() {

      const options = { onCloseStart: () => {}};
    
      var elems = document.querySelectorAll('select');
      var instances = M.FormSelect.init(elems, options);

      elems = document.querySelectorAll('.modal');
      instances = M.Modal.init(elems, {
        onOpenStart: function(){

            var modelContent = document.querySelector('.emage');
            var emageId = this._openingTrigger.id;
            //console.log(emageId);
            var result = gallery.find(x => {
              return x.imageId == emageId;
            });

            var img = document.createElement('img');
            img.setAttribute('src', result.imageURL);

            modelContent.appendChild(img);
          },
          onCloseEnd: function(){
            var modelContent = document.querySelector('.emage');
            modelContent.innerHTML = '';
          },
          preventScrolling: true,
          opacity : 0.9
        });
});