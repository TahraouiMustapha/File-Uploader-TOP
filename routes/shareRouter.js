const { Router } = require('express')

const shareRouter = Router()
const shareController = require('../controllers/shareController')


shareRouter.get('/:shareid/folder/:folderid', shareController.getNestedFolder )
shareRouter.get('/:shareid/file/:fileid', shareController.getSharedFile )

shareRouter.get("/:shareid", shareController.getSharedFolder )

module.exports = shareRouter;