const APIkey = 'a498e6e237c5d3a3c29ab672a224df95';
var format = '&format=json&nojsoncallback=1'; 
var photos = 0;
const gallery = [];

// Pagnition
var currentPage = 1;
var numberOfItemsPerPage = 5;
var totalNumberOfPages = 0;

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


async function apiRequest(_method, ..._params) 
{
    const params = [];
    params.push(..._params);
    const apiParams = params.join('');
    try {
      const flickrApi = await fetch(`
      https://api.flickr.com/services/rest/?method=${_method}&api_key=${APIkey}${apiParams}${format}`);

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

  function search(searchTerm)
  {
    apiRequest(
       
        `flickr.photos.search`,
        `&tags=${searchTerm}`, 
        '&per_page=' + numberOfItemsPerPage, 
        '&safe_search=3',
        '&content_type=1',
        '&page=' + currentPage
      ).then((res) => {

          const photos = res.photos.photo;

          document.querySelector('.results').innerHTML = '';
          document.querySelector('.results').innerHTML = "Results returned : " + res.photos.total + "  -  # of pages " + + res.photos.pages;

          totalNumberOfPages = res.photos.pages;
        
          document.querySelector('.pagnition').innerHTML = '';
          document.querySelector('.pagnition').innerHTML = "Displaying page : (" + currentPage + ") of (" + totalNumberOfPages + ")";

          photos.map(p => {
              this.photos++;
              this.apiRequest('flickr.photos.getSizes', `&photo_id=${p.id}`)
              .then(_pictureSizes => {

                var imageUrl = _pictureSizes.sizes.size.filter( (imageSize) => {
                   return imageSize.label === 'Medium';
                });
                  this.apiRequest('flickr.photos.getInfo', `&photo_id=${p.id}`)
                  .then((imageInfoResponse) => {

                    var imageInfo = { 
                      ownerName : imageInfoResponse.photo.owner.username,
                      realName : imageInfoResponse.photo.owner.realname,
                      dateUploaded : imageInfoResponse.photo.dates.posted,
                      dateTaken : imageInfoResponse.photo.dates.taken,
                      title : imageInfoResponse.photo.title._content,
                      description : imageInfoResponse.photo.description._content,
                      views : imageInfoResponse.photo.dates.views,
                      numberOfComments : imageInfoResponse.photo.comments._content,
                      tags : imageInfoResponse.photo.tags.tag.slice(0, 5).map((key, index) => {
                        return key._content
                      })
                    }
                    
                    createAndRenderImageFromFlickr(imageUrl, imageInfo);
                });
              });
          });
      });
  }

  function createAndRenderImageFromFlickr(imageUrl, imageInfo)
  {
      const imageSection = document.querySelector('.allImages');
      let innerhtml = '<section class=\'col s12 m4 l6\'><article class=card>' + 
                          '<article class=card-image>' + 
                            '<img src=' + imageUrl[0].source + '/>' +
                          '</article>' +
                          '<article class=card-content>' +
                            '<p class=blue-text text-darken-2><b>' + imageInfo.title + '</b></p>'+
                            '<p>Taken by : ' + imageInfo.realName + '</p>' +
                            '<p>Date Taken : ' + imageInfo.dateTaken + '</p>' ;

        imageInfo.tags.forEach(key => {
           innerhtml += '<span class=chip>' + key + '</span>'
        });
                            
        innerhtml += '</article></article></article></section>';

      const image = document.createElement('img');
      image.setAttribute('src', imageUrl[0].source);

      imageSection.innerHTML += innerhtml;
  }

  window.addEventListener('load',() => {
    const formToSearch = document.querySelector('#photos_search_form')
    .addEventListener('submit', (e) => {
        e.preventDefault();

        if(photos)
            document.querySelector('.allImages').innerHTML = '';

        var searchInput = document.querySelector('#query').value;
        if(!searchInput) {
            console.log('No search term provided');
        }else{
            search(searchInput);
        }     
    });
  });