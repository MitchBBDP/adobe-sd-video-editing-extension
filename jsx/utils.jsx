﻿function ActiveProject() {

}

//Initialize active project
ActiveProject.prototype.initializeCurrentProject = function() {
    this.proj = app.project;
    this.projPath = app.project.path;
    this.projRoot = app.project.rootItem;
    this.masterBin = app.project.rootItem.children;
    this.encoder = app.encoder;
};

//Initialize sequence and tracks for the active project
ActiveProject.prototype.activeSeqAndTracksInitialize = function() {
    this.seq = app.project.activeSequence;
    this.vTrack = this.seq.videoTracks;
    this.vTrackOne = this.vTrack[0];
    this.vTrackTwo = this.vTrack[1];
    this.vTrackThree = this.vTrack[2];
    this.aTrack = this.seq.audioTracks;
    this.aTrackOne = this.aTrack[0];
    this.aTrackTwo = this.aTrack[1];
    this.aTrackThree = this.aTrack[2];
};

//Find bin by name
ActiveProject.prototype.getBin = function(binName) {
    for (var i = 0; i < this.masterBin.length; i++) {
        if (this.masterBin[i].name == binName) {
            return this.masterBin[i];
        }
    }
    return null;
};

// Initialize bin properties for the active project
ActiveProject.prototype.binInitialize = function() {
    this.templateBin = this.getBin("Template");
    this.vidBin = this.getBin("Videos");
    this.subClipsBin = this.getBin("Sub Clips");
    this.hcBin = this.getBin("HC Videos");
    this.socmedBin = this.getBin("Social Media");
};

//Create bin for the active project
ActiveProject.prototype.createBin = function(binName) {
    if (binName === "Videos")
        this.vidBin = this.projRoot.createBin(binName);
    else if (binName === "Template")
        this.templateBin = this.projRoot.createBin(binName);
    else if (binName === "Sub Clips")
        this.subClipsBin = this.projRoot.createBin(binName);
    else if (binName === "HC Videos")
        this.hcBin = this.projRoot.createBin(binName);
    else if (binName === "Social Media")
        this.socmedBin = this.projRoot.createBin(binName);
};

//Create subclips to remove audio
ActiveProject.prototype.convertToSubclip = function(clip) {
    var subClip = clip.createSubClip(clip.name + " - subclip", clip.getInPoint().ticks, clip.getOutPoint().ticks, 0, 1, 0);
    subClip.moveBin(this.subClipsBin);
    return subClip;
};

//Assign Tandem Videos to Properties
ActiveProject.prototype.fhdVidsToVarInitialize = function(hasBoard) {
    var vidBinFiles = this.vidBin.children;
    this.numOfVidClips = vidBinFiles.length;
    this.hasLanding = false;
    this.postInterview = [];
    if (hasBoard) {
        this.board = vidBinFiles[0];
        this.preInterview = vidBinFiles[1];
        this.walkToPlane = vidBinFiles[2];
        this.freefall = vidBinFiles[3];
        if (this.numOfVidClips > 5) {
            this.landing = vidBinFiles[4];
            this.hasLanding = true;
        }
        var postInterviewStart = this.hasLanding ? 5 : 4;
        for (var i = postInterviewStart; i < this.numOfVidClips; i++) {
            this.postInterview.push(vidBinFiles[i]);
        }
    } else {
        this.preInterview = vidBinFiles[0];
        this.walkToPlane = vidBinFiles[1];
        this.freefall = vidBinFiles[2];
        if (this.numOfVidClips > 4) {
            this.landing = vidBinFiles[3];
            this.hasLanding = true;
        }
        var postInterviewStart = this.hasLanding ? 4 : 3;
        for (var i = postInterviewStart; i < this.numOfVidClips; i++) {
            this.postInterview.push(vidBinFiles[i]);
        }
    }
};

//Assign Stock Files to Properties
ActiveProject.prototype.templateToVarInitialize = function() {
    var templateBinFiles = this.templateBin.children;
    this.fhdIntro = templateBinFiles[0];
    this.fhdIntroMask = templateBinFiles[1];
    this.fhdStockOne = templateBinFiles[2];
    this.fhdStockTwo = templateBinFiles[3];
    this.fhdOutroMask = templateBinFiles[4];
    this.fhdOutro = templateBinFiles[5];
    this.fhdIntroSound = templateBinFiles[6];
    this.fhdLowerThirds = templateBinFiles[7];
    this.fhdWatermark = templateBinFiles[8];
    this.fhdMusic = templateBinFiles[9];
};

//Assign Social Media Stock Files to Properties
ActiveProject.prototype.socMedToVarInitialize = function() {
    var socMedBinFiles = this.socmedBin.children;
    this.socMedIntro = socMedBinFiles[0];
    this.socMedStockShot = socMedBinFiles[1];
    this.socMedMusic = socMedBinFiles[2];
};

//Assign Handicam Clips to Properties
ActiveProject.prototype.hcVidsToVarInitialize = function() {
    var hcBinFiles = this.hcBin.children;
    this.underCanopy = [];
    this.handicamView = hcBinFiles[0];
    if (hcBinFiles.length > 1) {
        for (var i = 1; i < hcBinFiles.length; i++) {
            this.underCanopy.push(hcBinFiles[i]);
        }
    }
};

//Assign active fhd clips to properties
ActiveProject.prototype.clipsToVarInitialize = function() {
    this.vTrackOneClipsInitialize();
    this.vTrackTwoClipsInitialize();
    this.vTrackThreeClipsInitialize();
    this.aTrackOneClipsInitialize();
    this.aTrackTwoClipsInitialize();
};

ActiveProject.prototype.vTrackOneClipsInitialize = function() {
    this.preInterviewVClip = [], this.walkToPlaneVClip = [], this.freefallVClip = [], this.landingVClip = [], this.postInterviewVClip = [], this.underCanopyVClip = [];
    for (var i = 0; i < this.vTrackOne.clips.length; i++) {
        var clip = this.vTrackOne.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("preinterview") != -1) {
            this.preInterviewVClip.push(clip);
        } else if (clipName.indexOf("walktoplane") != -1) {
            this.walkToPlaneVClip.push(clip);
        } else if (clipName.indexOf("freefall") != -1) {
            this.freefallVClip.push(clip);
        } else if (clipName.indexOf("landing") != -1) {
            this.landingVClip.push(clip);
        } else if (clipName.indexOf("postinterview") != -1) {
            this.postInterviewVClip.push(clip);
        } else if (clipName.indexOf("handicamview") != -1) {
            this.handicamViewVClip = clip;
        } else if (clipName.indexOf("undercanopy") != -1) {
            this.underCanopyVClip.push(clip);
        } else if (clipName.indexOf("stockshot1") != -1) {
            this.stockOneClip = clip;
        } else if (clipName.indexOf("stockshot2") != -1) {
            this.stockTwoClip = clip;
        }
    }
};

