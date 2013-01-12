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
  	var bookmarksService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
  	var historyService = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

    window.openDialog("chrome://bookmarkdup/content/bookmarkdupwindow.xul", "bmdup", "chrome,width=615, height=300", {bmService: bookmarksService, hService: historyService});
  }
};
