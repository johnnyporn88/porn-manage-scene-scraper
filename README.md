# porn-manage-scene-scraper

* Download the script and place it in scrapers
* Modify config.json
```
 "PLUGINS": {
  "theporndb-scene": {
   "path": "./scrapers/theporndb-scene.js"
  },
  "theporndb-actor": {
   "path": "./scrapers/theporndb-actor.js"
  }
 },
  "PLUGIN_EVENTS": {
  "actorCreated": [
      "theporndb-actor"
  ],
  "sceneCreated": [
   "theporndb-scene"
  ]
 },
 ```
