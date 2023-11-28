//Global Variable Declarations
var proj, projRoot, projPath;

var masterBin, vidBin, templateBin, subClipsBin, hcBin;

var seq, vTrack, aTrack, vTrackOne, vTrackTwo, vTrackThree, aTrackOne, aTrackTwo, aTrackThree;

var vidBinFiles, numOfVidClips, hasLanding, board, preInterview, walkToPlane, freefall, landing, postInterview = [];

var fhdIntro, fhdIntroMask, fhdStockOne, fhdStockTwo, fhdOutro, fhdOutroMask, fhdIntroSound, fhdLowerThirds, fhdWatermark, fhdMusic;

var preInterviewVClip = [], walkToPlaneVClip = [], freefallVClip = [], landingVClip = [], postInterviewVClip = []; 

var srcFolder = Folder.myDocuments + "/" + "SD Extension Presets";


var utils = {
    //Select tandem files from system
    fileSelector: function() {
        var prompt = "Select Tandem Videos";
        var filter = "*mp4;*.jpg;*.jpeg;*mov;*avi;*png";
        var multiSelect = true;

        var fileSelected = File.openDialog(prompt, filter, multiSelect);
        return fileSelected;
    },

    //Set bin variables for the active project
    binInitialize: function() {
        for (var i = 0; i < masterBin.length; i++) {
            if (masterBin[i].name == "Template") {
                templateBin = masterBin[i];
            } else if (masterBin[i].name == "Videos") {
                vidBin = masterBin[i];
            } else if (masterBin[i].name == "Sub Clips") {
                subClipsBin = masterBin[i];
            }
        }
    },

    //Set handicam bin variable for the active project
    hcBinInitialize: function() {
        for (var i = 0; i < masterBin.length; i++) {
            if (masterBin[i].name == "HC Videos") {
                hcBin = masterBin[i];
            }
        }
    },

    //Set jsx ppro variables for the active project
    activeProjectInitialize: function() {
        proj = app.project;
        projPath = proj.path;
        projRoot = proj.rootItem;
        masterBin = projRoot.children;
    },

    activeSeqAndTracksInitialize: function() {
        seq = proj.activeSequence;
        vTrack = seq.videoTracks;
        vTrackOne = vTrack[0];
        vTrackTwo = vTrack[1];
        vTrackThree = vTrack[2];
        aTrack = seq.audioTracks;
        aTrackOne = aTrack[0];
        aTrackTwo = aTrack[1];
        aTrackThree = aTrack[2];
    },

    //Check the prproj file name
    fileNameChecker: function() {
        var parts = projPath.split('\\');
        var fileNameWithExtension = parts[parts.length - 1];
        var fileNameWithoutExtension = fileNameWithExtension.split('.')[0];

        return fileNameWithoutExtension;
    },

    //Assign Tandem Videos to Variables
    fhdVidsToVarInitialize: function(hasBoard) {
        vidBinFiles = vidBin.children;
        numOfVidClips = vidBinFiles.length;
        hasLanding = false;
        if (hasBoard) {
            board = vidBinFiles[0];
            preInterview = vidBinFiles[1];
            walkToPlane = vidBinFiles[2];
            freefall = vidBinFiles[3];
            if (numOfVidClips > 5) {
                landing = vidBinFiles[4];
                hasLanding = true;
            }
            var postInterviewStart = hasLanding ? 5 : 4;
            for (var i = postInterviewStart; i < numOfVidClips; i++) {
                postInterview.push(vidBinFiles[i]);
            }
        } else {
            preInterview = vidBinFiles[0];
            walkToPlane = vidBinFiles[1];
            freefall = vidBinFiles[2];
            if (numOfVidClips > 4) {
                landing = vidBinFiles[3];
                hasLanding = true;
            }
            var postInterviewStart = hasLanding ? 4 : 3;
            for (var i = postInterviewStart; i < numOfVidClips; i++) {
                postInterview.push(vidBinFiles[i]);
            }
        }
    },

    importStock: function(folder, bin) {
        var stockFiles = []
        for (var i in folder.getFiles()) {
            stockFiles.push(folder.getFiles()[i].fsName)
        }

        proj.importFiles(stockFiles, false, bin, false);
    },

    fhdTemplateToVarInitialize: function() {
        var templateBinItems = templateBin.children;
        fhdIntro = templateBinItems[0];
        fhdIntroMask = templateBinItems[1];
        fhdStockOne = templateBinItems[2];
        fhdStockTwo = templateBinItems[3];
        fhdOutroMask = templateBinItems[4];
        fhdOutro = templateBinItems[5];
        fhdIntroSound = templateBinItems[6];
        fhdLowerThirds = templateBinItems[7];
        fhdWatermark = templateBinItems[8];
        fhdMusic = templateBinItems[9];
    },

    convertToSubclip: function(clip) {
        var subClip = clip.createSubClip(clip.name + " - subclip", clip.getInPoint().ticks, clip.getOutPoint().ticks, 0, 1, 0);
        subClip.moveBin(subClipsBin);
        return subClip;
    },

    clipsToVarInitialize: function() {
        preInterviewVClip = [], walkToPlaneVClip = [], freefallVClip = [], landingVClip = [], postInterviewVClip = [];
        for (var i = 0; i < vTrackOne.clips.length; i++){
            var clip = vTrackOne.clips[i];
            var clipName = clip.name.toLowerCase();
            if (clipName.indexOf("preinterview") != -1){
                preInterviewVClip.push(clip);
            } else if (clipName.indexOf("walktoplane") != -1) {
                walkToPlaneVClip.push(clip);
            } else if (clipName.indexOf("freefall") != -1) {
                freefallVClip.push(clip);
            } else if (clipName.indexOf("landing") != -1) {
                landingVClip.push(clip);
            } else if (clipName.indexOf("postinterview") != -1) {
                postInterviewVClip.push(clip);
            }
                
        }
    }
}