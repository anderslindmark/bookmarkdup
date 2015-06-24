var dupList = {};
var bookmarksService = null;
var historyService = null;
var status = null;
var dupCount = 0;
var dupinfo = [];

function init() {
  bookmarksService = window.arguments[0].bmService;
  historyService = window.arguments[0].hService;

  setStatus("Loading bookmarks");
  findBookmarks();
  setlbDupUrisVals();
  setStatus("Bookmarks loaded. " + dupCount + " duplicates found");
  if (dupCount == 0) {
    setStatus("No duplicates found");
    window.resizeTo(400, 200);
  }

  document.getElementById("btnOpenBmark").disabled = false;
  document.getElementById("btnDelBmarks").disabled = false;
}

function onLoad() {
  setTimeout(init, 0);
}

function setStatus(msg, url) {
  var status = document.getElementById("status");
  if (typeof(url) == "undefined") {
    // status.class = "plain";
    status.setAttribute("class", "plain");
  }
  else {
    status.href = url;
    // status.class = "text-link";
    status.setAttribute("class", "text-link");
  }
  status.value = msg;
}

/**
 * Finds all bookmarks and creates the dupe list
 */
function findBookmarks() {
  function queryFolderRec(resultList, baseFolder, path) {
    // Setup new query
    // TODO: can resultList be removed from the argument?
    var query = historyService.getNewQuery();
    query.setFolders([baseFolder], 1);
    var options = historyService.getNewQueryOptions();
    options.queryType = options.QUERY_TYPE_BOOKMARKS;

    var result = historyService.executeQuery(query, options);
    var folderNode = result.root;

    // Fix path attribute
    if (path == "") {
      path = folderNode.title + "/";
    }
    else {
      path = path + folderNode.title + "/";
    }

    folderNode.containerOpen = true; // Open current folder

    for (var i = 0; i < folderNode.childCount; i++) {
      var childNode = folderNode.getChild(i);
      if (childNode.type == childNode.RESULT_TYPE_URI)
      {
        // Bookmark
        var obj = {node: childNode, path: path};
      resultList.push(obj);
      }
      else if (childNode.type == childNode.RESULT_TYPE_FOLDER)
      {
        // Folder
        queryFolderRec(resultList, childNode.itemId, path);
      }
    }
    folderNode.containerOpen = false; // Close current folder
  }

  // Query all three folder groups
  var resultList = [];
  queryFolderRec(resultList, bookmarksService.toolbarFolder, "");
  queryFolderRec(resultList, bookmarksService.bookmarksMenuFolder, "");
  queryFolderRec(resultList, bookmarksService.unfiledBookmarksFolder, "");

  // Sort the URI's for easy duplicate check
  resultList.sort( function(a,b) {
    if (a.node.uri < b.node.uri) return -1;
    if (a.node.uri > b.node.uri) return 1;
    return 0;
  });

  dupCount = 0;
  dupList = {}; // This contains a list of all duplicate bookmarks, on the form {node: bookmark, path: folderpath}
  for (var i = 0; i < resultList.length - 1; i++) {
    var thisBookmark = resultList[i];
    var nextBookmark = resultList[i+1];

    if (thisBookmark.node.uri == nextBookmark.node.uri) {
      // Dupe found
      dupCount++;
      if (!(thisBookmark.node.uri in dupList)) {
        dupList[thisBookmark.node.uri] = []; // Initialize this dupList[uri] entry
      }

      // Add both bookmarks, but check if they are already in the list first
      if (dupList[thisBookmark.node.uri].indexOf(thisBookmark) == -1) {
        dupList[thisBookmark.node.uri].push(thisBookmark);
      }
      if (dupList[thisBookmark.node.uri].indexOf(nextBookmark) == -1) {
        dupList[thisBookmark.node.uri].push(nextBookmark);
      }
      // dupList[uri] = [bookmark_1, bookmark_2, ..., bookmark_n]
    }
  }
}

/**
* Updates the left listbox with duplicate titles
*/
function setlbDupUrisVals() {
  var lbdup = document.getElementById("lbDupUris");

  // Clear list
  for (var i = lbdup.getRowCount()-1; i >= 0; i--) {
    lbdup.removeItemAt(i);
  }

  // Sort items
  var lbitemlist = [];
  for (var uri in dupList) {
    if (typeof(uri) == "undefined") {continue;}
    var title = dupList[uri][0].node.title;
    lbitemlist.push( {title: title, uri: uri} )
  }

  lbitemlist.sort( function(a,b) {
    if (a.title < b.title) return -1;
    if (a.title > b.title) return 1;
    return 0;
  });

  // Populate list
  for (var i = 0; i < lbitemlist.length; i++)
  {
    lbdup.appendItem( lbitemlist[i].title, lbitemlist[i].uri )
  }
}