ActiveProject.prototype.vTrackTwoClipsInitialize = function() {
    for (var i = 0; i < this.vTrackTwo.clips.length; i++) {
        var clip = this.vTrackTwo.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("intro") != -1) {
            this.introVClip = clip;
        } else if (clipName.indexOf("imask") != -1) {
            this.introMaskVClip = clip;
        } else if (clipName.indexOf("omask") != -1) {
            this.outroMaskVClip = clip;
        } else if (clipName.indexOf("outro") != -1) {
            this.outroVClip = clip;
        } else if (clipName.indexOf("watermark") != -1) {
            this.watermarkClip = clip;
        }
    }
};

ActiveProject.prototype.vTrackThreeClipsInitialize = function() {
    for (var i = 0; i < this.vTrackThree.clips.length; i++) {
        var clip = this.vTrackThree.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("lower thirds") != -1) {
            this.lowerThirdsClip = clip;
        } else if (clipName.indexOf("copyrights") != -1) {
            this.copyrightClip = clip;
        }
    }
};

ActiveProject.prototype.aTrackOneClipsInitialize = function() {
    this.preInterviewAClip = [], this.postInterviewAClip = [], this.underCanopyAClip = [];
    for (var i = 0; i < this.aTrackOne.clips.length; i++) {
        var clip = this.aTrackOne.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("preinterview") != -1) {
            this.preInterviewAClip.push(clip);
        } else if (clipName.indexOf("postinterview") != -1) {
            this.postInterviewAClip.push(clip);
        } else if (clipName.indexOf("undercanopy") != -1) {
            this.underCanopyAClip.push(clip);
        }
    }
};

ActiveProject.prototype.aTrackTwoClipsInitialize = function() {
    for (var i = 0; i < this.aTrackTwo.clips.length; i++) {
        var clip = this.aTrackTwo.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("intro") != -1) {
            this.introAClip = clip;
        } else if (clipName.indexOf("omask") != -1) {
            this.outroMaskAClip = clip;
        } else if (clipName.indexOf("outro") != -1) {
            this.outroAClip = clip;
        } else if (clipName.indexOf("music") != -1) {
            this.fhdMusicClip = clip;
        }
    }
};

ActiveProject.prototype.socMedVClipsInitialize = function() {
    this.smMontageVClips = [], this.smWalkToPlaneVClips = [], this.smFreeFallVClips = [], this.smLandingVClip = [], this.smPostInterviewVClip = [], this.smHandicamViewVClip = [], this.smUnderCanopyVClip = [];
    for (var i = 0; i < this.vTrackOne.clips.length; i++) {
        var clip = this.vTrackOne.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("montage") != -1) {
            this.smMontageVClips.push(clip);
        } else if (clipName.indexOf("walktoplane") != -1) {
            this.smWalkToPlaneVClips.push(clip);
        } else if (clipName.indexOf("freefall") != -1) {
            this.smFreeFallVClips.push(clip);
        } else if (clipName.indexOf("landing") != -1) {
            this.smLandingVClip.push(clip);
        } else if (clipName.indexOf("postinterview") != -1) {
            this.smPostInterviewVClip.push(clip);
        } else if (clipName.indexOf("handicamview") != -1) {
            this.smHandicamViewVClip.push(clip);
        } else if (clipName.indexOf("undercanopy") != -1) {
            this.smUnderCanopyVClip.push(clip);
        }
    }
};

ActiveProject.prototype.socMedAClipsInitialize = function() {
    this.smPostInterviewAClip = [], this.smUnderCanopyAClip = [];
    for (var i = 0; i < this.aTrackOne.clips.length; i++) {
        var clip = this.aTrackOne.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("postinterview") != -1) {
            this.smPostInterviewAClip.push(clip);
        } else if (clipName.indexOf("undercanopy") != -1) {
            this.smUnderCanopyAClip.push(clip);
        }
    }
};

ActiveProject.prototype.socMedTemplateClipsInitialize = function() {
    for (var i = 0; i < this.vTrackTwo.clips.length; i++) {
        var clip = this.vTrackTwo.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("intro") != -1) {
            this.smIntroClip = clip;
        } else if (clipName.indexOf("stockshot") != -1) {
            this.smStockShotClip = clip;
        }
    }

    for (var i = 0; i < this.aTrackTwo.clips.length; i++) {
        var clip = this.aTrackTwo.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("music") != -1) {
            this.smMusicClip = clip;
        }
    }
};

ActiveProject.prototype.socMedClipsToVar = function() {
    this.smWalkOneClip = this.smWalkToPlaneVClips[0];
    this.smWalkTwoClip = this.smWalkToPlaneVClips[1];
    this.smExitClip = this.smFreeFallVClips[0];
    this.smFirstCloseUpClip = this.smFreeFallVClips[1];
    this.smFirstPalmClip = this.smFreeFallVClips[2];
    this.smOrbitClip = this.smFreeFallVClips[3];
    this.smSecondPalmClip = this.smFreeFallVClips[4];
    this.smSecondCloseUpClip = this.smFreeFallVClips[5];
    this.smOpeningClip = this.smFreeFallVClips[6];
    this.smLandingClip = this.smLandingVClip[0];
    this.smInterviewVClip = this.smPostInterviewVClip[0];
    this.smInterviewAClip = this.smPostInterviewAClip[0];
    this.smHcOrbitClip = this.smHandicamViewVClip[0];
    this.smCanopyVClip = this.smUnderCanopyVClip[0];
    this.smCanopyAClip = this.smUnderCanopyAClip[0];
    this.smMontageOneClip = this.smMontageVClips[0];
    this.smMontageTwoClip = this.smMontageVClips[1];
    this.smMontageThreeClip = this.smMontageVClips[2];
};

