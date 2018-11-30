require('request')
const request = require('request-promise-native')
const Select = require('x-ray-select')

// just googled
const buildUrl = require('build-url')
const Joi = require('joi');

/*
1) Make getData function accept radius, zip, make and year from the search profile. Mimic real person as close as possible. I.e. do not put attribute to query string if it does not happen in normal usage on the web site;
2) Extend getData to return location of seller, price (as number of dollars without cents), model year of the car, image url, advert details url, unique id;
3) Do not return adverts that miss some of the fields;
4) Cleanup trailing spaces or other insignificant symbols.
*/

function validateProfile(profile) {

  const schema = Joi.object().keys({
    radius: Joi.number().integer().min(0),
    zip: Joi.string().regex(/(\d{5}([\-]\d{4})?)/),
    make: Joi.string(),
    year:{
      min: Joi.number().integer().min(1900).max(2018),
      max: Joi.number().integer().min(1900).max(2018)
    }
  })

  return Joi.validate(profile, schema);
}

function constructQuery(baseURI, path, profile) {
  const url = buildUrl(baseURI, {
    path: path,
    queryParams: {
      search_distance: profile.radius,
      postal: profile.zip,
      auto_make_model: profile.make,
      min_auto_year: profile.year.min,
      max_auto_year: profile.year.max
      }
  });
  return url
}

function getData(profile) {

  validationResult = validateProfile(profile)
  if ( validationResult.err ) {
    console.log(validationResult.err)
    return 1
  }

  const baseURI = 'https://orangecounty.craigslist.org'
  const path = 'search/cto'

  const queryString = constructQuery(baseURI, path, profile)

  const spec = [{
    $root: '.result-row',
    title: '.result-title',
    meta: {
      $root: '.result-meta',
      price: '.result-price',
      hood: '.result-hood',
      tags: '.result-tags'
    },
    date: '.result-date@datetime',
    hardLink: '.result-title@href',
    id: '.result-title@data-id',
    image: '.swipe-wrap div img@src'
  }]

  return new Promise(function(resolve, reject) {
    request(queryString)
      .then(function (body) {
        var select = Select(body);
        var arr = select(spec);
        console.log(arr);
      })
      .catch(function (err) {
        console.log(arr);
      });
  });


}

const profile = {
  zip: '92663',
  make: 'BMW',
  radius: 10,
  year: {min: 2010, max: 2015}
}

let result = getData(profile)
console.log(result)