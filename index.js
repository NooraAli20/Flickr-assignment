const imgList = document.querySelector('.allImages');
/*const baseUrl = 'https://api.flickr.com/services/rest?method=flickr.photos.search';
const APIkey = 'a498e6e237c5d3a3c29ab672a224df95';
console.log('images')*/



// https://api.flickr.com/services/rest?method=flickr.photos.search//

const APIkey = 'a498e6e237c5d3a3c29ab672a224df95';
var format = '&format=json&nojsoncallback=1'; // default format 
var photos = 0;
const gallery = [];


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
        '&per_page=20', 
        '&safe_search=3',
        '&content_type=1',
        '&page=1'
      ).then((res) => {
          console.log(res.photos);
    
          const photos = res.photos.photo;
    
          photos.map(p => {
              this.photos++;
              const photoRequest = this.apiRequest('flickr.photos.getSizes', `&photo_id=${p.id}`)
              .then(_pictureSizes => {
                //console.log(_pictureSizes);

                var imageUrl = _pictureSizes.sizes.size.filter( (imageSize) => {
                   return imageSize.label === 'Large Square';
                });

                //console.log(imageUrl);
                createAndRenderImageFromFlickr(imageUrl);
              });
          });
      });
  }

  function createAndRenderImageFromFlickr(imageUrl)
  {
      const imageSection = document.querySelector('.allImages');

      const image = document.createElement('img');
      image.setAttribute('src', imageUrl[0].source);

      imageSection.appendChild(image);
  }

  window.addEventListener('load',() => {
    const formToSearch = document.querySelector('#photos_search_form')
    .addEventListener('submit', (e) => {
        e.preventDefault();

        if(photos)
            document.querySelector('.allImages').removeChild(document.querySelectorAll('img'));

        var searchInput = document.querySelector('#query').value;
        if(!searchInput) {
            console.log('No search term provided');
        }else{
            search(searchInput);
        }     
    });
  });