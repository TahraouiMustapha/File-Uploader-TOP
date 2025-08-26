const { Router } = require('express')
const folderRouter = Router()

const foldersController = require("../controllers/foldersController")

folderRouter.post('/new-folder', foldersController.createFolder )

folderRouter.get('/:folderid', foldersController.appearFolderContent )


module.exports = folderRouter
