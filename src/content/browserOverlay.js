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


	// When more than one base-folder is specified, it seems that no subfolders are found, _AT ALL_
    // So in order to know where a found bookmark lives, the query needs to be done on one base-folder
    // at a time, and then recursed through subdirectories, keeping a manual history of the path........
    //var folders = [bookmarks.toolbarFolder, bookmarks.bookmarksMenuFolder, bookmarks.unfiledBookmarksFolder];
    //query.setFolders(folders, folders.length);


    var bookmarks = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
    var history = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);

    
    //window.alert("Pre query");
    //options.queryType = options.GROUP_BY_FOLDER;
    //window.alert("Post query");

    function queryFolderRec(resultList, baseFolder, path) {
	    var query = history.getNewQuery();
	    query.setFolders([baseFolder], 1);

	    var options = history.getNewQueryOptions();
	    options.queryType = options.QUERY_TYPE_BOOKMARKS;

	    var result = history.executeQuery(query, options);

	    var folderNode = result.root;
	    if (path == "") {
	    	path = folderNode.title + "/";
	    }
	    else {
	    	path = path + folderNode.title + "/";
	    }

	    //window.alert(path);

		folderNode.containerOpen = true;
    
	    for (var i = 0; i < folderNode.childCount; i++) {
	    	var childNode = folderNode.getChild(i);
	    	if (childNode.type == childNode.RESULT_TYPE_URI)
	    	{
	    		var obj = {node: childNode, path: path};
				resultList.push(obj);
				//if (i > 5 && i < 10)
				//	window.alert("obj.node: " + obj.node + ", obj.path: " + obj.path);
	    	}
	    	else if (childNode.type == childNode.RESULT_TYPE_FOLDER)
	    	{
	    		queryFolderRec(resultList, childNode.itemId, path);
	    	}
	    }
	    folderNode.containerOpen = false;
    }
	
	var resultList = [];
    queryFolderRec(resultList, bookmarks.toolbarFolder, "");
    queryFolderRec(resultList, bookmarks.bookmarksMenuFolder, "");
    queryFolderRec(resultList, bookmarks.unfiledBookmarksFolder, "");

    resultList.sort( function(a,b) {
    	if (a.node.uri < b.node.uri) return -1;
    	if (a.node.uri > b.node.uri) return 1;
    	return 0;
	});
    // window.alert("Found " + resultList.length + " bookmarks");

    var dupList = {};
    var dupcount = 0;
    for (var i = 0; i < resultList.length - 1; i++) {
    	var thisBookmark = resultList[i];
    	var nextBookmark = resultList[i+1];
    	console.debug(dupcount + "/" + resultList.length);
    	if (thisBookmark.node.uri == nextBookmark.node.uri) {
    		dupcount++;
    		if (!(thisBookmark.node.uri in dupList)) {
    			dupList[thisBookmark.node.uri] = [];
    			//window.alert("Created duplist[" + thisBookmark.uri + "]");
    		}
    		
    		if (dupList[thisBookmark.node.uri].indexOf(thisBookmark) == -1) {
    			dupList[thisBookmark.node.uri].push(thisBookmark);
    		}
    		if (dupList[thisBookmark.node.uri].indexOf(nextBookmark) == -1) {
    			dupList[thisBookmark.node.uri].push(nextBookmark);
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