//Initialize the variable for the start and end time for each clip in the Social Media Edit
ActiveProject.prototype.socMedClipsTimePosVar = function() {
    var timePoints = [
        ["smIntro", 0, 1.52],
        ["smMontageOne", 1.32, 3.32],
        ["smMontageTwo", 3.32, 4.68],
        ["smMontageThree", 4.68, 6.36],
        ["smWalkToPlaneOne", 6.36, 8],
        ["smWalkToPlaneTwo", 8, 9.64],
        ["smStockShot", 9.64, 17.239],
        ["smExit", 18.719, 22.28],
        ["smFirstCloseUp", 22.28, 25.44],
        ["smFirstPalm", 25.44, 28.64],
        ["smSecondPalm", 31.76, 34.92],
        ["smSecondCloseUp", 34.92, 38.08],
        ["smOpening", 39.08, 44.4],
        ["smPostInterview", 49.42, 60]
    ];

    if (this.smHandicamViewVClip.length == 0) {
        timePoints.push(["smOrbit", 28.64, 31.76]);
    } else {
        timePoints.push(["smOrbit", 28.64, 30.2]);
        timePoints.push(["smHandicamOrbit", 30.2, 31.76]);
    }

    if (this.smUnderCanopyVClip.length == 0) {
        timePoints.push(["smLanding", 44.4, 49.42]);
    } else {
        timePoints.push(["smUnderCanopy", 44.4, 46.91]);
        timePoints.push(["smLanding", 46.91, 49.42]);
    }

    //Generate a start and end property for each clip using the defined timePoints object.
    for (var i = 0; i < timePoints.length; i++) {
        var prefix = timePoints[i][0];
        this[prefix + "Start"] = timePoints[i][1];
        this[prefix + "End"] = timePoints[i][2];
    }
};

ActiveProject.prototype.adjustmentLayersToVar = function() {
    this.adjustmentLayerClips = [];
    for (i = 0; i < this.vTrackThree.clips.length; i++) {
        var clip = this.vTrackThree.clips[i];
        if (clip.isAdjustmentLayer()) {
            this.adjustmentLayerClips.push(clip);
        }
    }
};

//Get the clips array and the maximum number of array length in order to remove any excess clips
ActiveProject.prototype.removeExcessSocMedClips = function(clipArray, max) {
    /*Check if clip is postinterview:
    (1) If there is a landing clip, remove all postinterview video clip except the last element
    (2) If there is no landing clip, rename the first clip to "Landing" and keep the last element
    (3) If the clip is audio, keep only the last element
    If the clip is not post interview, remove all excess clips*/
    if (clipArray.length > 0) {
        if (clipArray[0].name.toLowerCase().indexOf("postinterview") != -1 && clipArray.length > max) {
            if (this.smLandingVClip.length > 0 || clipArray[0].mediaType == "Audio") {
                for (var i = 0; i < clipArray.length - 1; i++) {
                    clipArray[i].remove(0, 0);
                }
            } else {
                clipArray[0].name = "Landing";
                for (var i = 1; i < clipArray.length - 1; i++) {
                    clipArray[i].remove(0, 0);
                }
            }
        } else if (clipArray.length > max) {
            for (var i = max; i < clipArray.length; i++) {
                clipArray[i].remove(0, 0);
            }
        }
    }
};

ActiveProject.prototype.alignClipsToTime = function(clip, startPos, endPos) {
    if (clip) {
        //Subtract defined time position and clip start to get how many seconds the clip needs to move
        var secondsToMove = startPos - clip.start.seconds;
        clip.move(secondsToMove);

        //Extend or shorten the clip if necessary
        clip.projectItem.clearOutPoint();
        var originalDuration = clip.projectItem.getOutPoint().seconds;

        var maxClipEnd = this.newTimeObject(clip.start.seconds - clip.inPoint.seconds + originalDuration);
        var newClipEnd = this.newTimeObject(endPos);
        var modifiedDuration = newClipEnd.seconds - clip.start.seconds + clip.inPoint.seconds;
        var excessDuration = (newClipEnd.seconds - clip.start.seconds) - (maxClipEnd.seconds - clip.start.seconds);

        clip.end = newClipEnd;

        if (modifiedDuration > originalDuration) {
            clip.inPoint = this.newTimeObject(clip.inPoint.seconds - excessDuration);
        }

        if (clip.duration.seconds > originalDuration) {
            clip.inPoint = this.newTimeObject(0);
            clip.end = this.newTimeObject(clip.start.seconds + originalDuration);
        }
    }
};

ActiveProject.prototype.extendClipStart = function(clip, newStart) {
    if (clip) {
        var testing = newStart;
        var test = clip.start.seconds;
        var inPointAdjust = clip.start.seconds - newStart;

        clip.start = this.newTimeObject(newStart)
        clip.inPoint = this.newTimeObject(clip.inPoint.seconds - inPointAdjust);
    }
};

//Trim the project files in-point and out-point
ActiveProject.prototype.trimInAndOutPoint = function(bin) {
    var binFiles = bin.children;

    if (bin.name.toLowerCase() == "template") {
        this.fhdStockOne.setInPoint(this.fhdStockOne.getInPoint().seconds + 1, 4);
        this.fhdStockOne.setOutPoint(this.fhdStockOne.getOutPoint().seconds - 1, 4);
        this.fhdStockTwo.setInPoint(this.fhdStockTwo.getInPoint().seconds + 1, 4);
        this.fhdStockTwo.setOutPoint(this.fhdStockTwo.getOutPoint().seconds - 1, 4);
    } else {
        for (var i = 0; i < binFiles.length; i++) {
            var projectFile = binFiles[i];
            var fileOutPoint = projectFile.getOutPoint().seconds;
            var fileInPoint = projectFile.getInPoint().seconds;

            //Adjust the in-point or out-point of project file if its not an interview clip
            //Also exclude the intro mask subclip from the trim
            if (projectFile.name.toLowerCase().indexOf("postinterview") == -1 &&
                projectFile.name.toLowerCase().indexOf("preinterview") == -1 &&
                projectFile.name.toLowerCase().indexOf("imask") == -1) {
                projectFile.setInPoint(fileInPoint + 1, 4);
                projectFile.setOutPoint(fileOutPoint - 1, 4);
            }
        }
    }
};

