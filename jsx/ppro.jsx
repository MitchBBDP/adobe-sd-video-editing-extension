﻿//@include "utils.jsx"

function createNewProject(nameOfTandem, currentDate, hasBoard) {
    var ap = new ActiveProject();
    var srcFolder = ap.getSrcFolder();

    //Check if you are in the default untitled prproj
    var fileName = ap.getFileName();
    var fileNameLength = fileName.split(/\s+/).length;
    if (fileName.toLowerCase() != 'untitled' || fileNameLength > 1) {
        var userConfirmed = confirm("Do you want to proceed?", true, "Default Untitled Project Not Selected");

        if (!userConfirmed) {
            return false;
        }
    }

    //Tandem folder creation and error handler
    var tandemFolder = ap.createNewFolder(nameOfTandem);
    if (!tandemFolder) {
        return false;
    }

    //File import and error handler
    var tandemProjectFilePath = tandemFolder.fsName + "/" + nameOfTandem;
    var binFolder = "Videos";
    var fileSelected = ap.fileSelector();

    //Check if file selection is valid
    if (!fileSelected || !selectionValidator(fileSelected.length, hasBoard)) {
        tandemFolder.remove();
        return false;
    }

    //Create New Tandem Premiere Pro Project File (Prproj)
    app.newProject(tandemProjectFilePath);

    //Set Properties for Current Tandem PrProj
    ap.initializeCurrentProject();
    ap.createBin(binFolder);

    //Copy Files in a new folder inside the tandem folder
    var videosFolder = ap.copyFilesToSubFolder(fileSelected, binFolder);

    //Import Copied Files to PrProj
    ap.importToProject(videosFolder.getFiles(), ap.vidBin);

    //Import FHD Stock Files to PrProj
    var stockFolder = new Folder(srcFolder + "/fhd");
    ap.createBin("Template");
    ap.importToProject(stockFolder.getFiles(), ap.templateBin);

    //Initialize variables for stock template items
    ap.templateToVarInitialize();

    //Initialize variables for tandem videos
    ap.fhdVidsToVarInitialize(hasBoard);

    //Rename project files
    renameTandemVideos(hasBoard);

    //Create subclips to remove audio
    ap.createBin("Sub Clips");
    ap.fhdIntroMask = ap.convertToSubclip(ap.fhdIntroMask);
    ap.walkToPlane = ap.convertToSubclip(ap.walkToPlane);
    ap.freefall = ap.convertToSubclip(ap.freefall);
    if (ap.hasLanding) {
        ap.landing = ap.convertToSubclip(ap.landing);
    }

    //Remove frames from the tandem videos and stockshots to make space for transitions
    //Ignoring this step will cause the transitions to contain repeated frames later on
    ap.trimInAndOutPoint(ap.vidBin);
    ap.trimInAndOutPoint(ap.subClipsBin);
    ap.trimInAndOutPoint(ap.templateBin);

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

    //Savepoint
    ap.proj.save();

    return true;


    // ----------------------------------------------------------------------------------------- //
    // ------------------------------- Create New Project Functions ---------------------------- //
    // ----------------------------------------------------------------------------------------- //

    //Validate files selected for import
    function selectionValidator(selectionLength, hasBoard) {
        var validator = (!hasBoard && selectionLength >= 4) || (hasBoard && selectionLength >= 5);
        if (!validator) {
            alert("If the board exists, select a minimum of 5 files; otherwise, select a minimum of 4 files.", "Error: Invalid Selection", true);
        }
        return validator;
    }

    function createFhdSeq(tandemName, presetPath) {
        ap.proj.newSequence(tandemName + " - FullHD", presetPath.fsName);
    }

    function renameTandemVideos(hasBoard) {
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
        ap.vTrackOneClipsInitialize();

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

    //Set Properties for Current Tandem PrProj
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    //File import
    var fileSelected = ap.fileSelector();
    if (!fileSelected) {
        return;
    }

    //Copy files to created handicam folder inside the tandem folder
    var binFolder = "HC Videos";
    var hcFolder = ap.copyFilesToSubFolder(fileSelected, binFolder);

    if (!hcFolder) {
        return;
    }

    //Create project bin for handicam and import the copied files inside it
    ap.createBin(binFolder);
    ap.importToProject(hcFolder.getFiles(), ap.hcBin);

    //Initialize HC properties
    ap.hcVidsToVarInitialize();

    //Rename HC files in PrProj
    renameHCVideos();

    //Remove frames from the hc videos to make space for transitions
    //Ignoring this step will cause the transitions to contain repeated frames later on
    ap.trimInAndOutPoint(ap.hcBin);

    //Create subclip for handicam freefall
    ap.subClipsBin = ap.getBin("Sub Clips");
    ap.handicamView = ap.convertToSubclip(ap.handicamView);

    //Initialize Track Clips Properties
    ap.clipsToVarInitialize();


    //Insert all the under canopy clips after the freefall clip
    insertUnderCanopy();

    //Insert the handicam freefall at the end of the video
    insertHCFreefall();

    //Savepoint
    ap.proj.save();

    // ----------------------------------------------------------------------------------------- //
    // --------------------------------- Insert Handicam Functions ---------------------------- //
    // ----------------------------------------------------------------------------------------- //


    function renameHCVideos() {
        ap.handicamView.name = "HandicamView";
        for (var i in ap.underCanopy) {
            ap.underCanopy[i].name = "UnderCanopy";
        }
    }

    function insertUnderCanopy() {
        moveClipsForUnderCanopy();
        for (var i = ap.underCanopy.length - 1; i >= 0; i--) {
            ap.vTrackOne.insertClip(ap.underCanopy[i], ap.freefallVClip[0].end);
        }
    }

    function insertHCFreefall() {
        ap.vTrackOne.insertClip(ap.handicamView, ap.outroVClip.end);
    }

    function moveClipsForUnderCanopy() {
        var underCanopyDuration = ap.getClipDuration(ap.underCanopy);
        var lastFreefallClip = ap.freefallVClip[ap.freefallVClip.length - 1];
        var freefallEndSec = lastFreefallClip.end.seconds;
        ap.moveClipsAfterTime(freefallEndSec, underCanopyDuration, true);
    }

}

function applyTwixtor() {
    //Initialize project properties
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();
    ap.initializeQEProject();
    ap.activeQESeqAndTracksInitialize();

    //Make a 10 frames slice at the playhead
    ap.sliceOneSecond();

    //Get the twixtor clip
    var twixtorClip = ap.seq.getSelection()[0];

    var twixtorDuration = 3.28;

    //Move clips to make space for the twixtor clip
    moveClipsForTwixtor(twixtorDuration);

    //Extend the sliced clip to match the twixtor duration
    extendTwixtorClip(twixtorClip, twixtorDuration);

    //Apply the twixtor effect to the sliced clip
    addTwixtorEffect(twixtorClip);

    //Set the component parameter for the twixtor clip to match the desired slow-motion
    modifyTwixtorSettings(twixtorClip);

    // ----------------------------------------------------------------------------------------- //
    // --------------------------------- Apply Twixtor Functions ------------------------------- //
    // ----------------------------------------------------------------------------------------- //
    function savePlayheadPosition() {
        var currPlayheadSec = ap.getPlayheadSeconds();
        return ap.newTimeObject(currPlayheadSec);
    }

    function moveClipsForTwixtor(timeToMove) {
        var playheadPosSec = ap.seq.getPlayerPosition().seconds;
        ap.moveClipsAfterTime(playheadPosSec, timeToMove, false);
    }

    function extendTwixtorClip(clip, extension) {
        extendedDuration = clip.end.seconds + extension;
        clip.end = ap.newTimeObject(extendedDuration);
    }

    function addTwixtorEffect(clip) {
        //Initialize twixtor effect property
        ap.videoEffectsInitialize();

        /*Stores the original name in a variable and change the name to Twixtor
         so that twixtor can be found by the function and assign it to its property*/
        var clipName = clip.name;
        clip.name = "Twixtor";

        ap.qeVTrackOneClipsInitialize();
        ap.twixtorClip.addVideoEffect(ap.twixtorEffect);

        //Revert the clip name to its original name
        clip.name = clipName;
    }

    function modifyTwixtorSettings(clip) {
        var components = clip.components;
        var speedComponent = components[2].properties[20];

        clip.components[2].properties[2].setValue(1, 1);
        clip.components[2].properties[3].setValue(0, 1);
        clip.components[2].properties[22].setValue(2, 1);

        speedComponent.setTimeVarying(true);
        speedComponent.addKey(clip.inPoint.seconds);
        speedComponent.addKey(clip.inPoint.seconds + 0.48);
        speedComponent.addKey(clip.inPoint.seconds + 2);
        speedComponent.addKey(clip.inPoint.seconds + 3.52);
        speedComponent.addKey(clip.inPoint.seconds + 4);
        speedComponent.setValueAtKey(clip.inPoint.seconds, 100);
        speedComponent.setValueAtKey(clip.inPoint.seconds + 0.48, 10);
        speedComponent.setValueAtKey(clip.inPoint.seconds + 2, 2);
        speedComponent.setValueAtKey(clip.inPoint.seconds + 3.52, 10);
        speedComponent.setValueAtKey(clip.inPoint.seconds + 4, 100);
    }
}

function addMEWT() {
    //Initialize project properties
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.initializeQEProject();
    ap.binInitialize();
    ap.templateToVarInitialize();
    ap.activeSeqAndTracksInitialize();
    ap.activeQESeqAndTracksInitialize();
    ap.vTrackOneClipsInitialize();

    //Check if exit with twixtor has been made    
    var exitClip = ap.freefallVClip[1];
    if (!exitClip) {
        alert("Exit clip with Twixtor not found", "Error: Missing Clip", true);
        return;
    }

    //Add the music file to the track
    var isMusicAdded = addMusic();
    if (!isMusicAdded) {
        return;
    }

    //Initialize the music file property in the track
    ap.aTrackTwoClipsInitialize();

    //Define the start, drop, and end time of the music
    setMusicDuration();

    //Add the watermark to the track
    addWatermark();

    //Fix the size and position of the watermark
    setWatermarkComponent();

    //Add video and audio transitions
    addTransitions();

    //Set the volume for audio track two
    adjustMusicVolume();

    ap.autoDuck();

    // ----------------------------------------------------------------------------------------- //
    // ------------------ Add Music, Effects, Watermark, Transitions Functions ----------------- //
    // ----------------------------------------------------------------------------------------- //

    function addMusic() {
        var musicMarkers = ap.fhdMusic.getMarkers();

        //Set the music start at the marker so we can align it with the exit clip
        if (musicMarkers.length > 0) {
            var musicDrop = ap.fhdMusic.getMarkers().getFirstMarker().end;
            var musicInPoint = musicDrop.seconds;
            var musicOutPoint = musicDrop.seconds + 1;
            ap.setInAndOut(ap.fhdMusic, musicInPoint, musicOutPoint);
        } else {
            alert("Music file has no marker at the drop", "Error: Marker Not Found", true);
            return null;
        }

        //Insert music at exit clip start
        ap.aTrackTwo.insertClip(ap.fhdMusic, exitClip.start.seconds);

        return true;
    }

    function setMusicDuration() {
        /*Get the last pre-interview clip end time, subtract it by 5 seconds, 
        then assign it as the start time of the music clip*/
        var musicClipStart = ap.preInterviewVClip[ap.preInterviewVClip.length - 1].end.seconds - 5;
        //Prevent the music from overlapping the intro sound
        if (musicClipStart < ap.introAClip.end.seconds) {
            musicClipStart = ap.introAClip.end.seconds + 1;
        }
        ap.setClipStart(ap.fhdMusicClip, musicClipStart);

        /*Get the first post-interview clip start time, add 5 seconds, 
        then assign it as the end time of the music clip*/
        var musicClipEnd = ap.postInterviewVClip[0].start.seconds + 5;
        //Prevent the music from overlapping the outro sound
        if (musicClipEnd > ap.outroMaskAClip.end.seconds) {
            musicClipEnd = ap.outroMaskAClip.end.seconds - 1;
        }
        ap.setClipEnd(ap.fhdMusicClip, musicClipEnd);

        /*Since we adjusted the clip start, we also need to adjust the
        clip in-point again so the drop will align in the exit clip again.
        We do this by getting the difference between the start of the exit clip
        and the new start time of the music clip then subtracting it from the current in-point*/
        var musicDropInPoint = ap.fhdMusicClip.inPoint.seconds - (exitClip.start.seconds - ap.fhdMusicClip.start.seconds);
        ap.setClipInPoint(ap.fhdMusicClip, musicDropInPoint);
    }

    function addWatermark() {
        //Insert the watermark file aligned with the end time of the first pre-interview clip
        ap.vTrackTwo.insertClip(ap.fhdWatermark, ap.preInterviewVClip[0].end.seconds);

        //Initialize the properties for video track two
        ap.vTrackTwoClipsInitialize();

        //Adjust the start and end point of the watermark clip to cover the whole video
        ap.setClipStart(ap.watermarkClip, ap.introMaskVClip.end.seconds);
        ap.setClipEnd(ap.watermarkClip, ap.outroMaskVClip.start.seconds);
    }

    function setWatermarkComponent() {
        var watermarkOpacity = ap.watermarkClip.components[0].properties[0];
        var watermarkScale = ap.watermarkClip.components[1].properties[1];
        var watermarkPosition = ap.watermarkClip.components[1].properties[0];

        watermarkOpacity.setValue(50, 1);
        watermarkScale.setValue(75, 1);
        watermarkPosition.setValue([0.685, 0.685], 1);
    }

    function addTransitions() {
        //Initialize the tracks that contains the clips where we will add transitions in QE mode
        ap.qeClipsToVarInitialize();

        //Initialize transition properties
        ap.videoTransitionsInitialize();
        ap.audioTransitionsInitialize();

        /*Loop through all the initialize clips and insert a transition at the correct position
        The first parameter is the clip on where the transition will be added
        The second parameter is the transition to be used
        The third parameter is the position of the transition wether it's going to be at the 'start', 'end', or 'both' positions
        The fourth parameter is the length or duration of the transition in timecode format*/

        var transitionDuration = '00:00:01:00';

        //Video Track One Clips
        for (var i = 0; i < ap.qePreInterviewVClip.length; i++) {
            ap.addTransition(ap.qePreInterviewVClip[i], ap.crossDissolve, "end", transitionDuration);
        }

        ap.addTransition(ap.qeStockOneClip, ap.crossDissolve, "both", transitionDuration);
        ap.addTransition(ap.qeStockTwoClip, ap.crossDissolve, "both", transitionDuration);

        for (var i = 0; i < ap.qeWalkToPlaneVClip.length; i++) {
            ap.addTransition(ap.qeWalkToPlaneVClip[i], ap.crossDissolve, "both", transitionDuration);
        }

        /*For freefall clip, only at at the start of the first element in the array and end of the last element in the array
        This is to ensure there will be no transition during cuts in freefall*/
        ap.addTransition(ap.qeFreefallVClip[0], ap.crossDissolve, "start", transitionDuration);
        ap.addTransition(ap.qeFreefallVClip[ap.qeFreefallVClip.length - 1], ap.crossDissolve, "end", transitionDuration);

        for (var i = 0; i < ap.qeLandingVClip.length; i++) {
            ap.addTransition(ap.qeLandingVClip[i], ap.crossDissolve, "both", transitionDuration);
        }

        for (var i = 0; i < ap.qePostInterviewVClip.length; i++) {
            ap.addTransition(ap.qePostInterviewVClip[i], ap.crossDissolve, "start", transitionDuration);
        }

        for (var i = 0; i < ap.qeUnderCanopyVClip.length; i++) {
            ap.addTransition(ap.qeUnderCanopyVClip[i], ap.crossDissolve, "both", transitionDuration);
        }

        //Audio Track One Clips
        for (var i = 0; i < ap.qePreInterviewAClip.length; i++) {
            ap.addTransition(ap.qePreInterviewAClip[i], ap.constantPower, "end", transitionDuration);
        }

        //If there is more than one post-interview clip, add constant power transition in between
        if (ap.qePostInterviewAClip.length > 1) {
            var lastIndex = ap.qePostInterviewAClip.length - 1;
            for (var i = 0; i < lastIndex; i++) {
                ap.addTransition(ap.qePostInterviewAClip[i], ap.constantPower, "end", transitionDuration);
            }
            ap.addTransition(ap.qePostInterviewAClip[0], ap.exponentialFade, "start", transitionDuration);
            ap.addTransition(ap.qePostInterviewAClip[lastIndex], ap.exponentialFade, "end", transitionDuration);
        } else {
            ap.addTransition(ap.qePostInterviewAClip[0], ap.exponentialFade, "both", transitionDuration);
        }

        //If there is more than one undercanopy clip, add constant power transition in between
        if (ap.qeUnderCanopyAClip.length > 1) {
            var lastIndex = ap.qeUnderCanopyAClip.length - 1;
            for (var i = 0; i < lastIndex; i++) {
                ap.addTransition(ap.qeUnderCanopyAClip[i], ap.constantPower, "end", transitionDuration);
            }
            ap.addTransition(ap.qeUnderCanopyAClip[0], ap.exponentialFade, "start", transitionDuration);
            ap.addTransition(ap.qeUnderCanopyAClip[lastIndex], ap.exponentialFade, "end", transitionDuration);
        } else {
            ap.addTransition(ap.qeUnderCanopyAClip[0], ap.exponentialFade, "both", transitionDuration);
        }
    }

    function adjustMusicVolume() {
        ap.adjustVolume(ap.introAClip, -10);
        ap.adjustVolume(ap.fhdMusicClip, -10);
        ap.adjustVolume(ap.outroMaskAClip, -10);
        ap.adjustVolume(ap.outroAClip, -10);
    }

}

function reframeToVertical() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    //Reframe the sequence to 9:16 aspect ratio
    /*'faster' argument is for the reframe to create as many keyframes as possible
    to follow the action properly. We can set this to 'default' or 'slower' if necessary.*/
    var seqNameSplit = ap.seq.name.split('-');
    var igSeqName = seqNameSplit[0];
    ap.seq.autoReframeSequence(9, 16, 'slower', igSeqName + "- SocialMediaEdit", false);

    //Initialize the sequence property again because auto-reframe creates a new sequence
    ap.activeSeqAndTracksInitialize();
    ap.clipsToVarInitialize();

    //Remove all unnecessary clips for Social Media Edit
    removeUnusedClips();

    //Savepoint
    ap.proj.save();

    // ----------------------------------------------------------------------------------------- //
    // -------------------------------- Reframe to Vertical Functions -------------------------- //
    // ----------------------------------------------------------------------------------------- //

    function removeUnusedClips() {
        ap.removeTrackClips(ap.vTrackTwo);
        ap.removeTrackClips(ap.vTrackThree);
        ap.removeTrackClips(ap.aTrackTwo);
        ap.removeClip(ap.preInterviewVClip);
        ap.removeClip(ap.preInterviewAClip);
        ap.removeClip(ap.stockOneClip);
        ap.removeClip(ap.stockTwoClip);
    }

}

