const asyncHandler = require("express-async-handler")
const db = require("../db/queries")


const getPath = asyncHandler(async (folderObj)=> {
    if(!folderObj) return null

    if(folderObj.parentid) {
        const folderParent = await db.getFolderById(folderObj.parentid) 
        const path = await getPath(folderParent)
        return path.concat([folderObj.name])
    }

    return [folderObj.name]
})

module.exports = {
    getPath
}