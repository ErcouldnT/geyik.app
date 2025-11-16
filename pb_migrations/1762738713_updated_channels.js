/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2605467279",
    "hidden": false,
    "id": "relation3674349206",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "messages",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3009067695")

  // remove field
  collection.fields.removeById("relation3674349206")

  return app.save(collection)
})
