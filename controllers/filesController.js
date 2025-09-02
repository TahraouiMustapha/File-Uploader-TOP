const asyncHandler = require("express-async-handler")
const db = require('../db/queries')


const createFile = asyncHandler( async (req, res)=> {
    const { userid } = req.user
    const { file } = req

    await db.createFile(file.originalname, file.size, userid, file.buffer)
    
    res.redirect(req.get('referer') || '/')
})

module.exports = {
    createFile
}