const asyncHandler = require("express-async-handler")
const db = require('../db/queries')

const path = require('path')

const FileService = require('../services/FileService')


function fileObjMaker (fileObj, userid) {
    return {
        name: fileObj.name, 
        size: fileObj.size , 
        mimetype: fileObj.mimetype,
        ownerId: userid, 
        path: fileObj.path, 
        publicUrl: fileObj.publicUrl
    }
}

const createFile = asyncHandler( async (req, res)=> {
    const { userid } = req.user
    const { file } = req

    if(!file) {
        req.flash('dialog', 'upload')
        req.flash('error', 'Upload a file first')
        return res.status(400).redirect('/');
    }

    // upload the file to supabase storage
    const uplaodResult = await FileService.upload(file, userid)

    await db.createFile( fileObjMaker(uplaodResult, Number(userid)) )

    res.redirect('/')
})


const createFileToFolder = asyncHandler(async(req, res)=> {
    const { userid } = req.user;
    const { file } = req;
    const { folderid } = req.params;

    const path = `/folders/${folderid}`;

    if(!file) {
        req.flash('dialog', 'upload')
        req.flash('error', 'Upload a file first')
        return res.status(400).redirect(path);        
    }

    // upload the file to supabase storage
    const uplaodResult = await FileService.upload(file, userid)

    await db.createFileToFolder(Number(folderid), fileObjMaker(uplaodResult, Number(userid)));
    
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

    // download the file from supabase storage
    const filedata = await FileService.download(fileObj.path)

    const filename = path.basename(fileObj.name)
    
    const arraybuffer = await filedata.arrayBuffer()
    const fileBuffer = Buffer.from(arraybuffer)

    res.setHeader("Content-Disposition", `attachment ; filename = "${filename}"`)

    res.send(fileBuffer)
})

const deleteFile = asyncHandler(async (req, res)=> {
    const { fileid } = req.params

    const fileObj = await db.getFileById(Number(fileid))

    // delete the file from supabase storage
    await FileService.deleteFile(fileObj.path)

    await db.deleteFile(Number(fileid));

    const path = fileObj.folderid 
                ? `/folders/${fileObj.folderid}`
                : '/'

    res.redirect(path)
})

module.exports = {
    createFile, 
    createFileToFolder,
    viewFileDetails, 
    downlaodFile, 
    deleteFile
}