ActiveProject.prototype.getCustomerName = function() {
    var projectName = this.proj.name;

    //Exclude the file extension
    var splitFromExtension = projectName.split(".");

    //Separate by space and get only the third word onward
    var splitFromSpaces = splitFromExtension[0].split(" ");

    return splitFromSpaces.slice(2).join(" ");
};

ActiveProject.prototype.getClipDuration = function(clip) {
    var totalClipDuration = 0;
    if (clip instanceof Array) {
        for (i = 0; i < clip.length; i++) {
            var clipDuration = clip[i].getOutPoint().seconds - clip[i].getInPoint().seconds;
            totalClipDuration += clipDuration;
        }
        return totalClipDuration;
    } else {
        return clip.getOutPoint().seconds - clip.getInPoint().seconds;
    }
};

//Set Project File In-Point and Out-Point
ActiveProject.prototype.setInAndOut = function(projectFile, inPointSec, outPointSec) {
    projectFile.setInPoint(inPointSec, 4);
    projectFile.setOutPoint(outPointSec, 4);
};

ActiveProject.prototype.setClipStart = function(clip, newStartSec) {
    var newStart = this.newTimeObject(newStartSec);
    clip.start = newStart;
};

ActiveProject.prototype.setClipEnd = function(clip, newEndSec) {
    var newEnd = this.newTimeObject(newEndSec);
    clip.end = newEnd;
};

ActiveProject.prototype.setClipInPoint = function(clip, newInPointSec) {
    var newInPoint = this.newTimeObject(newInPointSec);
    clip.inPoint = newInPoint;
};

ActiveProject.prototype.setClipOutPoint = function(clip, newOutPointSec) {
    var newOutPoint = this.newTimeObject(newOutPointSec);
    clip.outPoint = newOutPoint;
};

ActiveProject.prototype.newTimeObject = function(time) {
    var newTime = new Time();
    if (typeof time === 'string') {
        newTime.ticks = time;
    } else if (typeof time === 'number') {
        newTime.seconds = time;
    }
    return newTime;
};

ActiveProject.prototype.moveClipsAfterTime = function(time, timeToMove, isHandicam) {
    var trackStart = isHandicam ? 1 : 0;
    /* Reduce 0.1 seconds to the time argument because two consecutive clips
       share a start and end time. E.G clip[1].end is the same as clip[2].start*/
    time -= 0.1;
    // Loop through video tracks
    for (var i = trackStart; i < this.vTrack.length; i++) {
        var track = this.vTrack[i];
        var clips = track.clips;

        // Loop through clips and move if it starts after the time argument
        for (var j = clips.numItems - 1; j >= 0; j--) {
            var clip = clips[j];
            if (clip.start.seconds > time) {
                clip.move(timeToMove);
            }
        }
    }

    // Loop through audio tracks
    for (var i = trackStart; i < this.aTrack.length; i++) {
        var track = this.aTrack[i];
        var clips = track.clips;

        for (var j = clips.numItems - 1; j >= 0; j--) {
            var clip = clips[j];
            if (clip.start.seconds > time) {
                clip.move(timeToMove);
            }
        }
    }
};

//Remove all track clips
ActiveProject.prototype.removeTrackClips = function(track) {
    while (track.clips.numItems > 0) {
        var trackClip = track.clips[0];
        trackClip.remove(0, 0);
    }
};

ActiveProject.prototype.removeClip = function(clip) {
    if (clip instanceof Array) {
        for (i = 0; i < clip.length; i++) {
            clip[i].remove(0, 0);
        }
    } else {
        clip.remove(1, 1);
    }
};

//Loop through the project items to get Adjustment Layer Item
ActiveProject.prototype.getAdjustmentLayerItem = function() {
    for (var i = 0; i < this.masterBin.length; i++) {
        var projectItem = this.masterBin[i];
        if (projectItem.isAdjustmentLayer()) {
            return projectItem;
        } else if (projectItem.type === 2) {
            //Project Item Type 2 refers to "BIN"
            var bin = projectItem.children;
            for (var j = 0; j < bin.length; j++) {
                var binItem = bin[j];
                if (binItem.isAdjustmentLayer()) {
                    return binItem;
                }
            }
        }
    }

    return null;
};

//Import files to PrProj
ActiveProject.prototype.importToProject = function(files, bin) {
    var filesToImport = []
    for (var i = 0; i < files.length; i++) {
        filesToImport.push(files[i].fsName)
    }
    app.project.importFiles(filesToImport, false, bin, false);
};

//Universal File Select Function
ActiveProject.prototype.fileSelector = function() {
    var prompt = "Select Tandem Videos";
    var filter = "*mp4;*.jpg;*.jpeg;*mov;*avi;*png";
    var multiSelect = true;

    var fileSelected = File.openDialog(prompt, filter, multiSelect);
    return fileSelected;
};

//Get the Parent Folder Path of the Current Project
ActiveProject.prototype.getParentFolder = function() {
    var parentFolderPath = app.project.path.substring(0, app.project.path.lastIndexOf("\\") + 1);
    return new Folder(parentFolderPath);
};

//Get the Grand Parent Folder Path of the Tandem Files
ActiveProject.prototype.getGrandParentFolder = function() {
    var parentFolderPath = app.project.path.substring(0, app.project.path.lastIndexOf("\\"));
    var grandParentFolderPath = parentFolderPath.substring(0, parentFolderPath.lastIndexOf("\\") + 1);
    return new Folder(grandParentFolderPath);
};

//Create new folder inside the parent folder
ActiveProject.prototype.createNewFolder = function(folderName) {
    var parentFolder = this.getParentFolder();
    var newFolder = new Folder(parentFolder + "/" + folderName);
    if (newFolder.exists) {
        alert(folderName + " " + "folder already exists", "Error: Duplicate Folder", true);
        return null;
    } else {
        newFolder.create();
        return newFolder;
    }
};

//Create new folder inside the parent folder
ActiveProject.prototype.createRenderFolder = function(folderName) {
    var grandParentFolder = this.getGrandParentFolder();
    var newFolder = new Folder(grandParentFolder + "/" + folderName);
    if (newFolder.exists) {
        return newFolder;
    } else {
        newFolder.create();
        return newFolder;
    }
};

