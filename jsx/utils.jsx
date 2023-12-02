function ActiveProject() {

}

//Initialize active project
ActiveProject.prototype.InitializeCurrentProject = function() {
    this.proj = app.project;
    this.projPath = app.project.path;
    this.projRoot = app.project.rootItem;
    this.masterBin = app.project.rootItem.children;
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

//Initialize bin properties for the active project
// ActiveProject.prototype.binInitialize = function() {
//     this.templateBin = this.getBin("Template");
//     this.vidBin = this.getBin("Videos");
//     this.subClipsBin = this.getBin("Sub Clips");
//     this.hcBin = this.getBin("HC Videos");
// };

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
    this.preInterviewVClip = [], this.walkToPlaneVClip = [], this.freefallVClip = [], this.landingVClip = [], this.postInterviewVClip = [];
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
            this.introVMaskClip = clip;
        } else if (clipName.indexOf("omask") != -1) {
            this.outroVMaskClip = clip;
        } else if (clipName.indexOf("outro") != -1) {
            this.outroVClip = clip;
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
        } else if (clipName.indexOf("watermark") != -1) {
            this.waterMarkClip = clip;
        }
    }
};

ActiveProject.prototype.aTrackOneClipsInitialize = function() {
    this.preInterviewAClip = [], this.postInterviewAClip = [];
    for (var i = 0; i < this.aTrackOne.clips.length; i++) {
        var clip = this.aTrackOne.clips[i];
        var clipName = clip.name.toLowerCase();
        if (clipName.indexOf("preinterview") != -1) {
            this.preInterviewAClip.push(clip);
        } else if (clipName.indexOf("postinterview") != -1) {
            this.postInterviewAClip.push(clip);
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
            this.outroAMaskClip = clip;
        } else if (clipName.indexOf("outro") != -1) {
            this.outroAClip = clip;
        } else if (clipName.indexOf("music") != -1) {
            this.fhdMusic = clip;
        }
    }
};

ActiveProject.prototype.getClipDuration = function(clip) {
    var totalClipDuration = 0;
    if (typeof clip === "object") {
        for (i = 0; i < clip.length; i++) {
            var clipDuration = clip[i].getOutPoint().seconds - clip[i].getInPoint().seconds;
            totalClipDuration += clipDuration;
        }
        return totalClipDuration;
    } else {
        return clip.getOutPoint().seconds - clip.getInPoint().seconds;
    }
};

//Import files to PrProj
ActiveProject.prototype.importToProject = function(files, bin) {
    var filesToImport = []
    for (var i in files) {
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

//Create new folder inside the parent folder
ActiveProject.prototype.createNewFolder = function(folderName) {
    parentFolder = this.getParentFolder();
    var newFolder = new Folder(parentFolder + "/" + folderName);
    if (newFolder.exists) {
        alert(folderName + " " + "folder already exists", "Error: Duplicate Folder", true);
        return null;
    } else {
        newFolder.create();
        return newFolder;
    }
};

//Copy selected files to designated subfolder
ActiveProject.prototype.copyFilesToSubFolder = function(files, folderName) {
    //Create sub-folder
    var destFolder = this.createNewFolder(folderName);

    //Copy tandem files to sub-folder
    for (var i in files) {
        files[i].copy(destFolder + '/' + files[i].displayName);
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