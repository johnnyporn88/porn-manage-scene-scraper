# porn-manage-scene-scraper

* Download the script and place it in scrapers
* Modify config.json
```
 "PLUGINS": {
  "theporndb": {
   "path": "./scrapers/theporndb.js"
  }
 },
  "PLUGIN_EVENTS": {
  "actorCreated": [],
  "sceneCreated": [
   "theporndb"
  ]
 },
 ```
