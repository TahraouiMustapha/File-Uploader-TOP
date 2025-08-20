const { Router } = require("express")
const multer = require("multer");
const upload = multer({ dest: 'uploads/'})

const filesRouter = Router();
const filesController = require("../controllers/filesController")

filesRouter.post('/new-file', upload.single('new-file'), (req, res)=> {
    console.log(req.file)
    res.send("all are good")
})

filesRouter.post('/new-folder', filesController.createFolder )


module.exports = filesRouter;