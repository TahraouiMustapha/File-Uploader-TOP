const { Router } = require('express')

const shareRouter = Router()
const shareController = require('../controllers/shareController')


shareRouter.get('/:shareid/:folderid', (req, res)=> {
    res.send('get nested folder')
})

shareRouter.get("/:shareid", shareController.getSharedFolder )

module.exports = shareRouter;