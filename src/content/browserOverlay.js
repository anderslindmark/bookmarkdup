/**
 * XULSchoolChrome namespace.
 */
if ("undefined" == typeof(XULSchoolChrome)) {
  var XULSchoolChrome = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
XULSchoolChrome.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */

   /*
   sortUri : function(a, b) {
   	return a.uri.localeCompare(b.uri);
   }
   */

  sayHello : function(aEvent) {
    //let stringBundle = document.getElementById("xulschoolhello-string-bundle");
    //let message = stringBundle.getString("xulschoolhello.greeting.label");

    //window.alert(message);

    var bookmarks = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
    var history = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

    var query = history.getNewQuery();
    window.alert("History: " + history);
    // When more than one base-folder is specified, it seems that no subfolders are found, _AT ALL_
    // So in order to know where a found bookmark lives, the query needs to be done on one base-folder
    // at a time, and then recursed through subdirectories, keeping a manual history of the path........
    //var folders = [bookmarks.toolbarFolder, bookmarks.bookmarksMenuFolder, bookmarks.unfiledBookmarksFolder];
    //query.setFolders(folders, folders.length);

    query.setFolders([bookmarks.toolbarFolder], 1);

    var options = history.getNewQueryOptions();
    options.queryType = options.QUERY_TYPE_BOOKMARKS;
    //window.alert("Pre query");
    //options.queryType = options.GROUP_BY_FOLDER;
    //window.alert("Post query");
    var result = history.executeQuery(query, options);

    var resultContainerNode = result.root;

    function queryFolderRec(resultList, folderNode) {
		folderNode.containerOpen = true;
		window.alert("History: " + history);
    
	    for (var i = 0; i < folderNode.childCount; i++) {
	    	var childNode = folderNode.getChild(i);
	    	if (childNode.type == childNode.RESULT_TYPE_URI)
	    	{
				resultList.push(childNode);
	    	}
	    	else if (childNode.type == childNode.RESULT_TYPE_FOLDER)
	    	{
	    		window.alert("Eureka!: " + childNode.parent.title);
	    	}
	    	//if(i > 200) { break; }
	    }
	    folderNode.containerOpen = false;
    }
	
	var resultList = [];
    queryFolderRec(resultList, resultContainerNode);

    

    resultList.sort( function(a,b) {
    	if (a.uri < b.uri) return -1;
    	if (a.uri > b.uri) return 1;
    	return 0;
	});
    // window.alert("Found " + resultList.length + " bookmarks");

    var dupList = {};
    var dupcount = 0;
    for (var i = 0; i < resultList.length - 1; i++) {
    	var thisBookmark = resultList[i];
    	var nextBookmark = resultList[i+1];
    	console.debug(dupcount + "/" + resultList.length);
    	if (thisBookmark.uri == nextBookmark.uri) {
    		dupcount++;
    		console.log(thisBookmark.uri);
    		if (!(thisBookmark.uri in dupList)) {
    			dupList[thisBookmark.uri] = [];
    			//window.alert("Created duplist[" + thisBookmark.uri + "]");
    		}
    		
    		if (dupList[thisBookmark.uri].indexOf(thisBookmark) == -1) {
    			dupList[thisBookmark.uri].push(thisBookmark);
    		}
    		if (dupList[thisBookmark.uri].indexOf(nextBookmark) == -1) {
    			dupList[thisBookmark.uri].push(nextBookmark);
    		}
    	}
    }

	// window.alert("Found " + dupcount + " dupes\n");

    /*for (var uri in dupList) {
    	if (typeof(uri) == "undefined") { continue; }
    	window.alert("URL: " + uri + "\nSites: " + dupList[uri]);
    }*/

    var win = window.openDialog("chrome://xulschoolhello/content/bookmarkdupwindow.xul", "bmdup", 
    	"chrome,width=500, height=500", {dupes: dupList, bookmarksService: bookmarks});
    /*var listbox = win.document.getElementById("lbDupUris");
    for (var uri in dupList) {
    	if (typeof(uri) == "undefined") { continue; }
    	listbox.appendItem(uri);
    }*/
  }
};
