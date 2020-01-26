async ({ $axios, $log, actorName, $createImage }) => {

  $log(`Scraping ThePornDB for ${actorName}...`)

  $log('Searching ThePornDB for ' + actorName)
  $log('https://master.metadataapi.net/api/performers?q=' + actorName)

  const results = await $axios.get('https://master.metadataapi.net/api/performers?q=' + encodeURIComponent(actorName))

  if (results.data.data.length === 0) {
    $log('No results found')
    return {}
  }

  if (results.data.data.length > 1) {
    $log('Too many results found')
    return {}
  }

  const performerResults = await $axios.get('https://master.metadataapi.net/api/performers/' + results.data.data[0].id)
  const performer = performerResults.data.data
  $log('Found results for ' + performer.id)

  let thumbnailFile;

  if(performer.image){
    thumbnailFile = await $createImage(performer.image, performer.id)
  }

  return {
    thumbnail: thumbnailFile,
    name: performer.name,
    bornOn: performer.extras.birthday_timestamp * 1000,
    aliases: performer.aliases,
    custom: performer.extras
  }
}