/**
 * Clear details-listbox
 */
function clearDupDetails() {
  var lbdupdetails = document.getElementById("lbDupDetails");
  // Clear existing values:
  for (var i = lbdupdetails.getRowCount()-1; i >= 0; i--) {
    lbdupdetails.removeItemAt(i);
  }
}

/**
* Updates the right listbox with information for the selected duplicate
*/
function urisel() {
  var lbdup = document.getElementById("lbDupUris");
  var lbdupdetails = document.getElementById("lbDupDetails");

  item = lbdup.selectedItem;
  if (item == null) { return; }

  clearDupDetails();

  var uri = item.value;
  var bookmarks = dupList[uri];

  dupinfo = []; // clear dupinfo
  for (var i = 0; i < bookmarks.length; i++)
  {
    var bookmark = bookmarks[i].node;
    var path = bookmarks[i].path;

    // Create the row and add the columns
    var row = document.createElement('listitem');
    var cell = document.createElement('listcell');
    cell.setAttribute('label', path);
    cell.setAttribute('value', i);
    row.appendChild(cell);
    cell = document.createElement('listcell');
    cell.setAttribute('label', dateStrFromBookmarkTimestamp(bookmark.lastModified));
    cell.setAttribute('value', i);
    row.appendChild(cell);

    lbdupdetails.appendChild(row);
    dupinfo.push( {itemId: bookmark.itemId, uri: uri} )
  }
}

function dateStrFromBookmarkTimestamp(timestamp) {
    // TODO: This needs to use localized timestrings instead
    var d = new Date(timestamp/1000);
    var year = d.getFullYear();
    var m = d.getMonth()+1;
    var month = (m < 10) ? "0" + m : m;
    var date = (d.getDate() < 10) ? "0" + d.getDate() : d.getDate();
    var hours = (d.getHours() < 10) ? "0" + d.getHours() : d.getHours();
    var minutes = (d.getMinutes() < 10) ? "0" + d.getMinutes() : d.getMinutes();
    return year + "-" + month + "-" + date + " " + hours + ":" + minutes;
}

/**
 * Opens the current uri in a new tab
 */
function openbmark() {
  var lbdup = document.getElementById("lbDupUris");
  item = lbdup.selectedItem;
  if (item == null) { return; }
  uri = item.value;
  window.opener.openUILinkIn(uri, 'tab');
}

/**
 * Deletes the selected bookmarks
 */
function delbmarks() {
  var lbdupdetails = document.getElementById("lbDupDetails");
  var items = lbdupdetails.selectedItems;
  if (items.length == 0) { return; }

  var remove_ids = [];
  var uri = null;
  // Iterate over selected items
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var dupIndex = parseInt(item.firstChild.getAttribute("value"));
    var itemId = dupinfo[dupIndex].itemId;
    uri = dupinfo[dupIndex].uri;
    remove_ids.push(itemId); // Add to list of items to be removed

    // Iterate over current dupeList, remove items from that list
    var bookmarks = dupList[uri];
    for (var j = bookmarks.length-1; j >= 0; j--) {
      if (bookmarks[j].node.itemId == itemId) {
        bookmarks.splice(j, 1);
      }
    }
  }

  // If there is no longer sufficient bookmarks to be a dupe, delete this and deselect this item.
  if (dupList[uri].length <= 1) {
    delete dupList[uri];
    lbdupuris = document.getElementById("lbDupUris");
    lbdupuris.removeItemAt(lbdupuris.getIndexOfItem(lbdupuris.selectedItem));
    lbdupuris.selectedItem = null;
    clearDupDetails();
  }
  else {
    urisel();
  }

  // Delete the actual bookmarks
  for (var i = 0; i < remove_ids.length; i++) {
    bookmarksService.removeItem(remove_ids[i]);
  }

  var statusMsg = "";
  if (remove_ids.length > 1) {
    statusMsg += remove_ids.length + " x ";
  }
  statusMsg += uri + " has been removed.";

  setStatus(statusMsg, uri);
}