function clipSelect() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    //Get the file path object of the txt database
    var selectedClipsDb = ap.getSelectedClipsDb();

    /*Check if the current txt database exist so that we can pass the existing values
    into our clipId array if there are prior selections. We read the txt database
    to get the key value in a string format and split it with coma to convert it to an array .*/
    var clipId = ap.getClipIdFromDb(selectedClipsDb);
    var previousClipNum = clipId.video.length + clipId.audio.length;

    //Get the selected track item/s in an array
    var clipsSelected = ap.seq.getSelection();

    /*Check if there is a selected clip. We also check the length because for some reason
    the code goes through the if-block even though the selection is undefined.*/
    if (clipsSelected && clipsSelected.length > 0) {

        //Add selected clips to the currenty clip ids array
        updateClipIds(clipId, clipsSelected);

        //Do not accept additional clip id if maximum limit is reached
        if (maximumClipSelected(clipId)) {
            return previousClipNum;
        }

        //Write the clip ids array into the txt database
        ap.writeTxtFile(selectedClipsDb, clipId);
    } else {
        alert("Please select a clip", "Error: Clip Id Not Found", true);
    }

    return clipId.video.length + clipId.audio.length;

    // ----------------------------------------------------------------------------------------- //
    // ----------------------------------- Clip Select Functions ------------------------------- //
    // ----------------------------------------------------------------------------------------- //

    /*Loop through the selection array to add each selected clips nodeID to the existing txt database.*/
    function updateClipIds(ids, selection) {
        for (var i in selection) {
            var vidNodeId = null;
            var audNodeId = null;
            var isDuplicate = false;
            var selectedClip = selection[i];
            if (selectedClip.mediaType == "Video") {
                vidNodeId = selectedClip.nodeId;
                for (var i in ids.video) {
                    if (ids.video[i] === vidNodeId) {
                        isDuplicate = true;
                    }
                }
            } else if (selectedClip.mediaType == "Audio") {
                audNodeId = selectedClip.nodeId;
                for (var i in ids.audio) {
                    if (ids.audio[i] === audNodeId) {
                        isDuplicate = true;
                    }
                }
            }

            //Check if there's no duplicate and append to the correct key array.
            if (!isDuplicate) {
                if (vidNodeId !== null) {
                    ids.video.push(vidNodeId);
                }
                if (audNodeId !== null) {
                    ids.audio.push(audNodeId);
                }
            }
        }
    }

    function maximumClipSelected(ids) {
        var maxVidSelection = ap.getBin("HC Videos") ? 13 : 11;
        var maxAudSelection = ap.getBin("HC Videos") ? 2 : 1;

        if (ids.video.length > maxVidSelection) {
            alert("Reached maximum video clip selection", "Error: Invalid Selection", true);
            return true;
        } else if (ids.audio.length > maxAudSelection) {
            alert("Reached maximum audio clip selection", "Error: Invalid Selection", true);
            return true;
        } else {
            return false;
        }
    }
}