//Create photos folder inside the parent folder
ActiveProject.prototype.createPhotosFolder = function(folderName) {
    var parentFolder = this.getParentFolder();
    var photosFolder = new Folder(parentFolder + "/" + folderName);
    if (photosFolder.exists) {
        return photosFolder;
    } else {
        photosFolder.create();
        return photosFolder;
    }
};

ActiveProject.prototype.checkPhotosFolder = function() {
    var parentFolder = this.getParentFolder();
    var folderPhotos = ["Photos", "Photo", "photos", "photo"];
    for (var i = 0; i < folderPhotos.length; i++) {
        var photosFolder = new Folder(parentFolder + "/" + folderPhotos[i]);
        if (photosFolder.exists) {
            return true;
        }
    }

    for (var i = 0; i < 10; i++) {
        var folder100GOPRO = new Folder(parentFolder + "/" + "10" + i.toString() + "GOPRO");
        if (folder100GOPRO.exists) {
            return true;
        }
    }

    return false;
};

//Create photos folder inside the NAS tandem folder
ActiveProject.prototype.createNasPhotosFolder = function(folder) {
    var photosFolder = new Folder(folder + "/" + "Photos");
    if (photosFolder.exists) {
        return photosFolder;
    } else {
        photosFolder.create();
        return photosFolder;
    }
};

//Copy selected files to designated subfolder
ActiveProject.prototype.copyFilesToSubFolder = function(files, folderName) {
    //Create sub-folder
    var destFolder = this.createNewFolder(folderName);

    //Copy tandem files to sub-folder
    try {
        for (var i = 0; i < files.length; i++) {
            var isCopied = files[i].copy(destFolder + '/' + files[i].displayName);
            if (!isCopied) {
                alert("Copying files failed", "Error: Unsucessful Copy", true);
                destFolder.remove();
                return null;
            }
        }
    } catch (error) {
        alert("Copying files failed", "Error: Unsucessful Copy", true);
        destFolder.remove();
        return null;
    }

    return destFolder;
};

//Declare source folder for templates and presets
ActiveProject.prototype.getSrcFolder = function() {
    return new Folder(Folder.myDocuments + "/SD Extension Presets");
};

//Check the prproj file name
ActiveProject.prototype.getFileName = function() {
    var parts = app.project.path.split('\\');
    var fileNameWithExtension = parts[parts.length - 1];
    var fileNameWithoutExtension = fileNameWithExtension.split('.')[0];

    return fileNameWithoutExtension;
};

//Get the Selected Clips Text Database for Social Media Edit
ActiveProject.prototype.getSelectedClipsDb = function() {
    var srcFolder = this.getSrcFolder();
    var dbPath = srcFolder + "/" + "selected_clips.txt"
    return new File(dbPath);
};

//Get the Settings Text Database
ActiveProject.prototype.getSettingsDb = function() {
    var srcFolder = this.getSrcFolder();
    var dbPath = srcFolder + "/" + "settings.txt"
    var settingsDb = new File(dbPath);
    if (!settingsDb.exists) {
        alert("Cannot locate settings.txt", "Error: Missing File", true);
        return null;
    } else {
        return settingsDb;
    }
};

//Get the Settings Array Variable
ActiveProject.prototype.getSettingsArray = function(db) {
    //Get the file path object of the txt database
    var settingsArray = {
        nas_path: [],
        sme_undercanopy_audio: [],
        one_frame_select: [],
        enable_proxy: [],
        auto_delete_original_media: [],
        enable_lut_adjustment_layer: [],
        use_4k_preset: [],
        reframe_at_end: []
    }

    this.readTxtFile(db, settingsArray);
    return settingsArray;
};

ActiveProject.prototype.readTxtFile = function(file, keyArray) {
    if (file.exists) {
        file.open("r");
        // Read the file line by line
        while (!file.eof) {
            var line = file.readln();
            // Split the line into key and value
            var parts = line.split(":");
            
            // Get an array of keys from keyArray
            var keys = [];
            for (var k in keyArray) {
                if (keyArray.hasOwnProperty(k)) {
                    keys.push(k);
                }
            }
            
            // Compare the key from the file and the keyArray. Append the value if it matches.
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (key == parts[0] && parts[1] != '') {
                    keyArray[key].push(parts[1]);
                    break;
                }
            }
        }
        file.close();
    }
};

