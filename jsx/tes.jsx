//@include "utils.jsx"
createNewProject("1qwe qwe mia", "25 November 2023", true);

function createNewProject(nameOfTandem, currentDate, hasBoard) {
    var ap = new ActiveProject();
    var srcFolder = ap.getSrcFolder();

    //Set Properties for Default Untitled PrProj
    ap.InitializeCurrentProject();

    //Check if you are in the default untitled prproj
    var fileName = ap.getFileName();
    var fileNameLength = fileName.split(/\s+/).length;
    if (fileName.toLowerCase() != 'untitled' || fileNameLength > 1) {
        var userConfirmed = confirm("Do you want to proceed?", true, "Default Untitled Project Not Selected");

        if (!userConfirmed) {
            return;
        }
    }

    //Tandem folder creation and error handler
    var tandemFolder = ap.createNewFolder(nameOfTandem);
    if (!tandemFolder) {
        return;
    }

    //File import and error handler
    var tandemProjectFilePath = tandemFolder.fsName + "/" + nameOfTandem;
    var binFolder = "Videos";
    var fileSelected = ap.fileSelector();

    //Check if file selection is valid
    if (!fileSelected || !ap.selectionValidator(binFolder, fileSelected.length, hasBoard)) {
        tandemFolder.remove();
        return;
    }

    //Create New Tandem Premiere Pro Project File (Prproj)
    app.newProject(tandemProjectFilePath);

    //Set Properties for Current Tandem PrProj
    ap.InitializeCurrentProject();

    ap.projRoot.createBin("Template");
    ap.projRoot.createBin("Videos");
    ap.projRoot.createBin("Sub Clips");
    ap.fhdBinInitialize();

    //Copy Files in a new folder inside the tandem folder
    var videosFolder = ap.copyFilesToSubFolder(fileSelected, binFolder);

    //Import Copied Files to PrProj
    ap.importToProject(videosFolder.getFiles(), ap.vidBin);

    //Import FHD Stock Files to PrProj
    var stockFolder = new Folder(srcFolder + "/fhd");
    ap.importToProject(stockFolder.getFiles(), ap.templateBin);

    //Initialize variables for stock template items
    ap.fhdTemplateToVarInitialize();

    //Initialize variables for tandem videos
    ap.fhdVidsToVarInitialize(hasBoard);

    //Rename project files
    renameProjectFiles(hasBoard);

    //Create subclips to remove audio
    ap.fhdIntroMask = ap.convertToSubclip(ap.fhdIntroMask);
    ap.walkToPlane = ap.convertToSubclip(ap.walkToPlane);
    ap.freefall = ap.convertToSubclip(ap.freefall);
    if (ap.hasLanding) {
        ap.landing = ap.convertToSubclip(ap.landing);
    }

    //Create New Sequence for FHD
    var fhdSqPresetPath = srcFolder + "/" + "sequence" + "/" + "FullHD.sqpreset";
    var fhdSqPreset = new File(fhdSqPresetPath);
    createFhdSeq(nameOfTandem, fhdSqPreset);

    //Initialize Tracks
    ap.activeSeqAndTracksInitialize();

    //Insert clips to FHD sequence
    insertFhdClips();

    //Insert Lower Thirds and Copyrights
    var mogrtFolder = srcFolder + "/" + "mogrts";

    //Lower Thirds
    var lowerThirdsMogrtPath = mogrtFolder + "/" + "Lower Thirds.mogrt";
    var lowerThirdsMogrtFile = new File(lowerThirdsMogrtPath);
    var lowerThirdsStartTime = ap.preInterviewVClip[0].start.seconds + 2;
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
    var outroClip = ap.vTrackTwo.clips[ap.vTrackTwo.clips.length - 1]
    var copyrightsStartTime = outroClip.end.seconds - 8;
    var copyrightClip = insertMogrts(copyrightsMogrtFile, copyrightsStartTime);
    copyrightClip.end = outroClip.end;


    // ----------------------------------------------------------------------------------------- //
    // ------------------------------- Create New Project Functions ---------------------------- //
    // ----------------------------------------------------------------------------------------- //

    function createFhdSeq(tandemName, presetPath) {
        ap.proj.newSequence(tandemName + " - FHD", presetPath.fsName);
    }

    function renameProjectFiles(hasBoard) {
        if (hasBoard) {
            ap.board.name = "Board";
        }
        ap.preInterview.name = "PreInterview";
        ap.walkToPlane.name = "WalkToPlane";
        ap.freefall.name = "Freefall";
        if (ap.hasLanding) {
            ap.landing.name = "Landing"
        }
        for (var i in ap.postInterview) {
            ap.postInterview[i].name = "PostInterview";
        }
    }

    function insertFhdClips() {
        //Insert Intro Template
        ap.vTrackTwo.insertClip(ap.fhdIntro, 0);
        ap.vTrackTwo.insertClip(ap.fhdIntroMask, ap.vTrackTwo.clips[0].end);
        ap.aTrackTwo.overwriteClip(ap.fhdIntroSound, 0)

        //Insert Tandem Videos and Stock Shots
        ap.vTrackOne.insertClip(ap.preInterview, ap.vTrackTwo.clips[1].start);
        ap.vTrackOne.insertClip(ap.fhdStockOne, ap.vTrackOne.clips[0].end);
        ap.vTrackOne.insertClip(ap.walkToPlane, ap.vTrackOne.clips[1].end);
        ap.vTrackOne.insertClip(ap.fhdStockTwo, ap.vTrackOne.clips[2].end);
        ap.vTrackOne.insertClip(ap.freefall, ap.vTrackOne.clips[3].end);
        if (ap.hasLanding) {
            ap.vTrackOne.insertClip(ap.landing, ap.vTrackOne.clips[4].end);
            for (var i = 0; i < ap.postInterview.length; i++) {
                ap.vTrackOne.insertClip(ap.postInterview[i], ap.vTrackOne.clips[5 + i].end);
            }
        } else {
            for (var i = 0; i < ap.postInterview.length; i++) {
                ap.vTrackOne.insertClip(ap.postInterview[i], ap.vTrackOne.clips[4 + i].end);
            }
        }

        //Initialize tandem video track clips inside an array variable
        ap.clipsToVarInitialize();

        //Determine the last clip in video track one
        var lastInterviewClip = ap.postInterviewVClip[ap.postInterviewVClip.length - 1];

        //Insert Outro Template
        ap.vTrackTwo.insertClip(ap.fhdOutroMask, lastInterviewClip.end.seconds - .65);
        ap.vTrackTwo.insertClip(ap.fhdOutro, ap.vTrackTwo.clips[2].end);
    }

    function insertMogrts(mogrtFile, startTime) {
        var mogrtClip = ap.seq.importMGT(mogrtFile.fsName, startTime, 3, 0);
        return mogrtClip;
    }
}


function insertHandicam() {
    var ap = new ActiveProject();
}