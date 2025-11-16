/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3738798621")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "bool733659723",
    "name": "isLocked",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3738798621")

  // remove field
  collection.fields.removeById("bool733659723")

  return app.save(collection)
})
