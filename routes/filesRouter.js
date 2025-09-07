const { Router } = require("express")
const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const filesRouter = Router();
const filesController = require("../controllers/filesController")

// create a file without parent folder
filesRouter.post('/new-file', upload.single('new-file'), filesController.createFile )

filesRouter.post('/:folderid/new-file', upload.single('new-file'), filesController.createFileToFolder)

filesRouter.get('/:fileid', filesController.viewFileDetails )

filesRouter.get('/download/:fileid', filesController.downlaodFile )

filesRouter.get('/delete/:fileid', filesController.deleteFile )

module.exports = filesRouter;