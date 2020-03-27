//Based on plugin scripts from pizzajohnny and ThePornDB.
//Smashed together by john4valor.

//This plugin will populate custom fields (if setup correctly) using metadata from ThePornDB.
//DON'T fuck with anything above line 35.

async ({ $axios, $log, actorName, $createImage }) => {

  $log(`Scraping ThePornDB for ${actorName}...`)

  $log('Searching ThePornDB for ' + actorName)
  $log('https://master.metadataapi.net/api/performers?q=' + actorName)

  const results = await $axios.get('https://metadataapi.net/api/performers?q=' + encodeURIComponent(actorName))

  if (results.data.data.length === 0) {
    $log('No results found')
    return {}
  }

  if (results.data.data.length > 1) {
    $log('Too many results found')
    return {}
  }

  const performerResults = await $axios.get('https://metadataapi.net/api/performers/' + results.data.data[0].id)
  const performer = performerResults.data.data
  $log('Found results for ' + performer.id)

  let thumbnailFile;

  if(performer.image){
    thumbnailFile = await $createImage(performer.image, performer.id)
  }
  
  const tallness = performer.extras.height.split("(")[0].trim(); //extracts imperial height measurements only
  const fatness = performer.extras.weight.split("l")[0].trim(); //extracts imperial weight measurements only
  
  //vital stats extraction
  const bewbs = performer.extras.cupsize.substr(2,1); //extracts cup size letter (e.g., A, B, etc.) from cupsize
  
  //The key value names below (e.g., "Astrology") MUST match the Custom Field names in Porn Manager.
  const customFields = {
    Astrology: performer.extras.astrology, //String field
	Gender: performer.extras.gender, //Single Choice field
	Ethnicity: performer.extras.ethnicity, //Single Choice field
	'Hair Color': performer.extras.hair_colour, //Single Choice field
	Height: tallness, //Number field
	Weight: fatness, //Number field
	Cupsize: bewbs, //Single Choice field
	Measurements: performer.extras.measurements, // String field
	Nationality: performer.extras.nationality, //Single Choice field
	Birthplace: performer.extras.birthplace, //String field
	Started: performer.extras.first_seen, //Number field
	Active: performer.extras.active //Boolean field
 }

  //This section outputs the metadata the plugin received in your Porn Manager terminal.
  //Due to inconsistencies in how ThePornDB stores data (e.g., actress born in the US may be indicated as "US" or "United States"), 
  //you may have to manually finish the input in Porn Manager.
  $log('Name: ' + performer.name)
  $log('DOB: ' + performer.extras.birthday)
  $log(customFields)
  
  return {
    thumbnail: thumbnailFile,
    name: performer.name,
    bornOn: performer.extras.birthday_timestamp * 1000,
    aliases: performer.aliases,
	description: performer.bio, //delete this line if you don't want the bio to also be populated.
	custom: customFields
  }
}
