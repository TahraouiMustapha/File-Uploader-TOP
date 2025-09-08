const asyncHandler = require("express-async-handler")
const db = require('../db/queries')

const path = require('path')

const FileService = require('../services/FileService')


            // return {
            //     path: data.path, 
            //     publicUrl: fileObj.publicUrl, 
            //     name: file.originalname, 
            //     size: file.size, 
            //     mimetype: file.mimetype
            // }

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
        return res.status(400).json({ message: "please upload a file " });
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

    if(!file) {
        return res.status(400).json({ message: "please upload a file " });
    }

    // upload the file to supabase storage
    const uplaodResult = await FileService.upload(file, userid)

    await db.createFileToFolder(Number(folderid), fileObjMaker(uplaodResult, Number(userid)));
    
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