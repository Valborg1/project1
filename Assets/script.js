$( document ).ready(function() {

var APIKey = "AIzaSyBhUO9Jc-Moam44mTvSABj2O4Jl6sulBWM";

// Main Search Functionality
$("#searchButton").on("click", function(e){
    e.preventDefault();
    $("#results").text("");
    $("#resultsIntro").remove();

var numberOfResults = $("#select-number").val();

var searchTitle = $("#byTitle").val().trim();
var searchAuthor = $("#byAuthor").val().trim();

if (!searchTitle && !searchAuthor) {
    alert("Please enter either a title or author.")
}

var title;
var author;

if (searchTitle !== "") {
        title = searchTitle;
    } else {
        title = "";
    }

if (searchAuthor !== "") {
        author = "+inauthor:" + searchAuthor;
    } else {
        author = "";
    }

var queryURL = "https://www.googleapis.com/books/v1/volumes?q=" + title + author + "&orderBy=relevance&key=" + APIKey

$.ajax({
    url : queryURL,
    method : "GET"
}).then(function(response){
    console.log(response);


    for (var i = 0; i < numberOfResults; i++) {

    // Query all Result Information
    var results = response.items[i].volumeInfo;

    var titleAPI = results.title;

    var authorAPI = results.authors;
    if (!authorAPI) {
        authorAPI = "Not Listed";
    } else {
        authorAPI = results.authors[0];
    }

    var publishedDateAPI = results.publishedDate;
    if (!publishedDateAPI) {
        publishedDateAPI = "Not Listed";
    } else {
        publishedDateAPI = publishedDateAPI.substring(0,4);
    }

    // var trimPubDateAPI = publishedDateAPI.substring(0,4);

    var descriptionAPI = results.description;
    if (!descriptionAPI) {
        descriptionAPI = "No description."
    }
    var trimDescAPI = descriptionAPI.split(" ").splice(0,35).join(" ");

    var imgAPI = results.imageLinks;
    if (!imgAPI) {
        imgAPI = ""
    } else {
        imgAPI = results.imageLinks.thumbnail
    }


    // Create Elements for Results
    var bookResult = $("<div>");
    bookResult.addClass("search-results bg-light");
    bookResult.attr("id", response.items[i].id)
    
    var titleRow = $("<div>");
    titleRow.addClass("row");

        var titleCol = $("<div>");
        titleCol.addClass("col-8");

            var title = $("<h3>");
            title.text(titleAPI)
    
        var btnCol = $("<div>");
        btnCol.addClass("col-4");

            var addBtn = $("<button>");
            addBtn.text("+Reading List");
            addBtn.addClass("btn btn-info float-right addToList")

    var main = $("<div>");
    main.addClass("main-wapper");

        var row = $("<div>");
        row.addClass("row");

        var col1 = $("<div>");
        col1.addClass("col-2")

            var img = $("<img>");
            img.addClass("img-fluid");
            img.attr("src", imgAPI);

        var col2 = $("<div>");
        col2.addClass("col-10");

            var author = $("<p>");
            author.text("Author: " + authorAPI);
            var publishedDate = $("<p>");
            publishedDate.text("Published: " + publishedDateAPI);
            var description = $("<p>");

            if (descriptionAPI === "No description.") {
                description.text(trimDescAPI);
            } else {
                description.text(trimDescAPI + "...");
            }

    // DYNAMICALLY CREATE RESULT
    
    // Create Row for Title and Btn
    bookResult.append(titleRow)

    titleCol.append(title);
    titleRow.append(titleCol);
   
    btnCol.append(addBtn);
    titleRow.append(btnCol);

    // Create a Row for Two Columns and All Info
    bookResult.append(main);
    main.append(row);

    // Create Column1 and IMG
    col1.append(img);
    row.append(col1);

    // Create Col2 and INFO
    col2.append(author);
    col2.append(publishedDate);
    col2.append(description);
    row.append(col2);

    // Append Full Result DIV
    $("#results").append(bookResult);
    };

  });

});

// Check Local Storage for Reading List and Populate
var readingList;
var list = JSON.parse(localStorage.getItem("readingList")) || [];

if (list) {
    readingList = list
    
    for (var k = 0; k < list.length; k++) {
        listURL = "https://www.googleapis.com/books/v1/volumes/" + list[k]
        populateReadingList();
    }
}


// Add a book to the Reading List
$("#results").on("click", "button.addToList", function(e){
    e.preventDefault();
    $("#readingListIntro").remove();
    
    var id = $(this).parent().parent().parent().attr("id");
    
    listURL = "https://www.googleapis.com/books/v1/volumes/" + id

    populateReadingList();

    readingList.push(id);
    localStorage.setItem("readingList",(JSON.stringify(readingList)));
    console.log(readingList);

 });

// Check Local Storage for Completed List and Populate
var completedList;
var cList = JSON.parse(localStorage.getItem("completedList")) || [];

if (cList) {
    completedList = cList
    
    for (var l = 0; l < cList.length; l++) {
        listURL = "https://www.googleapis.com/books/v1/volumes/" + cList[l].id

        populateCompletedList();
    }
}

var booksThisYear = 0;
var numberRead = localStorage.getItem("readThisYear");

if (numberRead) {
    booksThisYear = numberRead

    $("h3 span").text(booksThisYear);
} else {
    $("h3 span").text(booksThisYear)
}

//  Add Item to Completed List and Remove from Reading List
$(".readingList").on("click", "button.addToComplete", function (e){
    e.preventDefault();

    var id = $(this).parent().parent().parent().attr("id")
    var timeStamp = moment().format('MMMM Do');

    var bookInfo = {
        "id" : id,
        "timeStamp" : timeStamp
    };

    completedList.push(bookInfo);

    localStorage.setItem("completedList",(JSON.stringify(completedList)));

    var index = readingList.indexOf(id);
    if (index > -1) {readingList.splice(index,1)};
    localStorage.setItem("readingList",(JSON.stringify(readingList)));

    booksThisYear++;
    localStorage.setItem("readThisYear", booksThisYear);

    $(this).parent().parent().parent().remove();
}); 


//  Remove Item From Reading List
$(".readingList").on("click", "button.removeFromList", function (e){
    e.preventDefault();

    var id = $(this).parent().parent().parent().attr("id")
    var index = readingList.indexOf(id);
    
    if (index > -1) {readingList.splice(index,1)};

    localStorage.setItem("readingList",(JSON.stringify(readingList)));

    $(this).parent().parent().parent().remove();
}); 

//  Remove Item From Completed List
$(".completedList").on("click", "button.removeFromComplete", function (e){
    e.preventDefault();

    var title = $(this).parent().siblings(".data-info").children().text();

    console.log(title);
    var check = confirm("Are you sure you want to delete \"" + title + "\" from your completed books?")
    if (check === false) {
        return;
    }

    var id = $(this).parent().parent().parent().attr("id")

    var index = completedList.findIndex(x => x.id === id);
    console.log("index", index)
    
    if (index > -1) {completedList.splice(index,1)};

    localStorage.setItem("completedList",(JSON.stringify(completedList)));

    booksThisYear--;
    localStorage.setItem("readThisYear", booksThisYear);

    currentYear = moment().format("YYYY");
    
    $("h3 span").text(booksThisYear)
    $("#booksReadTitle").text("Books Read During " + currentYear + " ");

    $(this).parent().parent().parent().remove();
}); 

// Function to Create a Reading List Item in the DOM
function populateReadingList() {
    console.log(listURL)

    $.ajax({
        url : listURL,
        method : "GET"
    }).then(function(response){
        console.log(response);

        var titleAPI = response.volumeInfo.title;

        var toRead = $("<div>");
        toRead.attr("id", response.id);
        // toRead.addClass("toRead bg-light");

        var row = $("<div>");
        row.addClass("row list-item");

        var col1 = $("<div>");
        col1.addClass("pad col-lg-8 col-md-10");

        var col2 = $("<div>");
        col2.addClass("pad col-lg-2 col-md-1");

        var col3 = $("<div>");
        col3.addClass("pad col-lg-2 col-md-1");

        var title = $("<a>");

        var hr = $("<hr/>");

        var completeBtn = $("<button>");
        completeBtn.addClass("btn btn-sm btn-success fa fa-check addToComplete")
        completeBtn.attr("data-toggle", "tooltip");
        completeBtn.attr("data-placement", "top");
        completeBtn.attr("title", "Mark as Complete");

        var removeBtn = $("<button>");
        removeBtn.addClass("btn btn-sm btn-warning fa fa-times removeFromList");
        removeBtn.attr("data-toggle", "tooltip");
        removeBtn.attr("data-placement", "top");
        removeBtn.attr("title", "Remove from List");

        title.text(titleAPI);
        title.attr("href", response.volumeInfo.infoLink)
        title.attr("target", "_blank")

        toRead.append(row);
        row.append(col1);
        col1.append(title);

        row.append(col2);
        col2.append(completeBtn);

        row.append(col3);
        col3.append(removeBtn);

        toRead.append(hr);

        $("#list").append(toRead);

    });
}

function populateCompletedList() {
    // console.log(listURL);
    time = cList[l].timeStamp;
    console.log("time", time)

    $.ajax({
        url : listURL,
        method : "GET"
    }).then(function(response){
        console.log(response);

        var titleAPI = response.volumeInfo.title;

        var read = $("<div>");
        read.attr("id", response.id);

        var row = $("<div>");
        row.addClass("row list-item");

        var col1 = $("<div>");
        col1.addClass("data-info col-lg-5 col-md-6");

        var col2 = $("<div>");
        col2.addClass("col-lg-5 col-md-5");

        var col3 = $("<div>");
        col3.addClass("col-lg-2 col-md-1");

        var title = $("<a>");

        var hr = $("<hr/>");

        var completedDate = $("<p>");
        completedDate.text(time);
        completedDate.addClass("text-center")
        completedDate.attr("data-toggle", "tooltip");
        completedDate.attr("data-placement", "top");
        completedDate.attr("title", "Completed Date");

        var removeBtn = $("<button>");
        removeBtn.addClass("btn btn-sm btn-warning fa fa-times removeFromComplete");
        removeBtn.attr("data-toggle", "tooltip");
        removeBtn.attr("data-placement", "top");
        removeBtn.attr("title", "Remove from List");

        title.text(titleAPI);
        title.attr("href", response.volumeInfo.infoLink)
        title.attr("target", "_blank")

        read.append(row);
        row.append(col1);
        col1.append(title);

        row.append(col2);
        col2.append(completedDate);

        row.append(col3);
        col3.append(removeBtn);

        read.append(hr);
        
        $("#cList").append(read);

    });
}

// Maintain Counter + Local Storage for Calendar Year
var currentYear;

function setYear() {
    var dateCheck = localStorage.getItem("currentYear");
    currentYear = moment().format("YYYY");

    $("#booksReadTitle").text("Books Read During " + currentYear + " ");

    if (dateCheck === "" || dateCheck === currentYear) {
        localStorage.setItem("currentYear", currentYear);
    } else {
        localStorage.clear();
        localStorage.setItem("currentYear", currentYear);
    };
};

setYear();


// Tool Tips Option
// $("body").tooltip({ selector: '[data-toggle=tooltip]' });
});