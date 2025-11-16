/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3738798621")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id = owner.id",
    "listRule": "",
    "updateRule": "@request.auth.id = owner.id",
    "viewRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3738798621")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
