const asyncHandler = require('express-async-handler')
const db = require('../db/queries')

const { getPath, getSize } = require('../services/foldersServices')
const { compareAsc, format } = require('date-fns')

const getSharedFolder = asyncHandler(async (req, res)=> {
    const { shareid } = req.params
    
    if(!shareid) {
        return res.status(400).json({error: "Invalid share id"})
    }

    const sharedFolder = await db.getSharedFolder(shareid)
    if(!sharedFolder) return res.status(403).json({error: "Folder not found"})

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
    let path = await getPath(sharedFolder)

    // make path array like  [ { folderName: 'New Folder', folderHref: '/folders/40' } ]
    path = path.map(pathObj => ({
        ...pathObj, 
        folderHref: `${actualLink}/${pathObj.folderHref.split('/').at(-1)}`
    }))

    res.render("sharedView",{
        userFiles: foldersAndFiles, 
        path: path, 
        isShared: true, 
        sharedLink: actualLink 
    })
})


module.exports = {
    getSharedFolder
}