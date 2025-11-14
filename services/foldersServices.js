const asyncHandler = require("express-async-handler")
const db = require("../db/queries")
const FileService = require("./FileService") 


const getPath = asyncHandler(async (folderObj, {isShared = false, folderid = null} = {})=> {
    if(!folderObj) return null

    let stopCase = !folderObj.parentid 
    if(isShared) stopCase = folderObj.folderid == folderid

    if(!stopCase) {
        const folderParent = await db.getFolderById(folderObj.parentid) 
        const path = await getPath(folderParent, {isShared, folderid})
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

const byteToMega = function (bytes) {
    if(typeof bytes !== 'number' || bytes < 0) {
        throw new Error('Invalid Bytes input')
    }

    if (bytes == 0) return 0 

    return (bytes / 1024) / 1024;
}

const getUsedStorage = async function(userId) {
    const filesFromStorage = await FileService.getListedFiles(userId);
    // get usedStoragein mb
    const usedStorage = filesFromStorage.reduce(
      (total, current) =>  total + byteToMega(current.metadata.size),
      0,
    );

    if(usedStorage > 1024) {
        return {
            isInGb: true, 
            value: usedStorage / 1024
        }
    } else {
        return {
            isInGb: false, 
            value: usedStorage
        }
    }
}

const calculateSpaceUsed = function({ isInGb, value }) {
    let spaceUsedInPercent  = 0;
    if(isInGb) {
        spaceUsedInPercent = value * 10;
    } else if(value > 100) {
        // greater than 100mb and less than 1gb

        // convert mb to gb with round
        const valInGb = Math.round((value / 1024) * 10) / 10
        spaceUsedInPercent = valInGb * 10
    }

    return spaceUsedInPercent;
}



module.exports = {
    getPath, 
    getSize, 
    getUsedStorage, 
    calculateSpaceUsed
}