//Write content to text file. Automatically creates a text file if it doesnt exist.
ActiveProject.prototype.writeTxtFile = function(file, keyArray) {
    if (file.open("w")) {
        // Get an array of keys from keyArray
        var keys = [];
        for (var k in keyArray) {
            if (keyArray.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        
        // Use a traditional for loop to iterate over the keys
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            file.writeln(key + ":" + keyArray[key]);
        }
        file.close();
    }
};

//Convert string content to array
ActiveProject.prototype.splitByComa = function(content) {
    return content.split(",");
};

//Convert string content to array
ActiveProject.prototype.getClipIdFromDb = function(db) {
    var idArray = {
        video: [],
        audio: []
    };

    this.readTxtFile(db, idArray);

    if (idArray.video.length > 0) {
        idArray.video = this.splitByComa(idArray.video[0]);
    }

    if (idArray.audio.length > 0) {
        idArray.audio = this.splitByComa(idArray.audio[0]);
    }

    return idArray;
};

//Convert decibel to decimal
ActiveProject.prototype.dbToDec = function(db) {
    return Math.pow(10, (db - 15) / 20);
};

ActiveProject.prototype.adjustVolume = function(clip, db) {
    clip.components[0].properties[1].setValue(this.dbToDec(db), 1);
};

//Auto duck for audio track two
ActiveProject.prototype.autoDuck = function() {
    //Assign this to a variable so compareOverlap function can access the dbToDec
    var ap = this;
    var updateUI = true;

    //Loop through the music track first to check if there are existing keyframes to clear
    removeKeyframes(this.aTrackTwo);

    //Loop through audio track one to get the dialogue clips
    for (var i = 0; i < this.aTrackOne.clips.length; i++) {
        var trackOneClip = this.aTrackOne.clips[i];
        var prevTrackOneClip = null;
        var nextTrackOneClip = null;

        //Get the previous and next dialogue clip of the current clip
        if (i !== 0) {
            prevTrackOneClip = this.aTrackOne.clips[i - 1];
        }
        if (i < this.aTrackOne.clips.length - 1) {
            nextTrackOneClip = this.aTrackOne.clips[i + 1];
        }

        //Loop through audio track two to get the music clips
        for (var j = 0; j < this.aTrackTwo.clips.length; j++) {
            var trackTwoClip = this.aTrackTwo.clips[j];
            //Skip the loop for the outro and outromask since we don't need to duck its audio
            if (trackTwoClip.name.toLowerCase().indexOf("omask") != -1 || trackTwoClip.name.toLowerCase().indexOf("outro") != -1) {
                continue;
            }
            addKeyFrames(trackOneClip, trackTwoClip, prevTrackOneClip, nextTrackOneClip)
        }
    }

    function addKeyFrames(dialogue, music, prevClip, nextClip) {
        var prevClipStart = -1;
        var prevClipEnd = -1;
        var nextClipStart = -1;
        var nextClipEnd = -1;

        if (prevClip !== null) {
            prevClipStart = prevClip.start.seconds;
            prevClipEnd = prevClip.end.seconds;
        }

        if (nextClip !== null) {
            var nextClipStart = nextClip.start.seconds;
            var nextClipEnd = nextClip.end.seconds;
        }

        var dialogueStart = dialogue.start.seconds;
        var dialogueEnd = dialogue.end.seconds;
        var musicStart = music.start.seconds;
        var musicEnd = music.end.seconds;
        var musicInPoint = music.inPoint.seconds;
        var musicOutPoint = music.outPoint.seconds;
        var musicVolume = music.components[0].properties[1];
        musicVolume.setTimeVarying(true);

        /*Below is the logic for where and when to add the keyframes.
        The logic below compares the overlap between the dialogue clip (track one clip)
        and the music clip (track two clip).
        It mainly compare the position of the start and end time of the dialogue clip 
        versus the music clip and calculates the position of the keyframe if there 
        is a need to increase or decrease the volume of the music.*/
        if (dialogueStart > musicStart && dialogueEnd > musicEnd) {
            if (dialogueStart !== prevClipEnd) {
                var offsetBySeconds = 1;
                var firstKey = dialogueStart - musicStart + musicInPoint - offsetBySeconds;
                var secondKey = musicEnd - musicStart + musicInPoint;
                if (firstKey && secondKey) {
                    musicVolume.addKey(firstKey);
                    musicVolume.addKey(secondKey);
                    musicVolume.setValueAtKey(firstKey, ap.dbToDec(-10), updateUI);
                    musicVolume.setValueAtKey(secondKey, ap.dbToDec(-90), updateUI);
                }
            }
        } else if (dialogueStart < musicStart && dialogueEnd < musicEnd) {
            var firstKey = musicInPoint;
            var secondKey = dialogueEnd - musicStart + musicInPoint;
            if (firstKey && secondKey) {
                musicVolume.addKey(firstKey);
                musicVolume.addKey(secondKey);
                musicVolume.setValueAtKey(firstKey, ap.dbToDec(-90), updateUI);
                musicVolume.setValueAtKey(secondKey, ap.dbToDec(-10), updateUI);
            }
        } else if (dialogueStart > musicStart && dialogueEnd < musicEnd) {
            if (dialogueStart !== prevClipEnd) {
                var keyAtDialogueStart = dialogueStart - musicStart + musicInPoint;
                var firstKey = keyAtDialogueStart;
                var secondKey = keyAtDialogueStart + 2;
                if (firstKey && secondKey) {
                    musicVolume.addKey(firstKey);
                    musicVolume.addKey(secondKey);
                    musicVolume.setValueAtKey(firstKey, ap.dbToDec(-10), updateUI);
                    musicVolume.setValueAtKey(secondKey, ap.dbToDec(-90), updateUI);
                }
            }

            if (dialogueEnd !== nextClipStart) {
                var keyAtDialogueEnd = dialogueEnd - musicStart + musicInPoint;
                var thirdKey = keyAtDialogueEnd - 2;
                var fourthKey = keyAtDialogueEnd;
                if (thirdKey && fourthKey) {
                    musicVolume.addKey(thirdKey);
                    musicVolume.addKey(fourthKey);
                    musicVolume.setValueAtKey(thirdKey, ap.dbToDec(-190), updateUI);
                    musicVolume.setValueAtKey(fourthKey, ap.dbToDec(-10), updateUI);
                }
            }
            //Social Media Edit has dialogueEnd = musicEnd scenario
        } else if (dialogueStart > musicStart && dialogueEnd == musicEnd) {
            if (dialogueStart !== prevClipEnd) {
                var keyAtDialogueStart = dialogueStart - musicStart + musicInPoint;
                var firstKey = keyAtDialogueStart - .5;
                var secondKey = keyAtDialogueStart + 1.5;
                if (firstKey && secondKey) {
                    musicVolume.addKey(firstKey);
                    musicVolume.addKey(secondKey);
                    musicVolume.setValueAtKey(firstKey, ap.dbToDec(-10), updateUI);
                    musicVolume.setValueAtKey(secondKey, ap.dbToDec(-90), updateUI);
                }
            }
        }
    }

    function removeKeyframes(music) {
        for (var i = 0; i < music.clips.length; i++) {
            var trackTwoClip = music.clips[i];
            var musicInPoint = trackTwoClip.inPoint.seconds;
            var musicOutPoint = trackTwoClip.outPoint.seconds;
            var musicVolume = trackTwoClip.components[0].properties[1];
            var isKeyframesOn = musicVolume.isTimeVarying();
            if (isKeyframesOn) {
                musicVolume.removeKeyRange(0, 500, updateUI);
            }
        }
    }
};

ActiveProject.prototype.recursiveCopy = function(src, destination) {
    try {
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
                recursiveCopy(srcChild, destinationChildFolder);
            }
        }
        return 1;
    } catch (e) {
        return 0;
    }
};

ActiveProject.prototype.updateEventPanel = function(state, message) {
    if (state === "success") {
        app.setSDKEventMessage(message, "info");
    } else if (state === "error") {
        app.setSDKEventMessage(message, "error");
        // app.setSDKEventMessage('Here is a warning.', 'warning');
    }
};

//------------------------------------------------------------------------//
//----------------------------- Using QE DOM -----------------------------//
//------------------------------------------------------------------------//

