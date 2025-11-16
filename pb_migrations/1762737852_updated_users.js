/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "bool1599779888",
    "name": "isOnline",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2063623452",
    "max": 0,
    "min": 0,
    "name": "status",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("bool1599779888")

  // remove field
  collection.fields.removeById("text2063623452")

  return app.save(collection)
})