function decrementSelection() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    var selectedClipsDb = ap.getSelectedClipsDb();
    var clipId = ap.getClipIdFromDb(selectedClipsDb);

    /*We can create a separate button to select whether we want 
    to pop either the video or audio node ID, only if necessary.*/
    clipId.video.pop();
    clipId.audio.pop();

    ap.writeTxtFile(selectedClipsDb, clipId);
    return clipId.video.length + clipId.audio.length;
}


function resetSelection() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    var selectedClipsDb = ap.getSelectedClipsDb();

    //Delete the existing txt db
    selectedClipsDb.remove();
}

function alignClipsToSocialMediaEdit() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    var selectedClipsDb = ap.getSelectedClipsDb();
    var clipId = ap.getClipIdFromDb(selectedClipsDb);

    /*Remove all clips in video track one and audio track one that is not selected 
    based on the txt db selectedClipsDb*/
    removeUnselectedVideoClips(clipId.video);
    removeUnselectedAudioClips(clipId.audio);
    //Delete the existing txt db
    selectedClipsDb.remove();

    //Initialize Social Media Clips
    ap.socMedVClipsInitialize();
    ap.socMedAClipsInitialize();

    //Remove clips that cannot be used because of excess or incorrect selection from txt db
    removeExcessClips();

    //Finalize the clips variable and time position
    ap.socMedClipsToVar();
    ap.socMedClipsTimePosVar();

    //Align and compress Social Media clips together
    alignClipsToTimePos();

    //Create the three montage clips
    insertMontage();

    //Import template files for Social Media Edit and insert the clips to track
    importSocMedTemplate();
    insertSocMedFiles();

    //Adjust Music end to exactly 60 seconds because for some reason we cannot render it accurately
    ap.socMedTemplateClipsInitialize();
    ap.smMusicClip.end = ap.newTimeObject(60);

    //Savepoint
    ap.proj.save();

    // ----------------------------------------------------------------------------------------- //
    // ----------------------------------- Align Clips Functions ------------------------------- //
    // ----------------------------------------------------------------------------------------- //

    function removeUnselectedVideoClips(vidArray) {
        for (var i = 0; i < ap.vTrackOne.clips.length; i++) {
            var vidClip = ap.vTrackOne.clips[i];
            var insideDb = false;
            for (var id in vidArray) {
                if (vidClip.nodeId === vidArray[id]) {
                    insideDb = true;
                }
            }

            if (!insideDb) {
                //Decrement the loop counter if a clip is removed
                vidClip.remove(0, 0);
                i--;
            }
        }
    }

    function removeUnselectedAudioClips(audArray) {
        for (var i = 0; i < ap.aTrackOne.clips.length; i++) {
            var audClip = ap.aTrackOne.clips[i];
            var insideDb = false;
            for (var id in audArray) {
                if (audClip.nodeId === audArray[id]) {
                    insideDb = true;
                }
            }

            if (!insideDb) {
                audClip.remove(0, 0);
                //Decrement the loop counter if a clip is removed
                i--;
            }
        }
    }

    function importSocMedTemplate() {
        var srcFolder = ap.getSrcFolder();
        var socMedFolder = new Folder(srcFolder + "/socmed");
        ap.createBin("Social Media");
        ap.importToProject(socMedFolder.getFiles(), ap.socmedBin);
    }

    function insertSocMedFiles() {
        ap.socMedToVarInitialize();
        ap.vTrackTwo.insertClip(ap.socMedIntro, 0);
        ap.vTrackTwo.insertClip(ap.socMedStockShot, ap.newTimeObject(ap.smStockShotStart));
        ap.aTrackTwo.insertClip(ap.socMedMusic, 0);
    }

    function removeExcessClips() {
        ap.removeExcessSocMedClips(ap.smWalkToPlaneVClips, 2);
        ap.removeExcessSocMedClips(ap.smFreeFallVClips, 7);
        ap.removeExcessSocMedClips(ap.smLandingVClip, 1);
        ap.removeExcessSocMedClips(ap.smPostInterviewVClip, 1);
        ap.removeExcessSocMedClips(ap.smPostInterviewAClip, 1);
        ap.removeExcessSocMedClips(ap.smHandicamViewVClip, 1);
        ap.removeExcessSocMedClips(ap.smUnderCanopyVClip, 1);
        ap.removeExcessSocMedClips(ap.smUnderCanopyAClip, 1);

        //Re-initialize the clips variables
        ap.socMedVClipsInitialize();
        ap.socMedAClipsInitialize();
    }

    /*Align each clips to the predefined time position that matches the beat of the music.
    alighnClipsToTime parameters: (1)clip, (2)move to start time, (3)extend/contract to end time.
    extendClipStart: Extend the start time and inpoint of the clip. This is used because twixtor 
    clips slow-mo immediately so we need more frames ahead of it.*/
    function alignClipsToTimePos() {
        ap.alignClipsToTime(ap.smWalkOneClip, ap.smWalkToPlaneOneStart, ap.smWalkToPlaneOneEnd);
        ap.alignClipsToTime(ap.smWalkTwoClip, ap.smWalkToPlaneTwoStart, ap.smWalkToPlaneTwoEnd);
        ap.alignClipsToTime(ap.smExitClip, ap.smExitStart, ap.smExitEnd);
        ap.extendClipStart(ap.smExitClip, ap.smStockShotEnd);
        ap.alignClipsToTime(ap.smFirstCloseUpClip, ap.smFirstCloseUpStart, ap.smFirstCloseUpEnd);
        ap.alignClipsToTime(ap.smFirstPalmClip, ap.smFirstPalmStart, ap.smFirstPalmEnd);
        ap.alignClipsToTime(ap.smOrbitClip, ap.smOrbitStart, ap.smOrbitEnd);
        ap.alignClipsToTime(ap.smHcOrbitClip, ap.smHandicamOrbitStart, ap.smHandicamOrbitEnd);
        ap.alignClipsToTime(ap.smSecondPalmClip, ap.smSecondPalmStart, ap.smSecondPalmEnd);
        ap.alignClipsToTime(ap.smSecondCloseUpClip, ap.smSecondCloseUpStart, ap.smSecondCloseUpEnd);
        ap.alignClipsToTime(ap.smOpeningClip, ap.smOpeningStart, ap.smOpeningEnd);
        ap.extendClipStart(ap.smOpeningClip, ap.smSecondCloseUpEnd);
        ap.alignClipsToTime(ap.smCanopyVClip, ap.smUnderCanopyStart, ap.smUnderCanopyEnd);
        ap.alignClipsToTime(ap.smCanopyAClip, ap.smUnderCanopyStart, ap.smUnderCanopyEnd);
        ap.alignClipsToTime(ap.smLandingClip, ap.smLandingStart, ap.smLandingEnd);
        ap.alignClipsToTime(ap.smInterviewVClip, ap.smPostInterviewStart, ap.smPostInterviewEnd);
        ap.alignClipsToTime(ap.smInterviewAClip, ap.smPostInterviewStart, ap.smPostInterviewEnd);
    }

    function insertMontage() {

        /*Inserts montage clips using the insertAndRename method. 
        We are doing a rename so that the clips can be detected as montage clips later on.
        The method parameter takes a project file whose in-point and out-point
        are initially set using the getMontage function.
        The duration argument we pass in the getMontage function is taken from
        the predefined montageEnd - montageStart in socMedClipsTimePosVar() function*/
        insertAndRename(getMontage(ap.smExitClip, 2), ap.smMontageOneStart);
        insertAndRename(getMontage(ap.smOrbitClip, 1.36), ap.smMontageTwoStart);
        insertAndRename(getMontage(ap.smOpeningClip, 1.68), ap.smMontageThreeStart);

        function getMontage(clip, duration) {
            var montageItem = clip.projectItem;
            var montageInPoint = clip.inPoint.seconds;
            var montageOutPoint = montageInPoint + duration;
            ap.setInAndOut(montageItem, montageInPoint, montageOutPoint)

            return montageItem;
        }

        function insertAndRename(projItem, insertPos) {
            var projectItemName = projItem.name;
            projItem.name = "Montage";
            ap.vTrackOne.overwriteClip(projItem, insertPos);
            projItem.name = projectItemName;
        }
    }
}

