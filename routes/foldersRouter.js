const { Router } = require('express')
const folderRouter = Router()

const foldersController = require("../controllers/foldersController")

folderRouter.post('/new-folder', foldersController.createFolder )

folderRouter.get('/:folderid', foldersController.appearFolderContent )

folderRouter.post('/:folderid/new-folder' , foldersController.createNestedFolder )

folderRouter.get('/delete/:folderid', foldersController.deleteFolder )

module.exports = folderRouter
