const { Router } = require("express")
const multer = require("multer");
const upload = multer({ dest: 'uploads/'})

const filesRouter = Router();

filesRouter.post('/new-file', upload.single('new-file'), (req, res)=> {
    console.log(req.file)
    res.send("all are good")
})

filesRouter.post('/new-folder', (req, res)=> {
    console.log(req.body.folderName)
    res.send('good')
})


module.exports = filesRouter;