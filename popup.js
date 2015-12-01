//

var tempStorage = {};

$(function() {

// Search the bookmarks when entering the search keyword.
  $('#search').change(function() {
    $('#bookmarks').empty();
    loadBookmarks($('#search').val());
  });

  $('#checkTitleCancelBtn').click(function() {
    $('#checkTitleModal').fadeOut();
  });

  $('#checkTitleSaveBtn').click(function() {
    var bmId = $('#bmId').val();
    if (bmId.length > 0){
      var title = $('#checkTitleSuggested').val();
      chrome.bookmarks.update(bmId, {
        title: title
      });
      tempStorage.anchor.text(title);
      tempStorage.bookmarkNode.title = title;
      $('#checkTitleModal').fadeOut();
    }
  });

});

//Get bookmark site Title
function editNode(bookmarkNode) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", bookmarkNode.url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var title = (/<title>(.*?)<\/title>/m).exec(xhr.responseText)[1];
      title = $('<textarea />').html(title).text();
      if (title.length > 0) {
        $('#bmId').val(bookmarkNode.id);
        $('#checkTitleCurrent').val(bookmarkNode.title);
        $('#checkTitleSuggested').val(title);
        $('#checkTitleModal').fadeIn();
      }
    }
  }
  xhr.send();
}

// Traverse the bookmark tree, and print the folder and nodes.
function loadBookmarks(query) {
  var bookmarkTreeNodes = chrome.bookmarks.getTree(
    function(bookmarkTreeNodes) {
      $('#bookmarks').append(loadTreeNodes(bookmarkTreeNodes, query));
    });
}

function loadTreeNodes(bookmarkNodes, query) {
  var list = $('<ul>');
  var i;
  for (i = 0; i < bookmarkNodes.length; i++) {
    list.append(loadNode(bookmarkNodes[i], query));
  }
  return list;
}

function loadNode(bookmarkNode, query) {
  if (bookmarkNode.title) {
    if (query && !bookmarkNode.children) {
      if (String(bookmarkNode.title).indexOf(query) == -1) {
        return $('<span></span>');
      }
    }

    var lineItem = $('<div>');
    var anchor = $('<a>');
    anchor.attr('href', bookmarkNode.url);

    anchor.text(bookmarkNode.title);

    anchor.click(function() {
      chrome.tabs.create({
        url: bookmarkNode.url
      });
    });

    lineItem.append(anchor);
    var editButton = $('<button>');
    editButton.text("Edit");
    editButton.val(bookmarkNode.id).addClass('editBtn');
    editButton.click(function() {
      tempStorage.bookmarkNode = bookmarkNode;
      tempStorage.anchor = anchor;
      editNode(bookmarkNode);
    });
    lineItem.append(editButton);

    var container = $('<div>');
    container.text(bookmarkNode.title);

    var lineContent = bookmarkNode.children ? container : lineItem;
  }

  var li = $(bookmarkNode.title ? '<li>' : '<div>').append(lineContent);
  if (bookmarkNode.children && bookmarkNode.children.length > 0) {
    li.append(loadTreeNodes(bookmarkNode.children, query));
  }
  return li;
}

// document.addEventListener('DOMContentLoaded', function() {
//   loadBookmarks();
// });

$(document).ready(function() {
  loadBookmarks();
});
