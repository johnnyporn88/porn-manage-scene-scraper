async ({$log, $axios, sceneName, scenePath, $createImage}) => {

  $log('Searching api for ' + sceneName)
  $log('https://master.metadataapi.net/api/scenes?parse=' + scenePath)

  const results = await $axios.get('https://master.metadataapi.net/api/scenes?parse=' + encodeURIComponent(scenePath))

  if (results.data.data.length === 0) {
    $log('No results found')
    return {}
  }

  if (results.data.data.length > 1) {
    $log('Too many results found')
    return {}
  }

  const sceneResults = await $axios.get('https://master.metadataapi.net/api/scenes/' + results.data.data[0].id)
  const scene = sceneResults.data.data;
  $log('Found results for ' + scene.id)

  const thumbnailFile = await $createImage(scene.background.large, scene.id, true)

  return {
    description: scene.description,
    releaseDate: new Date(scene.date).getTime(),
    thumbnail: thumbnailFile,
    name: scene.title,
    labels: scene.tags.map(tag => tag.tag),
    actors: scene.performers.map(p => p.name),
    studio: scene.site.name
  }
}
