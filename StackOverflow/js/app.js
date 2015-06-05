$(document).ready( function() {
    "use strict";
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

    $('.inspiration-getter').submit( function(event){
        // zero out results if previous search has run
        $('.results').html('');
        // get the value of the tags the user submitted
        var tags = $(this).find("input[name='answerers']").val();
        getTopAnswers(tags);
    });



});

//*****************************************
// Common functions
//
//*****************************************

// takes error string and turns it into displayable DOM element
var showError = function(error){
    var errorElem = $('.templates .error').clone();
    var errorText = '<p>' + error + '</p>';
    errorElem.append(errorText);
};


function displayError(error) {
    var errorElem = showError(error);
    $('.search-results').append(errorElem);
}

// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
    var results = resultNum + ' results for <strong>' + query;
    return results;
};

//*****************************************
// Functions for questions
//
//*****************************************
// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {
	"use strict";
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET"
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		  displayError(error) ;
	});
};


//*****************************************
// Functions for top answerers
//
//*****************************************

function getResultItemArray(item) {

    var result = [
            "<a href=\""+ item.user.link + "\" target=\"_blank\">" + item.user.display_name + "</a> ",
            "<img src=\"" +item.user.profile_image + "\" alt=\"" +item.user.display_name+ "\">",
        item.post_count,
        item.score,
        item.user.reputation
    ];
    return result;

};

function initializeTable() {
    var tableHTML = "<table id=\"answerersTableID\" class=\"display\">";
    tableHTML += "<thead><tr><th>User</th><th>Avatar</th><th>Post Count</th><th>Score</th><th>Reputation</th></tr></thead>";
    tableHTML += "<tbody id=\"answerersTableBodyID\"></tbody></table>";
    $('.results').append(tableHTML);
    $('#answerersTableID').DataTable();
}

function displayResults(tags, result) {
    var searchResults = showSearchResults(tags, result.items.length);
    $('.search-results').html(searchResults);
}

function displayResultItem(i, item, resultTable)     {
    var resultItemArray = getResultItemArray(item);
    resultTable.row.add(resultItemArray ).draw();
}

function processResults(tags, result)   {
    displayResults(tags, result);
    initializeTable();

    var resultTable = $('#answerersTableID').DataTable();

    $.each(result.items, function(i, item) {
        displayResultItem(i, item, resultTable);
    });
}

function getTopAnswers(tags) {

    var period = 'all_time';
    var request = {site: 'stackoverflow' };

    var result = $.ajax({
        url: "http://api.stackexchange.com/2.2/tags/"+tags+ "/top-answerers/"+period,
        data: request,
        dataType: "jsonp",
        type: "GET"
    })
        .done(function(result){
            processResults(tags, result);
        })
        .fail(function(jqXHR, error, errorThrown){
            displayError(error) ;
        });

};
