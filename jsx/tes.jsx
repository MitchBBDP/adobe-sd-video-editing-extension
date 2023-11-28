//@include "utils.jsx"
// createNewProject("alba re qwe", true);

function createNewProject(nameOfTandem, currentDate, hasBoard) {
    utils.activeProjectInitialize();

    var fileName = utils.fileNameChecker();
    var fileNameLength = fileName.split(/\s+/).length;
    var parentFolderPath = projPath.substring(0, projPath.lastIndexOf("\\") + 1);
    var parentFolderObj = new Folder(parentFolderPath);

    //Check if you are in the default untitled prproj
    if (fileName.toLowerCase() != 'untitled' || fileNameLength > 1) {
        var userConfirmed = confirm("Do you want to proceed?", true, "Default Untitled Project Not Selected");

        if (!userConfirmed) {
            return;
        }
    }

    //Tandem folder creation and error handler
    var isTandemFolderCreated = createTandemFolder(nameOfTandem, parentFolderObj);
    if (isTandemFolderCreated == "error") {
        return;
    } else {
        var tandemFolderObj = isTandemFolderCreated[0];
        var videosFolderObj = isTandemFolderCreated[1];
        var tandemProjectFilePath = tandemFolderObj.fsName + "/" + nameOfTandem;
    }

    //File import and error handler
    var isFilesImported = importTandem(tandemProjectFilePath, videosFolderObj, hasBoard);
    if (isFilesImported === "Invalid Selection") {
        videosFolderObj.remove();
        tandemFolderObj.remove();
        return;
    }

    //Import FHD Stock Files to Project
    var fhdFolder = srcFolder + "/" + "fhd";
    var fhdFolderObj = new Folder(fhdFolder);
    utils.importStock(fhdFolderObj, templateBin);

    //Initialize variables for stock template items
    utils.fhdTemplateToVarInitialize();

    //Initialize variables for tandem videos
    utils.fhdVidsToVarInitialize(hasBoard);

    //Rename project files
    renameProjectFiles(hasBoard);

    //Create subclips to remove audio
    fhdIntroMask = utils.convertToSubclip(fhdIntroMask);
    walkToPlane = utils.convertToSubclip(walkToPlane);
    freefall = utils.convertToSubclip(freefall);
    if (hasLanding) {
        landing = utils.convertToSubclip(landing);
    }

    //Create New Sequence for FHD
    var seqFolder = srcFolder + "/" + "sequence";
    var fhdSqPresetPath = seqFolder + "/" + "FullHD.sqpreset";
    var fhdSqPreset = new File(fhdSqPresetPath);
    createFhdSeq(nameOfTandem, fhdSqPreset);

    //Initialize Tracks
    utils.activeSeqAndTracksInitialize();

    //Insert clips to FHD sequence
    insertFhdClips();

    //Insert Lower Thirds and Copyrights
    var mogrtFolder = srcFolder + "/" + "mogrts";

    //Lower Thirds
    var lowerThirdsMogrtPath = mogrtFolder + "/" + "Lower Thirds.mogrt";
    var lowerThirdsMogrtFile = new File(lowerThirdsMogrtPath);
    var lowerThirdsStartTime = preInterviewVClip[0].start.seconds + 2;
    var lowerThirdsClip = insertMogrts(lowerThirdsMogrtFile, lowerThirdsStartTime);
    lowerThirdsClip.end = lowerThirdsClip.start.seconds + 10;

    //Set the name and date of the Lower Thirds to the Customer Name and Current Date
    var splitTandemName = nameOfTandem.split(" ");
    var customerName = splitTandemName[2];
    var lowerThirdsComponent = lowerThirdsClip.getMGTComponent();
    lowerThirdsComponent.properties[0].setValue(customerName.toUpperCase(), 1);
    lowerThirdsComponent.properties[1].setValue(currentDate.toUpperCase(), 1);

    //Copyrights
    var copyrightsMogrtPath = mogrtFolder + "/" + "Copyrights.mogrt";
    var copyrightsMogrtFile = new File(copyrightsMogrtPath);
    var outroClip = vTrackTwo.clips[vTrackTwo.clips.length - 1]
    var copyrightsStartTime = outroClip.end.seconds - 8;
    var copyrightClip = insertMogrts(copyrightsMogrtFile, copyrightsStartTime);
    copyrightClip.end = outroClip.end;


    // ----------------------------------------------------------------------------------------- //
    // ------------------------------- Create New Project Functions ---------------------------- //
    // ----------------------------------------------------------------------------------------- //


    function createTandemFolder(nameOfTandem, parentFolderObj) {
        //Create folder for the tandem
        var tandemFolder = parentFolderObj + "/" + nameOfTandem;
        var tandemFolderObj = new Folder(tandemFolder);
        if (tandemFolderObj.exists) {
            alert("Tandem Folder Name already exists", "Error: Duplicate Folder", true);
            return "error";
        }
        tandemFolderObj.create();

        //Create Videos folder inside the tandem folder
        var videosFolder = tandemFolder + "/Videos";
        var videosFolderObj = new Folder(videosFolder);
        videosFolderObj.create();

        return [tandemFolderObj, videosFolderObj];
    }

    function importTandem(tandemProjectFilePath, videosFolderObj, hasBoard) {
        var copiedFiles = [];

        //Run File Select
        var fileSelected = utils.fileSelector();

        if (fileSelected) {
            //Check if number of selection is valid
            var isSelectionValid = (!hasBoard && fileSelected.length >= 4) || (hasBoard && fileSelected.length >= 5);
            if (isSelectionValid) {
                //Create New Premiere Pro Project File (Prproj)
                app.newProject(tandemProjectFilePath);

                //Create Bins
                utils.activeProjectInitialize();
                projRoot.createBin("Template");
                projRoot.createBin("Videos");
                projRoot.createBin("Sub Clips");
                utils.binInitialize();
            } else {
                alert("If the board exists, select a minimum of 5 files; otherwise, select a minimum of 4 files.", "Error: Invalid Selection", true);
                return "Invalid Selection";
            }
        } else {
            return "Invalid Selection";
        }

        //Copy tandem files to tandem videos folder
        if (videosFolderObj.getFiles().length > 0) {
            return;
        } else {
            for (var i in fileSelected) {
                fileSelected[i].copy(videosFolderObj + '/' + fileSelected[i].displayName);
            }
        }

        //Import copied files to PrPro
        for (var i in videosFolderObj.getFiles()) {
            copiedFiles.push(videosFolderObj.getFiles()[i].fsName)
        }
        proj.importFiles(copiedFiles, false, vidBin, false);
    }

    function createFhdSeq(nameOfTandem, presetPath) {
        proj.newSequence(nameOfTandem + " - FHD", presetPath.fsName);
    }

    function renameProjectFiles(hasBoard) {
        if (hasBoard) {
            board.name = "Board";
        }
        preInterview.name = "PreInterview";
        walkToPlane.name = "WalkToPlane";
        freefall.name = "Freefall";
        if (hasLanding) {
            landing.name = "Landing"
        }
        for (var i in postInterview) {
            postInterview[i].name = "PostInterview";
        }
    }

    function insertFhdClips() {
        //Insert Intro Template
        vTrackTwo.insertClip(fhdIntro, 0);
        vTrackTwo.insertClip(fhdIntroMask, vTrackTwo.clips[0].end);
        aTrackTwo.overwriteClip(fhdIntroSound, 0)

        //Insert Tandem Videos and Stock Shots
        vTrackOne.insertClip(preInterview, vTrackTwo.clips[1].start);
        vTrackOne.insertClip(fhdStockOne, vTrackOne.clips[0].end);
        vTrackOne.insertClip(walkToPlane, vTrackOne.clips[1].end);
        vTrackOne.insertClip(fhdStockTwo, vTrackOne.clips[2].end);
        vTrackOne.insertClip(freefall, vTrackOne.clips[3].end);
        if (hasLanding) {
            vTrackOne.insertClip(landing, vTrackOne.clips[4].end);
            for (var i = 0; i < postInterview.length; i++) {
                vTrackOne.insertClip(postInterview[i], vTrackOne.clips[5 + i].end);
            }
        } else {
            for (var i = 0; i < postInterview.length; i++) {
                vTrackOne.insertClip(postInterview[i], vTrackOne.clips[4 + i].end);
            }
        }

        //Initialize tandem video track clips inside an array variable
        utils.clipsToVarInitialize();

        //Determine the last clip in video track one
        var lastInterviewClip = postInterviewVClip[postInterviewVClip.length - 1];

        //Insert Outro Template
        vTrackTwo.insertClip(fhdOutroMask, lastInterviewClip.end.seconds - .65);
        vTrackTwo.insertClip(fhdOutro, vTrackTwo.clips[2].end);
    }

    function insertMogrts(mogrtFile, startTime) {
        var mogrtClip = seq.importMGT(mogrtFile.fsName, startTime, 3, 0);
        return mogrtClip;
    }
}

function importHandicam() {
    var copiedFiles = [];
    var folderPathObj = new Folder(parentFolderObj);

    var fileSelected = fileSelector();

    if (fileSelected) {
        proj.rootItem.createBin("HC Videos");
        utils.hcBinInitialize();
    } else {
        return;
    }

    for (var i in fileSelected) {
        fileSelected[i].copy(parentFolderObj + '/' + fileSelected[i].displayName);
    }

    var copiedFilesObj = folderPathObj.getFiles();

    for (var i in copiedFilesObj) {
        copiedFiles.push(copiedFilesObj[i].fsName)
    }


    proj.importFiles(copiedFiles, false, hcBin, false);
}