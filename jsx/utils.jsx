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

ActiveProject.prototype.getBin = function(binName) {
    for (var i = 0; i < this.masterBin.length; i++) {
        if (this.masterBin[i].name == binName) {
            return this.masterBin[i];
        }
    }
    return null;
};

//Initialize fhd bin for the active project
ActiveProject.prototype.fhdBinInitialize = function() {
    this.templateBin = this.getBin("Template");
    this.vidBin = this.getBin("Videos");
    this.subClipsBin = this.getBin("Sub Clips");
};

//Initialize handicam bin for the active project
ActiveProject.prototype.hcBinInitialize = function() {
    this.hcBin = this.getBin("HC Videos");
};

//Check the prproj file name
ActiveProject.prototype.getFileName = function() {
    var parts = this.projPath.split('\\');
    var fileNameWithExtension = parts[parts.length - 1];
    var fileNameWithoutExtension = fileNameWithExtension.split('.')[0];

    return fileNameWithoutExtension;
};

ActiveProject.prototype.importToProject = function(files, bin) {
    var filesToImport = []
    for (var i in files) {
        filesToImport.push(files[i].fsName)
    }
    app.project.importFiles(filesToImport, false, bin, false);
}

ActiveProject.prototype.selectionValidator = function(selectionType, selectionLength, hasBoard) {
    if (selectionType === "Videos") {
        var validator = (!hasBoard && selectionLength >= 4) || (hasBoard && selectionLength >= 5);
        var alertDesc = "If the board exists, select a minimum of 5 files; otherwise, select a minimum of 4 files."
    } else if (selectionType === "Handicam") {
        var validator = false;
    } else {
        var validator = false;
    }

    if (!validator) {
        alert(alertDesc, "Error: Invalid Selection", true);
        return false;
    } else {
        return validator;
    }
}

ActiveProject.prototype.copyFilesToSubFolder = function(files, folderName) {
    //Create sub-folder
    var destFolder = this.createNewFolder(folderName);

    //Copy tandem files to sub-folder
    for (var i in files) {
        files[i].copy(destFolder + '/' + files[i].displayName);
    }

    return destFolder;
}

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
ActiveProject.prototype.fhdTemplateToVarInitialize = function() {
    var templateBinItems = this.templateBin.children;
    this.fhdIntro = templateBinItems[0];
    this.fhdIntroMask = templateBinItems[1];
    this.fhdStockOne = templateBinItems[2];
    this.fhdStockTwo = templateBinItems[3];
    this.fhdOutroMask = templateBinItems[4];
    this.fhdOutro = templateBinItems[5];
    this.fhdIntroSound = templateBinItems[6];
    this.fhdLowerThirds = templateBinItems[7];
    this.fhdWatermark = templateBinItems[8];
    this.fhdMusic = templateBinItems[9];
};

//Create subclips to remove audio
ActiveProject.prototype.convertToSubclip = function(clip) {
    var subClip = clip.createSubClip(clip.name + " - subclip", clip.getInPoint().ticks, clip.getOutPoint().ticks, 0, 1, 0);
    subClip.moveBin(this.subClipsBin);
    return subClip;
};

//Assign active fhd clips to properties
ActiveProject.prototype.clipsToVarInitialize = function() {
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

//Universal File Select Function
ActiveProject.prototype.fileSelector = function() {
    var prompt = "Select Tandem Videos";
    var filter = "*mp4;*.jpg;*.jpeg;*mov;*avi;*png";
    var multiSelect = true;

    var fileSelected = File.openDialog(prompt, filter, multiSelect);
    return fileSelected;
};

ActiveProject.prototype.createNewFolder = function(folderName) {
    parentFolder = this.getParentFolder();
    var newFolder = new Folder(parentFolder + "/" + folderName);
    if (newFolder.exists) {
        alert("Folder Name already exists", "Error: Duplicate Folder", true);
        return null;
    } else {
        newFolder.create();
        return newFolder;
    }
};

//Declare source folder for templates and presets
ActiveProject.prototype.getSrcFolder = function() {
    return new Folder(Folder.myDocuments + "/SD Extension Presets");
};

//Get the Parent Folder Path of the Current Project
ActiveProject.prototype.getParentFolder = function() {
    var parentFolderPath = app.project.path.substring(0, app.project.path.lastIndexOf("\\") + 1);
    return new Folder(parentFolderPath);
};