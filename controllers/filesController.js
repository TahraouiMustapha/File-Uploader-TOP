const asyncHandler = require("express-async-handler")
const db = require('../db/queries')

const path = require('path')


function fileObjMaker (fileObj, userid) {
    return {
        name: fileObj.originalname, 
        size: fileObj.size , 
        mimetype: fileObj.mimetype,
        ownerId: userid, 
        filedata: fileObj.buffer
    }
}

const createFile = asyncHandler( async (req, res)=> {
    const { userid } = req.user
    const { file } = req

    await db.createFile( fileObjMaker(file, Number(userid)) )
    
    res.redirect(req.get('referer') || '/')
})


const createFileToFolder = asyncHandler(async(req, res)=> {
    const { userid } = req.user;
    const { file } = req;
    const { folderid } = req.params;

    await db.createFileToFolder(Number(folderid), fileObjMaker(file, Number(userid)));
    

    const path = `/folders/${folderid}`;
    res.redirect(path)
})
    
const viewFileDetails = asyncHandler(async (req, res)=> {
    const { fileid } = req.params

    const fileObj = await db.getFileById(Number(fileid))

    const path = fileObj.folderid 
                ? `/folders/${fileObj.folderid}?selectedFileId=${fileObj.fileid}`
                : `/?selectedFileId=${fileObj.fileid}`


    res.redirect(path)
})

const downlaodFile = asyncHandler(async(req, res) => {
    const { fileid } = req.params;

    const fileObj = await db.getFileById(Number(fileid))

    console.log(req.file)

    res.set({
        "Content-Type": "image/jpeg", 
        "Content-Disposition": "attachment;filename = boy.jpg"
    })
    res.end(fileObj.filedata)
})

module.exports = {
    createFile, 
    createFileToFolder,
    viewFileDetails, 
    downlaodFile
}