const supabase = require('../supabase/supabase');
const { randomUUID } = require('crypto');
const { decode } = require('base64-arraybuffer');



class FileService {
    static async upload(file, userid) {
        try {

            const fileExt = file.originalname.split('.').pop()
            const filename = `${userid}/${randomUUID()}.${fileExt}`

            // convert to ArrayBuffer that supabase expected
            const fileBased64 = decode(file.buffer.toString("base64"))

            // upload the file to supabase
            const { data, error } = await supabase.storage
            .from("files")
            .upload(filename, fileBased64, {
                upsert: false, // do not overwrite files
            })


            if(error) {
                throw new Error(`Uplaod failed: ${error.message}` )
            }

            // get public url of the uploaded file
            const { data: fileObj } = supabase.storage
            .from("files")
            .getPublicUrl(data.path)

            return {
                path: data.path, 
                publicUrl: fileObj.publicUrl, 
                name: file.originalname, 
                size: file.size, 
                mimetype: file.mimetype
            }

        } catch(err) {
            throw err
        }
    }

    static async download(filePath) {
        try {
            const { data, error }  = await supabase.storage
            .from('files')
            .download(filePath)

            if(error) {
                throw new Error('download failed: ', error.message)
            }

            return data;

        } catch (err) {
            throw err
        }
    }

    static async deleteFile(filePath) {
        try {

            const { data, error } = await supabase.storage
            .from('files')
            .remove([filePath])

            if(error) {
                throw new Error('Delete failed: ' ,error.message)
            }

            return data;

        } catch(err) {
            throw err
        }
    }

    static async deleteManyFiles(arrayOfPaths) {
        try {
            const { data, error } = await supabase
            .storage
            .from('files')
            .remove(arrayOfPaths)

            if (error) {
                throw new Error('Delete files fails: ', error.message)
            }

            return data

        } catch(err) {
            throw err
        }

    }

    static async getListedFiles(userId) {
        const { data, error } = await supabase.storage
            .from('files')
            .list(`${userId}/`, {
                limit   : 1000,
                offset : 0,
            });

            if (error) {
                console.error('Error listing files:', error)
                return null ;
            }

            return data;
    }
}

module.exports = FileService