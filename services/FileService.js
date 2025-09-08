const supabase = require('../supabase/supabase')
const { v4 } = require('uuid')
const { decode } = require('base64-arraybuffer')


class FileService {
    static async upload(file, userid) {
        try {

            const fileExt = file.originalname.split('.').pop()
            console.log('fileExt: ', fileExt )        
            const filename = `${userid}/${v4()}.${fileExt}`
            console.log('filenaem ', filename)

            // convert to ArrayBuffer that supabase expected
            const fileBased64 = decode(file.buffer.toString("base64"))

            // upload the file to supabase
            const { data, error } = await supabase.storage
            .from("files")
            .upload(filename, fileBased64, {
                upsert: false, // do not overwrite files
            })

            console.log('first uplaod data obj: ', data)

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
}

module.exports = FileService