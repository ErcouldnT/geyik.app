/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2965180291")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id = receiver.id",
    "updateRule": "@request.auth.id = receiver.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2965180291")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "updateRule": null
  }, collection)

  return app.save(collection)
})
