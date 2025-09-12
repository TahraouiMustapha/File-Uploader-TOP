const asyncHandler = require("express-async-handler")
const db = require("../db/queries")


const getPath = asyncHandler(async (folderObj)=> {
    if(!folderObj) return null

    if(folderObj.parentid) {
        const folderParent = await db.getFolderById(folderObj.parentid) 
        const path = await getPath(folderParent)
        return path.concat([{
            folderName: folderObj.name, 
            folderHref: `/folders/${folderObj.folderid}`
        }])
    }

    return [{
        folderName: folderObj.name, 
        folderHref: `/folders/${folderObj.folderid}`
    }]
})

const getSize = function(size) {
    if(size < 1024) {
        return `${size}b`;
    } 

    return `${Math.floor(size / 1024)}kB`;
}

module.exports = {
    getPath, 
    getSize
}