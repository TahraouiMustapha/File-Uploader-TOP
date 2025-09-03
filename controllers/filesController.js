const asyncHandler = require("express-async-handler")
const db = require('../db/queries')


function fileObjMaker (name, size, userid, filedata) {
    return {
        name, 
        size, 
        ownerId: userid, 
        filedata
    }
}

const createFile = asyncHandler( async (req, res)=> {
    const { userid } = req.user
    const { file } = req

    await db.createFile( fileObjMaker(file.originalname, file.size, userid, file.buffer) )
    
    res.redirect(req.get('referer') || '/')
})


const createFileToFolder = asyncHandler(async(req, res)=> {
    const { userid } = req.user;
    const { file } = req;
    const { folderid } = req.params;

    await db.createFileToFolder(Number(folderid), fileObjMaker(file.originalname, file.size, userid, file.buffer));
    

    const path = `/folders/${folderid}`;
    res.redirect(path)
})

module.exports = {
    createFile, 
    createFileToFolder
}