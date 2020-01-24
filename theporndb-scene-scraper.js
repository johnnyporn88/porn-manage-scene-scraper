async ctx => {

  ctx.$log('Searching api for ' + ctx.sceneName)
  ctx.$log('https://master.metadataapi.net/api/scenes?parse=' + ctx.scenePath)

  const results = await ctx.$axios.get('https://master.metadataapi.net/api/scenes?parse=' + ctx.scenePath)

  if (results.data.data.length === 0) {
    ctx.$log('No results found')
    return {}
  }

  if (results.data.data.length > 1) {
    ctx.$log('Too many results found')
    return {}
  }

  const sceneResults = await ctx.$axios.get('https://master.metadataapi.net/api/scenes/' + results.data.data[0].id)
  const scene = sceneResults.data.data;
  ctx.$log('Found results for ' + scene.id)

  return {
    description: scene.description,
    releaseDate: new Date(scene.date).getTime(),
    thumbnail: scene.background.large,
    name: scene.title,
    labels: scene.tags.map(tag => tag.tag),
    performers: scene.performers
  }
}
