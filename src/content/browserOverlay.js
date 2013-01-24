/**
 * XULBookmarkDup namespace.
 */
if ("undefined" == typeof(XULBookmarkDup)) {
  var XULBookmarkDup = {};
};

/**
 * Controls the browser overlay
 */
XULBookmarkDup.BrowserOverlay = {
  findDups : function(aEvent) {
  	// Get services
  	var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
  	var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

  	// Open window
    window.openDialog("chrome://bookmarkdup/content/bookmarkdupwindow.xul", "bmdup", 
    	"chrome=yes,resizable=yes", {bmService: bookmarksService, hService: historyService});
  }
};
