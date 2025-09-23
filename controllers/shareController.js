const asyncHandler = require('express-async-handler')
const db = require('../db/queries')

const { getPath, getSize } = require('../services/foldersServices')
const { compareAsc, format } = require('date-fns')

const validateExpiredDate = asyncHandler(async (req, res, next) => {
    const { shareid } = req.params
    
    if(!shareid) {
        return res.status(400).json({error: "Invalid share id"})
    }

    const sharedFolder = await db.getSharedFolder(shareid)
    if(!sharedFolder) return res.status(404).json({error: "Folder not found"})

    const expiredDate = sharedFolder.expiredDate
    if(compareAsc(new Date(), expiredDate) >= 0) {
        // the share expired
        return res.status(403).json({error: "Access is denied. The resource expired"})
    }

    req.sharedFolder = sharedFolder
    next()
})

const getSharedFolder = [
    validateExpiredDate,
    asyncHandler(async (req, res)=> {

    const { sharedFolder } = req

    const folders = sharedFolder?.children.length > 0
    const files = sharedFolder?.files.length > 0

    let foldersAndFiles = null
    if(folders || files) {
        foldersAndFiles = sharedFolder.children.concat(sharedFolder.files)
                        .sort((a, b)=> compareAsc(a.createdDate, b.createdDate))
        foldersAndFiles = foldersAndFiles.map(file => (
            {
                ...file, 
                createdDate: format(file.createdDate, 'PPP'),
                size: file.size ? getSize(file.size) : null
            }
        ))                        
    }

    const actualLink = req.originalUrl
    let path = await getPath(sharedFolder, {isShared: true, folderid: sharedFolder.folderid})

    // make path array like  [ { folderName: 'New Folder', folderHref: '/folders/40' } ]
    path = path.map(pathObj => ({
        ...pathObj, 
        folderHref: `${actualLink}/folder/${pathObj.folderHref.split('/').at(-1)}`
    }))

    res.render("sharedView",{
        userFiles: foldersAndFiles, 
        path: path, 
        isShared: true, 
        sharedLink: actualLink
    })
})]


const getNestedFolder = [
    validateExpiredDate, 
    asyncHandler(async (req, res)=> {
    const { folderid } = req.params
    const { selectedFileId } = req.query
    // sharedFolder from validation middleware
    const { sharedFolder:rootFolder } = req

    if(!folderid || isNaN(Number(folderid))) {
        return res.status(400).json({error: "Invalid folder id"})
    }

    if(selectedFileId) {
        if(isNaN(Number(selectedFileId))) {
            return res.status(400).json({error: "Invalid selected file id"})
        }
    }

    const folderObj = await db.getFolderFiles(Number(folderid))
    if(!folderObj) return res.status(404).json({error: "folder not found"})

    const folders = folderObj?.children.length > 0
    const files = folderObj?.files.length > 0

    let foldersAndFiles = null
    if(folders || files) {
        foldersAndFiles = folderObj.children.concat(folderObj.files)
                        .sort((a, b)=> compareAsc(a.createdDate, b.createdDate))
        foldersAndFiles = foldersAndFiles.map(file => (
            {
                ...file, 
                createdDate: format(file.createdDate, 'PPP'),
                size: file.size ? getSize(file.size) : null
            }
        ))                        
    }

    // Get the first 3 parts of the original URL (to avoid deep nested paths)
    const actualLink = req.originalUrl.split('/').slice(0, 3).join('/')
    let path = await getPath(folderObj, {isShared: true, folderid: rootFolder.folderid})

    // make path array like  [ { folderName: 'New Folder', folderHref: '/folders/40' } ]
    path = path.map(pathObj => ({
        ...pathObj, 
        folderHref: `${actualLink}/folder/${pathObj.folderHref.split('/').at(-1)}`
    }))

    let clickedFile = null
    if(selectedFileId) {
        clickedFile = await db.getFileById(Number(selectedFileId))
        if(!clickedFile) {
            return res.status(404).json({error: "File not found"})
        }

        clickedFile = {
            ...clickedFile, 
            size: clickedFile.size ? getSize(clickedFile.size): null,
            createdDate: format(clickedFile.createdDate, 'PPP   h:m aa' )
        }
    }

    res.render("sharedView", {
        userFiles: foldersAndFiles, 
        path: path, 
        isShared: true, 
        sharedLink: actualLink , 
        clickedFile: clickedFile
    })
    
})]


module.exports = {
    getSharedFolder, 
    getNestedFolder 
}