function applyEffectsAndTransitionsToSME() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();
    ap.binInitialize();
    ap.socMedVClipsInitialize();
    ap.socMedAClipsInitialize();
    ap.socMedClipsToVar();
    ap.initializeQEProject();
    ap.activeQESeqAndTracksInitialize();
    ap.videoTransitionsInitialize();
    ap.audioTransitionsInitialize();
    ap.videoEffectsInitialize();
    ap.qeSocMedVClipsInitialize();
    ap.qeSocMedAClipsInitialize();
    ap.qeSocMedTemplateClipsInitialize();
    ap.qeSocMedClipsToVar();

    //Get the adjustment layer and set its duration to 12 frames
    var adjustmentLayer = ap.getAdjustmentLayerItem();
    if (adjustmentLayer) {
        adjustmentLayer.setOutPoint(ap.framesToSeconds(12), 4);
    } else {
        alert("Adjustment Layer Not Detected", "Error: Missing Item", false);
        return;
    }

    //Apply slow-motion to certain clips
    addEffectSME();

    //Apply cross-dissolve and dip-to-black transitions
    addRegularTransitionSME();

    //Insert adjustment layers and modify their components to act as a transition
    addCustomizedTransitionSME();

    //Duck the music clip against the audio clips
    ap.autoDuck();

    // ----------------------------------------------------------------------------------------- //
    // ------------------------- SME Effects and Transitions Functions ------------------------- //
    // ----------------------------------------------------------------------------------------- //

    function addEffectSME() {
        ap.setClipSpeed(ap.qeSmMontageOneClip, .5);
        ap.setClipSpeed(ap.qeSmMontageTwoClip, .5);
        ap.setClipSpeed(ap.qeSmMontageThreeClip, .5);
        ap.setClipSpeed(ap.qeSmSecondPalmClip, .5);

        if (!ap.qeSmHcOrbitClip) {
            ap.setClipSpeed(ap.qeSmOrbitClip, .5);
        }

        if (!ap.qeSmCanopyVClip) {
            ap.setClipSpeed(ap.qeSmLandingClip, .5);
        }
    }

    function addRegularTransitionSME() {
        var dipToBlackDuration = '00:00:00:15';
        var crossDissolveDuration = '00:00:00:25'

        ap.addTransition(ap.qeSmMontageOneClip, ap.dipToBlack, "start", dipToBlackDuration);
        ap.addTransition(ap.qeSmMontageTwoClip, ap.dipToBlack, "start", dipToBlackDuration);
        ap.addTransition(ap.qeSmMontageThreeClip, ap.dipToBlack, "both", dipToBlackDuration);

        ap.addTransition(ap.qeSmCanopyVClip, ap.crossDissolve, "start", crossDissolveDuration);
        ap.addTransition(ap.qeSmLandingClip, ap.crossDissolve, "both", crossDissolveDuration);
        ap.addTransition(ap.qeSmInterviewVClip, ap.dipToBlack, "end", crossDissolveDuration);
        ap.addTransition(ap.qeSmInterviewAClip, ap.exponentialFade, "both", crossDissolveDuration);
    }

    function addCustomizedTransitionSME() {
        //Insert adjustment layers in video track three
        insertAdjustmentLayers(ap.smWalkTwoClip);
        insertAdjustmentLayers(ap.smFirstCloseUpClip);
        insertAdjustmentLayers(ap.smFirstPalmClip);
        insertAdjustmentLayers(ap.smOrbitClip);
        insertAdjustmentLayers(ap.smHcOrbitClip);
        insertAdjustmentLayers(ap.smSecondPalmClip);
        insertAdjustmentLayers(ap.smSecondCloseUpClip);
        insertAdjustmentLayers(ap.smOpeningClip);

        //Initialize adjustment layers to variables
        ap.adjustmentLayersToVar();
        ap.qeAdjustmentLayersToVar();

        //Add a transform effect to the adjustment layers and modify its components
        addEffectToAdjustmentLayers();


        function insertAdjustmentLayers(clip) {
            var frames = 6;
            if (clip) {
                ap.vTrackThree.overwriteClip(adjustmentLayer, clip.start.seconds - ap.framesToSeconds(frames));
            }
        }

        function addEffectToAdjustmentLayers() {
            for (var i in ap.qeAdjustmentLayerClips) {
                var qeAdjustmentLayerClip = ap.qeAdjustmentLayerClips[i];
                qeAdjustmentLayerClip.addVideoEffect(ap.transformEffect);
            }

            for (var i in ap.adjustmentLayerClips) {
                var adjustmentLayerClip = ap.adjustmentLayerClips[i];
                var transformComponent = adjustmentLayerClip.components[2];

                var prop = {
                    uniformScale: transformComponent.properties[2],
                    scale: transformComponent.properties[3],
                    useCompositionShutterAngle: transformComponent.properties[9],
                    shutterAngle: transformComponent.properties[10]
                };

                prop.uniformScale.setValue(true, 1);
                prop.useCompositionShutterAngle.setValue(false, 1);
                prop.shutterAngle.setValue(180, 1);

                prop.scale.setTimeVarying(true);

                var keyTimes = [0, 0.02, 0.04, 0.06, 0.08, 0.10, 0.11, 0.12, 0.14, 0.16, 0.18, 0.20, 0.22, 0.24];
                var keyValues = [100, 101.3, 104, 108.6, 116.3, 131, 150, 300, 184.7, 144.6, 121.8, 108.6, 101.9, 100];

                for (var i = 0; i < keyTimes.length; i++) {
                    prop.scale.addKey(adjustmentLayerClip.inPoint.seconds + keyTimes[i]);
                    prop.scale.setValueAtKey(adjustmentLayerClip.inPoint.seconds + keyTimes[i], keyValues[i]);
                    prop.scale.setInterpolationTypeAtKey(adjustmentLayerClip.inPoint.seconds + keyTimes[i], 3, 1);
                    prop.scale.setInterpolationTypeAtKey(adjustmentLayerClip.inPoint.seconds + keyTimes[i], 5, 1);
                }
            }
        }
    }
}