//Initialize QE
ActiveProject.prototype.initializeQEProject = function() {
    app.enableQE();
    this.qeProj = qe.project;
};

//Initialize active QE Sequence and Tracks
ActiveProject.prototype.activeQESeqAndTracksInitialize = function() {
    this.qeSeq = this.qeProj.getActiveSequence();
    this.qeVTrackOne = this.qeSeq.getVideoTrackAt(0);
    this.qeVTrackTwo = this.qeSeq.getVideoTrackAt(1);
    this.qeVTrackThree = this.qeSeq.getVideoTrackAt(2);
    this.qeATrackOne = this.qeSeq.getAudioTrackAt(0);
    this.qeATrackTwo = this.qeSeq.getAudioTrackAt(1);
};

ActiveProject.prototype.qeClipsToVarInitialize = function() {
    this.qeVTrackOneClipsInitialize();
    this.qeVTrackTwoClipsInitialize();
    this.qeATrackOneClipsInitialize();
    this.qeATrackTwoClipsInitialize();
};

ActiveProject.prototype.qeVTrackOneClipsInitialize = function() {
    this.qePreInterviewVClip = [], this.qeWalkToPlaneVClip = [], this.qeFreefallVClip = [], this.qeLandingVClip = [], this.qePostInterviewVClip = [], this.qeUnderCanopyVClip = [];
    for (var i = 0; i < this.qeVTrackOne.numItems; i++) {
        var clip = this.qeVTrackOne.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("preinterview") != -1) {
                this.qePreInterviewVClip.push(clip);
            } else if (clipName.indexOf("walktoplane") != -1) {
                this.qeWalkToPlaneVClip.push(clip);
            } else if (clipName.indexOf("freefall") != -1) {
                this.qeFreefallVClip.push(clip);
            } else if (clipName.indexOf("landing") != -1) {
                this.qeLandingVClip.push(clip);
            } else if (clipName.indexOf("postinterview") != -1) {
                this.qePostInterviewVClip.push(clip);
            } else if (clipName.indexOf("handicamview") != -1) {
                this.qeHandicamViewVClip = clip;
            } else if (clipName.indexOf("undercanopy") != -1) {
                this.qeUnderCanopyVClip.push(clip);
            } else if (clipName.indexOf("stockshot1") != -1) {
                this.qeStockOneClip = clip;
            } else if (clipName.indexOf("stockshot2") != -1) {
                this.qeStockTwoClip = clip;
            } else if (clipName.indexOf("twixtor") != -1) {
                this.twixtorClip = clip;
            }
        }
    }
};

ActiveProject.prototype.qeVTrackTwoClipsInitialize = function() {
    for (var i = 0; i < this.qeVTrackTwo.numItems; i++) {
        var clip = this.qeVTrackTwo.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("intro") != -1) {
                this.qeIntroVClip = clip;
            } else if (clipName.indexOf("imask") != -1) {
                this.qeIntroMaskVClip = clip;
            } else if (clipName.indexOf("omask") != -1) {
                this.qeOutroMaskVClip = clip;
            } else if (clipName.indexOf("outro") != -1) {
                this.qeOutroVClip = clip;
            } else if (clipName.indexOf("watermark") != -1) {
                this.qeWatermarkClip = clip;
            }
        }
    }
};

ActiveProject.prototype.qeVTrackThreeClipsInitialize = function() {
    for (var i = 0; i < this.qeVTrackThree.numItems; i++) {
        var clip = this.qeVTrackThree.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("lower thirds") != -1) {
                this.qeLowerThirdsVClip = clip;
            } else if (clipName.indexOf("copyright") != -1) {
                this.qeCopyrightVClip = clip;
            }
        }
    }
};

ActiveProject.prototype.qeATrackOneClipsInitialize = function() {
    this.qePreInterviewAClip = [], this.qePostInterviewAClip = [], this.qeUnderCanopyAClip = [];
    for (var i = 0; i < this.qeATrackOne.numItems; i++) {
        var clip = this.qeATrackOne.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("preinterview") != -1) {
                this.qePreInterviewAClip.push(clip);
            } else if (clipName.indexOf("postinterview") != -1) {
                this.qePostInterviewAClip.push(clip);
            } else if (clipName.indexOf("undercanopy") != -1) {
                this.qeUnderCanopyAClip.push(clip);
            }
        }
    }
};

ActiveProject.prototype.qeATrackTwoClipsInitialize = function() {
    for (var i = 0; i < this.qeATrackTwo.numItems; i++) {
        var clip = this.qeATrackTwo.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("intro") != -1) {
                this.qeIntroAClip = clip;
            } else if (clipName.indexOf("omask") != -1) {
                this.qeOutroMaskAClip = clip;
            } else if (clipName.indexOf("outro") != -1) {
                this.qeOutroAClip = clip;
            } else if (clipName.indexOf("music") != -1) {
                this.qeFhdMusicClip = clip;
            }
        }
    }
};

ActiveProject.prototype.videoEffectsInitialize = function() {
    this.twixtorEffect = this.qeProj.getVideoEffectByName("Twixtor");
    this.transformEffect = this.qeProj.getVideoEffectByName("Transform");
};

ActiveProject.prototype.videoTransitionsInitialize = function() {
    this.crossDissolve = qe.project.getVideoTransitionByName("Cross Dissolve");
    this.dipToBlack = qe.project.getVideoTransitionByName("Dip to Black");
};

ActiveProject.prototype.audioTransitionsInitialize = function() {
    this.constantGain = this.qeProj.getAudioTransitionByName("Constant Gain");
    this.constantPower = this.qeProj.getAudioTransitionByName("Constant Power");
    this.exponentialFade = this.qeProj.getAudioTransitionByName("Exponential Fade");
};

ActiveProject.prototype.getPlayheadTimecode = function() {
    return this.qeSeq.CTI.timecode;
};

ActiveProject.prototype.getPlayheadSeconds = function() {
    return this.seq.getPlayerPosition().seconds;
};

ActiveProject.prototype.framesToSeconds = function(frames) {
    var frameRate = this.qeSeq.videoFrameRate;
    return frames / frameRate;
}

