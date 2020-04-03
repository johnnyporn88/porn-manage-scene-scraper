//Based on plugin scripts from pizzajohnny and ThePornDB.
//Smashed together by john4valor.

//This plugin will populate custom fields (if setup correctly) using metadata from ThePornDB.
//Additionally, for certain metadata, it'll pull from Freeones instead for consistency.
//DON'T fuck with anything above line 35.

async ({ event, args, $axios, $throw, $cheerio, $log, actorName, $createImage }) => {

  //basic setup check
  if (event != "actorCreated" && event != "actorCustom")
    $throw("Nope. This plugin is only meant for actorCreated or actorCustom events.");

  $log(`Scraping ThePornDB and FreeOnes for ${actorName}...`)

  $log('Searching ThePornDB for ' + actorName)
  $log('https://master.metadataapi.net/api/performers?q=' + actorName)

  const results = await $axios.get('https://master.metadataapi.net/api/performers?q=' + encodeURIComponent(actorName))

  if (results.data.data.length === 0) {
    $log('No results found on ThePornDB')
    return {}
  }

  if (results.data.data.length > 1) {
    $log('Too many results found on ThePornDB')
    return {}
  }

  const performerResults = await $axios.get('https://master.metadataapi.net/api/performers/' + results.data.data[0].id)
  const performer = performerResults.data.data
  $log('Found results for ' + performer.id)

  let thumbnailFile; //COMMENT OR DELETE OUT TO DISABLE PIC DOWNLOAD

  if(performer.image){ //COMMENT OR DELETE OUT TO DISABLE PIC DOWNLOAD
    thumbnailFile = await $createImage(performer.image, performer.id) //COMMENT OR DELETE OUT TO DISABLE PIC DOWNLOAD
  } //COMMENT OR DELETE OUT TO DISABLE PIC DOWNLOAD
  
  //defining FreeOnes URL for scraping
  $log('Searching FreeOnes for ' + actorName)
  const url = `https://freeones.xxx/${actorName.replace(/ /g, "-")}/profile`;
  $log("Getting " + url);
  //getting raw HTML of the URL defined above
  const html = (await $axios.get(url)).data;
  //getting DOM (Document Object Model) of the HTML
  const dom = $cheerio.load(html);
  
  //physical properties extraction. Change 0.033 and 2.2 to 1 if metric is preferred.
  const tallness_act = performer.extras.height.split("c")[0].trim() * 0.033; //extracts metric height measurements, and converts to imperial.
  const fatness_ext = performer.extras.weight.split("k")[0].trim() * 2.2; //extracts metric weight measurements, and converts to imperial.
  const fatness_act = Math.round((fatness_ext + Number.EPSILON) * 100) / 100; //rounding weight value.
  
  const startyr = performer.extras.first_seen.substr(0,4); //removes month, day, and time stamp of career start.
  
  //grabbing city of birth
  const bcity_sel = dom('[data-test="section-personal-information"] a[href*="placeOfBirth"]');
  const bcity_name = bcity_sel.length ? dom(bcity_sel).attr("href").split("=").slice(-1)[0] : null;
  //if no city is found
  if (!bcity_name) {
	  $log('No city data found');
  }

  //grabbing state of birth
  const bstate_sel = dom('[data-test="section-personal-information"] a[href*="province"]');
  const bstate_name = bstate_sel.length ? dom(bstate_sel).attr("href").split("=").slice(-1)[0] : null;
  //if no state is found
  if (!bstate_name) {
	  $log('No state data found');
  }  
  
  const bplace = bcity_name + ', ' + bstate_name;
  
  //grabbing nation of birth
  const bnation_sel = dom('[data-test="section-personal-information"] a[href*="country%5D"]');
  const bnation_name = bnation_sel.length ? dom(bnation_sel).attr("href").split("=").slice(-1)[0] : null;
  //if no state is found
  if (!bnation_name) {
	  $log('No nation data found');
  }
  
  //vital stats extraction
  const chst = performer.extras.measurements.split("-")[0].substr(0,2); //extracts chest measurement
  const cup = performer.extras.measurements.split("-")[0].substr(2); //extracts cup size letter (e.g., A, B, etc.) from cupsize
  const wst = performer.extras.measurements.split("-")[1].substr(0,2); //extracts waist measurement
  const hps = performer.extras.measurements.split("-")[2].substr(0,2); //extracts hip measurement
  
  const astro = performer.extras.astrology.split(" ")[0].trim(); //astrological sign data clean up
  
  //The key value names below (e.g., "Astrology") MUST match the Custom Field names in Porn Manager.
  const customFields = {
    Astrology: astro, //String field
	Gender: performer.extras.gender, //Single Choice field
	Ethnicity: performer.extras.ethnicity, //Single Choice field
	Heritage: performer.extras.nationality, //String field
	'Hair Color': performer.extras.hair_colour, //Single Choice field
	Height: tallness_act, //Number field.
	Weight: fatness_act, //Number field.
	'Chest Size': chst, //Number field
	'Cup Size': cup, //Single Choice field
	'Waist Size': wst, //Number field
	'Hip Size': hps, //Number field
	Nationality: bnation_name, //Single Choice field
	Birthplace: bplace, //String field
	Started: startyr, //Number field
	Active: performer.extras.active //Boolean field
 }

  //This section outputs the metadata the plugin received in your Porn Manager terminal.
  //Due to inconsistencies in how ThePornDB stores data (e.g., actress born in the US may be indicated as "US" or "United States"), 
  //you may have to manually finish the input in Porn Manager.
  $log('Name: ' + performer.name)
  $log('DOB: ' + performer.extras.birthday)
  $log(customFields)
  
  return {
    thumbnail: thumbnailFile, //COMMENT OR DELETE OUT TO DISABLE PIC DOWNLOAD
    name: performer.name,
    bornOn: performer.extras.birthday_timestamp * 1000,
    aliases: performer.aliases,
	description: performer.bio, //delete this line if you don't want the bio to also be populated.
	custom: customFields
  }
}
