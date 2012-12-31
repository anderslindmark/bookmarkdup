/**
 * XULBookmarkDup namespace.
 */
if ("undefined" == typeof(XULBookmarkDup)) {
  var XULBookmarkDup = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
XULBookmarkDup.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */

  findDups : function(aEvent) {
    //let stringBundle = document.getElementById("xulschoolhello-string-bundle");
    //let message = stringBundle.getString("xulschoolhello.greeting.label");
    //window.alert(message);


	// When more than one base-folder is specified, it seems that no subfolders are found, _AT ALL_
    // So in order to know where a found bookmark lives, the query needs to be done on one base-folder
    // at a time, and then recursed through subdirectories, keeping a manual history of the path........
    //var folders = [bookmarks.toolbarFolder, bookmarks.bookmarksMenuFolder, bookmarks.unfiledBookmarksFolder];
    //query.setFolders(folders, folders.length);
	bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
  	historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

    var win = window.openDialog("chrome://bookmarkdup/content/bookmarkdupwindow.xul", "bmdup", "chrome,width=750, height=600", {bmService: bookmarksService, hService: historyService});
  }
};
