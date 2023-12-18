function checkDestFolder() {
    var docFolder = Folder.myDocuments;
    var destFolder = docFolder + "/" + "SD Extension Presets";
    var destFolderObj = new Folder(destFolder);

    if (destFolderObj.exists) {
        var destFolderContents = destFolderObj.getFiles();
        if (destFolderContents.length >= 5) {
            return 1;
        } else {
            alert("Incomplete Files in ~Documents/SD Extension Presets. Delete the folder and run the extension again.", "Error: Missing Files", true);
            return 0;
        }
    } else {
        var copyDir = copyDefaultFolder(destFolderObj);
        if (copyDir) {
            return 1;
        } else {
            alert("Error Copying Files in ~Documents/SD Extension Presets. Make sure you have administrator privileges. Delete the folder and run the extension again.", "Error: Copy Files Error", true);
            return 0;
        }
    }
}

function copyDefaultFolder(destFolderObj) {
    var scriptPath = new File($.fileName);
    var extParentFolder = scriptPath.parent.parent;
    var srcFolder = extParentFolder + "/" + "SD Extension Presets";
    var srcFolderObj = new Folder(srcFolder);

    // Recursive function to copy files and folders
    try {
        function copyItems(src, destination) {
            var srcChildren = src.getFiles();
            for (var i = 0; i < srcChildren.length; i++) {
                var srcChild = srcChildren[i];
                var destinationChildStr = destination + "/" + srcChild.name;
                if (srcChild instanceof File) {
                    srcChild.copy(destinationChildStr);
                } else {
                    var destinationChildFolder = new Folder(destinationChildStr);
                    if (!destinationChildFolder.exists) {
                        destinationChildFolder.create();
                    }
                    copyItems(srcChild, destinationChildFolder);
                }
            }
        }
    } catch (e) {
        return 0;
    }

    // Copy the contents of the src folder to the destination folder
    copyItems(srcFolderObj, destFolderObj);
    return 1;
}