ActiveProject.prototype.movePlayheadByFrames = function(frames) {
    var framesInSeconds = this.framesToSeconds(frames)
    var playheadPosSec = this.getPlayheadSeconds();
    var newPlayheadPos = this.newTimeObject(playheadPosSec + framesInSeconds);

    this.seq.setPlayerPosition(newPlayheadPos.ticks)
};

ActiveProject.prototype.razorAtVTrackOne = function(timecode) {
    this.qeVTrackOne.razor(timecode, true, true);
};

ActiveProject.prototype.sliceBySecond = function(secondsToSlice) {
    var frameRate = this.qeSeq.videoFrameRate;
    var secondsInFrame = secondsToSlice * frameRate;
    this.razorAtVTrackOne(this.getPlayheadTimecode());
    this.movePlayheadByFrames(secondsInFrame);
    this.razorAtVTrackOne(this.getPlayheadTimecode());
};

ActiveProject.prototype.sliceByFrame = function(frameToSlice) {
    var frameRate = this.qeSeq.videoFrameRate;
    this.razorAtVTrackOne(this.getPlayheadTimecode());
    this.movePlayheadByFrames(frameToSlice);
    this.razorAtVTrackOne(this.getPlayheadTimecode());
};

ActiveProject.prototype.addTransition = function(clip, transition, startOrEnd, length) {
    //Check if clip exist
    if (!clip) {
        return;
    }

    var position;
    var startOrEndLower = startOrEnd.toLowerCase();

    if (startOrEndLower === "start") {
        position = true;
    } else if (startOrEndLower === "end") {
        position = false;
    } else if (startOrEndLower === "both") {
        //Add transition on both position and return
        clip.addTransition(transition, true, length);
        clip.addTransition(transition, false, length);
        return;
    }

    // Add transition based on the determined position
    clip.addTransition(transition, position, length);
};

ActiveProject.prototype.setClipSpeed = function(clip, speed) {
    clip.setSpeed(speed, '0', false, false, false);
};

ActiveProject.prototype.qeSocMedVClipsInitialize = function() {
    this.qeSmMontageVClips = [], this.qeSmWalkToPlaneVClips = [], this.qeSmFreeFallVClips = [], this.qeSmLandingVClip = [], this.qeSmPostInterviewVClip = [], this.qeSmHandicamViewVClip = [], this.qeSmUnderCanopyVClip = [];
    for (var i = 0; i < this.qeVTrackOne.numItems; i++) {
        var clip = this.qeVTrackOne.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("montage") != -1) {
                this.qeSmMontageVClips.push(clip);
            } else if (clipName.indexOf("walktoplane") != -1) {
                this.qeSmWalkToPlaneVClips.push(clip);
            } else if (clipName.indexOf("freefall") != -1) {
                this.qeSmFreeFallVClips.push(clip);
            } else if (clipName.indexOf("landing") != -1) {
                this.qeSmLandingVClip.push(clip);
            } else if (clipName.indexOf("postinterview") != -1) {
                this.qeSmPostInterviewVClip.push(clip);
            } else if (clipName.indexOf("handicamview") != -1) {
                this.qeSmHandicamViewVClip.push(clip);
            } else if (clipName.indexOf("undercanopy") != -1) {
                this.qeSmUnderCanopyVClip.push(clip);
            }
        }
    }
};

ActiveProject.prototype.qeSocMedAClipsInitialize = function() {
    this.qeSmPostInterviewAClip = [], this.qeSmUnderCanopyAClip = [];
    for (var i = 0; i < this.qeATrackOne.numItems; i++) {
        var clip = this.qeATrackOne.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("postinterview") != -1) {
                this.qeSmPostInterviewAClip.push(clip);
            } else if (clipName.indexOf("undercanopy") != -1) {
                this.qeSmUnderCanopyAClip.push(clip);
            }
        }
    }
};

ActiveProject.prototype.qeSocMedTemplateClipsInitialize = function() {
    for (var i = 0; i < this.qeVTrackTwo.numItems; i++) {
        var clip = this.qeVTrackTwo.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("intro") != -1) {
                this.qeSmIntroClip = clip;
            } else if (clipName.indexOf("stockshot") != -1) {
                this.qeSmStockShotClip = clip;
            }
        }
    }

    for (var i = 0; i < this.qeATrackTwo.numItems; i++) {
        var clip = this.qeATrackTwo.getItemAt(i);
        if (clip.type == "Clip") {
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("music") != -1) {
                this.qeSmMusicClip = clip;
            }
        }
    }
};

ActiveProject.prototype.qeSocMedClipsToVar = function() {
    this.qeSmWalkOneClip = this.qeSmWalkToPlaneVClips[0];
    this.qeSmWalkTwoClip = this.qeSmWalkToPlaneVClips[1];
    this.qeSmExitClip = this.qeSmFreeFallVClips[0];
    this.qeSmFirstCloseUpClip = this.qeSmFreeFallVClips[1];
    this.qeSmFirstPalmClip = this.qeSmFreeFallVClips[2];
    this.qeSmOrbitClip = this.qeSmFreeFallVClips[3];
    this.qeSmSecondPalmClip = this.qeSmFreeFallVClips[4];
    this.qeSmSecondCloseUpClip = this.qeSmFreeFallVClips[5];
    this.qeSmOpeningClip = this.qeSmFreeFallVClips[6];
    this.qeSmLandingClip = this.qeSmLandingVClip[0];
    this.qeSmInterviewVClip = this.qeSmPostInterviewVClip[0];
    this.qeSmInterviewAClip = this.qeSmPostInterviewAClip[0];
    this.qeSmHcOrbitClip = this.qeSmHandicamViewVClip[0];
    this.qeSmCanopyVClip = this.qeSmUnderCanopyVClip[0];
    this.qeSmCanopyAClip = this.qeSmUnderCanopyAClip[0];
    this.qeSmMontageOneClip = this.qeSmMontageVClips[0];
    this.qeSmMontageTwoClip = this.qeSmMontageVClips[1];
    this.qeSmMontageThreeClip = this.qeSmMontageVClips[2];
};

ActiveProject.prototype.qeAdjustmentLayersToVar = function() {
    this.qeAdjustmentLayerClips = [];
    for (i = 0; i < this.qeVTrackThree.numItems; i++) {
        var clip = this.qeVTrackThree.getItemAt(i);
        if (clip.type == "Clip") {
            this.qeAdjustmentLayerClips.push(clip);
        }
    }
};