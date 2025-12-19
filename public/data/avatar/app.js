const fs = require('fs');
const path = require('path');

// Directory containing the files (current directory by default)
const targetDirectory = './';

// Function to rename files
function renameFiles() {
    try {
        // Read all files in the directory
        const files = fs.readdirSync(targetDirectory);
        
        files.forEach(file => {
            // Skip if it's a directory
            const filePath = path.join(targetDirectory, file);
            if (fs.statSync(filePath).isDirectory()) {
                return;
            }
            
            // Extract the number at the beginning of the filename
            const match = file.match(/^(\d+)-/);
            
            if (match) {
                const number = match[1];
                const extension = path.extname(file);
                const newFileName = `${number}${extension}`;
                const newFilePath = path.join(targetDirectory, newFileName);
                
                // Check if the new filename already exists
                if (fs.existsSync(newFilePath)) {
                    console.log(`Skipping ${file}: ${newFileName} already exists`);
                    return;
                }
                
                // Rename the file
                fs.renameSync(filePath, newFilePath);
                console.log(`Renamed: ${file} → ${newFileName}`);
            } else {
                console.log(`Skipping: ${file} (doesn't match pattern)`);
            }
        });
        
        console.log('File renaming completed!');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the script
renameFiles();