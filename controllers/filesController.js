const asyncHandler = require("express-async-handler")
const db = require('../db/queries')

const { getPath } = require('../services/foldersServices')
const { compareAsc } = require("date-fns")

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

    // res.render("main" , {
    //     rootFolder: folderObj, 
    //     path: `> ${path.join(' > ')}`,
    //     userFiles: foldersAndFiles, 
    //     newFolderHref: newFolderHref, 
    //     newFileHref: newFileHref
    // })

    
const viewFileDetails = asyncHandler(async (req, res)=> {
    const { fileid } = req.params

    const fileObj = await db.getFileById(Number(fileid))
    const parentFolder = await db.getFolderFiles(Number(fileObj.folderid))
    const newFolderHref = parentFolder 
                        ? `/folders/${parentFolder.folderid}/new-folder` 
                        : `/folders/new-folder`;


    const newFileHref = parentFolder 
                        ? `/files/${parentFolder.folderid}/new-file`
                        : `files/new-file`;
    

    const folders = parentFolder 
                    ? parentFolder.children?.length !== 0
                    : false
                
    const files = parentFolder 
                  ? parentFolder.files?.length !== 0
                  : false 


    console.log('folders , files', folders, files)
    console.log('folder.children', parentFolder )                  
    let foldersAndFiles = null
    if(folders || files) {
        foldersAndFiles = parentFolder.children?.concat(parentFolder.files)
                          .sort((a, b)=> compareAsc(a.createdDate, b.createdDate))
    } else {
        let { userid } = req.user
        foldersAndFiles = await db.getUserFiles(userid)
        foldersAndFiles = foldersAndFiles
                            .sort((a, b) => compareAsc(a.createdDate, b.createdDate))
    }
    
    const path = await getPath(parentFolder)
    
    res.render("main", {
        rootFolder: parentFolder, 
        path: path ? `> ${path.join(' > ')}` : null,
        userFiles: foldersAndFiles, 
        newFolderHref: newFolderHref, 
        newFileHref: newFileHref, 
        clickedFile: fileObj
    })
})

module.exports = {
    createFile, 
    createFileToFolder,
    viewFileDetails
}