function renderProject() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();

    var srcFolder = ap.getSrcFolder();
    var presetFolder = new Folder(srcFolder + "/render");
    var fhdPreset = presetFolder.fsName + "\\" + "FullHDPreset.epr";
    var SMEPreset = presetFolder.fsName + "\\" + "IGPreset.epr";

    var renderFolderName = "Rendered Files";
    var renderFolder = ap.createRenderFolder(renderFolderName);

    var projectSequences = ap.proj.sequences;

    //Render all project sequences
    renderSequencesInAME(projectSequences);

    //Save and close project file. Parameter: (saveFirst, promptUserForChanges)
    ap.proj.closeDocument(1, 0);

    function renderSequencesInAME(sequences) {
        for (var i = 0; i < sequences.length; i++) {
            var sequence = sequences[i];
            var sequenceName = sequence.name;

            //Convert the sequence name to array per empty space
            var splitName = sequenceName.split(' ');

            //Get the last element in the array to determine if its FHD or MV
            var isFhdOrSME = splitName[splitName.length - 1];

            //Get the render file name from joining the array from the third element onward
            var renderName = splitName.slice(2).join(' ');

            var renderPath = renderFolder.fsName + "\\" + renderName + ".mp4";

            if (isFhdOrSME === "FullHD") {
                var encoded = ap.encoder.encodeSequence(sequence, renderPath, fhdPreset, 2, 1);
            } else if (isFhdOrSME === "SocialMediaEdit") {
                var encoded = ap.encoder.encodeSequence(sequence, renderPath, SMEPreset, 2, 1);
            } else {
                alert("Cannot render sequence that is not ending with FullHD or SocialMediaEdit", "Error: Incorrect Sequence", true)
            }

            if (!encoded) {
                alert("Failed to send the sequence to Adobe Media Encoder", "Error: Encoding Error", true);
            }
        }

        app.encoder.startBatch();
    }
}

function autoDuckMusic() {
    var ap = new ActiveProject();
    ap.initializeCurrentProject();
    ap.activeSeqAndTracksInitialize();

    ap.autoDuck();
}
