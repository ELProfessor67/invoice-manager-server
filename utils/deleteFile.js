import fs from 'fs';


export const deleteFile = async (filePath) => {
    try {
        fs.rmSync(filePath);
    } catch (error) {
        
    }
    
}