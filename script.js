var color =       ['#de4a60', '#efb14c', '#e5cb5d', '#79c268', '#21bfa3', '#459ba8', '#e868a1', '#bf63a6', '#9f6e53', '#333333'];
var hover_color = ['#c43046', '#d69833', '#cbb143', '#60a94f', '#08a68a', '#2c828f', '#cf4f88', '#a64a8d', '#855439', '#1a1a1a'];
var color_scheme = 0;
var SPEED = 300;
var selected_element;
var current_href, current_menu_pane = 2;
var num_notes = 0, num_tabs = 6;
var notes = [ ]; //1 active, 2 archived, 3 deleted
var important = [ ]; //1 important, 0 normal
var badges = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] //1 completed, 0 incomplete
var num_badges = 25;
var last_tag_position = 0;
var all_tags = [ ];
var filter_tag = 'all';
//user information
var email, password;
var toggle_color = 'rgb(255, 255, 255)';

//JAVASCRIPT
function update() {
	$('#top-menu, a#option-menu').css('background-color', color[color_scheme]);
	$('a#top-menu:nth-child(' + (current_menu_pane + 1) + ')').css('background-color', '#f4f4f4');
	$('a#top-menu:nth-child(' + (current_menu_pane + 1) + ')').css('color', '#2f2f2f');
	
	$('label#high-liner').css('background-color', color[color_scheme]);
	
	$('#top-pane').css('background-color', color[color_scheme]);
	$('.drop-down-tab li').css('background-color', color[color_scheme]);
	$('::-webkit-scrollbar-track').css('background-color', color[color_scheme]);
	$('::-webkit-scrollbar-button').css('background-color', hover_color[color_scheme]);
	if($('div#box').children('#tick').css('border-color') != 'rgb(95, 95, 95) rgb(95, 95, 95) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)') {
		$('div#box').children('#tick').css('border', '2px solid ' + color[color_scheme]);			
		$('div#box').css('border', '2px solid transparent'); 
	}
	$('box#box').children('#tick').css('border-top', 'none');
	$('box#box').children('#tick').css('border-right', 'none');		
	for(var b = 0; b < num_badges; ++b) {
		if(badges[b] == 1) {
			$('#badges div').eq(b).css('background-color', color[color_scheme]);
			$('#badges div').eq(b).css('color', 'white');
			$('#badges div').eq(b).css('opacity', '1');
		} else {
			$('#badges div').eq(b).css('background-color', 'transparent');
			$('#badges div').eq(b).css('color', '#5f5f5f');
			$('#badges div').eq(b).css('opacity', '0.5');
		}
	}
	update_tag_list();
	store_data();
}

function update_tag_list() {
	all_tags = [ ];
	for(var n = 0; n < notes.length; ++n) {
		for(var t = 0; t < ($('#tag-list a').size() - 1); ++t) {
			if(contains(all_tags, $('#tag-list a').eq(t).html()) == false && $('#tag-list a').eq(t).html() != " ") {				
				all_tags.push($('#tag-list a').eq(t).html());
			}
		}
	}
	for(var t = 0; t < all_tags.length; ++t) if(all_tags[t] == " ") all_tags.splice(t, 1);	
	
	$('#top-tag-list a').remove();
	var the_all_tag = document.createElement('a');	
	the_all_tag.innerHTML = 'all';
	document.getElementById('top-tag-list').appendChild(the_all_tag);
	for(var t = 0; t < all_tags.length; ++t) {
		var tag_item = document.createElement('a');	
		tag_item.innerHTML = all_tags[t];
		document.getElementById('top-tag-list').appendChild(tag_item);
	}
}

function contains(array, value) { return array.indexOf(value) > -1; }

function store_data() {
	if(typeof(Storage) != "undefined") {
		localStorage.setItem('important', important);
		localStorage.setItem('notes', notes);
		localStorage.setItem('badges', badges);
		localStorage.setItem('num_notes', num_notes);
		localStorage.setItem('num_badges', num_badges);
		localStorage.setItem('color_scheme', color_scheme);
		localStorage.setItem('email', email);
		for(var n = 0; n < notes.length; ++n) {
			localStorage.setItem('note' + n, $('section').eq(n).html());
		}
	}
}

function reset_local_storage() {
	if(typeof(Storage) != "undefined") {
		localStorage.setItem('important', ' ');
		localStorage.setItem('notes', ' ');
		localStorage.setItem('badges', [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]);
		localStorage.setItem('num_notes', 0);
		localStorage.setItem('num_badges', 25);
		localStorage.setItem('color_scheme', 0);
		localStorage.setItem('email', ' ');
	}
}

function replace_carriage_return(textarea, replace_with) { 
	textarea.value = escape(textarea.value);

	for(i = 0; i < textarea.value.length; i++) { 	
	 	if(textarea.value.indexOf("%0D%0A") > -1) 
	 		textarea.value = textarea.value.replace("%0D%0A", replace_with);		
		else if(textarea.value.indexOf("%0A") > -1) 
			textarea.value = textarea.value.replace("%0A", replace_with);		
		else if(textarea.value.indexOf("%0D") > -1) 
			textarea.value = textarea.value.replace("%0D", replace_with);			
	}
	
	textarea.value = unescape(textarea.value);
}

function separate_tags(raw_input) {
	var final = '';
	var tags_array = raw_input.split("    ");
	
	for(var t = 0; t < tags_array.length; ++t) final += '<a> ' + tags_array[t] + '</a>';	
	
	return final;
}

function receive_entry_data() {
	var title = document.getElementById('entry-box-title');
	var body = document.getElementById('entry-box-body');
	var tag = document.getElementById('entry-tag-list');
	
	if(title.value != title.defaultValue || body.value != body.defaultValue) {
		if(title.value == title.defaultValue) title.value = '';
		if(body.value == body.defaultValue) body.value = '';
	
		var entry = document.createElement('section');	
		entry.setAttribute('id', 'inner-tile');	
		entry.setAttribute('class', 'inner-tile');
		replace_carriage_return(body, '</br>');
		
		//check for a list
		if(body.value.indexOf("</br>-") > -1 || body.value.indexOf("-") == 0) {
			var list_items = [];
			var list_html = '<ul id=\"todo-list\">';
			var last_index = -1;
			var start_of_item_index = [];
			
			for(var i = 0; i < body.value.length; ++i) {
				if(body.value.indexOf("-", i) != last_index) {
					last_index = body.value.indexOf("-", i);
					start_of_item_index.push(last_index);
				}
			}
			start_of_item_index.pop();
			start_of_item_index.push(body.value.length + 5);
			
			for(i = 0; i < start_of_item_index.length - 1; ++i) {
				list_items.push('<li> <box id=\"box\"> <label id=\"tick\"> </label> </box> ' + body.value.slice(start_of_item_index[i] + 1, start_of_item_index[i + 1] - 5) + ' </li>');
				list_html += list_items[i];
			}			
			
			body.value = list_html;
			
			entry.innerHTML = '<div class=\"inner-tile\"> \
								   <div id=\"title\" contenteditable=\"true\"> ' + title.value + ' </div> \
								   <div id=\"body\"> ' + body.value + ' </div> \
								   <div id=\"tag-list\"> ' + separate_tags(tag.value) + '</div> \
							   </div>';							   
		} else {				
		/*if($('label#entry-high-liner').css('background-color') == toggle_color) {
			entry.innerHTML = '<label id=\"high-liner\"> </label> \
							   <div class=\"inner-tile\"> \
								   <p id=\"title\" style=\"color: white\"> ' + title.value + ' </p> \
								   <p id=\"body\"> ' + body.value + ' </p> \
							   </div>';
		}
		else {*/
			if(tag.value == " Tag this note... ") {
				entry.innerHTML = '<div class=\"inner-tile\"> \
									   <div id=\"title\" contenteditable=\"true\"> ' + title.value + ' </div> \
									   <div id=\"body\" contenteditable=\"true\"> ' + body.value + ' </div> \
								   </div>';
			} else {
				entry.innerHTML = '<div class=\"inner-tile\"> \
									   <div id=\"title\" contenteditable=\"true\"> ' + title.value + ' </div> \
									   <div id=\"body\" contenteditable=\"true\"> ' + body.value + ' </div> \
									   <div id=\"tag-list\"> ' + separate_tags(tag.value) + ' </div> \
								   </div>';
			}
		//}
		}
		
		document.getElementById('inner-content').appendChild(entry);
		++num_notes;
		notes.push(1);
		important.push(0);
		$(entry).fadeOut(0);
	
		//reset
		title.style.color = '#d3d3d3';
		body.style.color = '#d3d3d3';
		title.value = title.defaultValue;
		body.value = body.defaultValue;	
		tag.value = tag.defaultValue;
		last_tag_position = 0;
		
		$(entry).fadeIn(SPEED);
		update();
	}
}

function hide_notes_except(this_one) {
	for(var n = 0; n < notes.length; ++n) {
		if(notes[n] == this_one) $('section').eq(n).show();
		else $('section').eq(n).hide(); 
		switch(this_one) {
			case 3: $('section').eq(n).css('opacity', '0.5'); break;	
			case 2: 	
			case 1: $('section').eq(n).css('opacity', '1'); break;
		}
	}
}

function hide_notes_under(this_tag) {	
	for(var n = 0; n < notes.length; ++n) {
		var selected_tag_list = $('section').eq(n).children('.inner-tile').children('#tag-list');
		
		if(current_menu_pane == notes[n] + 1 && (contains(selected_tag_list.html(), this_tag) || this_tag == 'all')) $('section').eq(n).show();
		else $('section').eq(n).hide();	
	}
}

function check_badges() {
	if(num_notes >= 1) badges[0] = 1;
	if(num_notes >= 50) badges[1] = 1;
	if(num_notes >= 100) badges[2] = 1;
	if(num_notes >= 250) badges[3] = 1;
}

function insert(a, b, position) {
	return [a.slice(0, position), b, a.slice(position)].join('');
}

//JQUERY
$(window).load(function() { 
	$('#settings').hide();
	$('.drop-down-tab li').fadeOut(0); 
	//$('div#top-menu').fadeOut(0);
	$('div#notification').slideUp(0);
	$('label#entry-high-liner').css('background-color', toggle_color);
	
	//store_data();
	if(typeof(Storage) != "undefined") {
		notes = JSON.parse('[' + localStorage.getItem('notes') + ']');
		num_notes = localStorage.getItem('num_notes');
		important = JSON.parse('[' + localStorage.getItem('important') + ']');
		badges = JSON.parse('[' + localStorage.getItem('badges') + ']');
		num_badges = localStorage.getItem('num_badges');
		color_scheme = localStorage.getItem('color_scheme');
		email = localStorage.getItem('email');
		for(var n = 0; n < notes.length; ++n) {
			var entry = document.createElement('section');	
			entry.setAttribute('id', 'inner-tile');	
			entry.setAttribute('class', 'inner-tile');
			entry.innerHTML = localStorage.getItem('note' + n);
			document.getElementById('inner-content').appendChild(entry);
		}	
		hide_notes_except(1); 
		
		for(var n = 0; n < all_tags.length; ++n) {
			var tag_item = document.createElement('a');	
			tag_item.innerHTML = all_tags[n];
			document.getElementById('top-tag-list').appendChild(tag_item);
		}
	}
	update(); 
});	
	
function poll() {
	$.ajax({
        type: "GET",
        url: "main.html",

        async: true,
        cache: false,

        success: function(data) {
        	if(!$('#margin-maker').is(':animated')) {
		    	if($(document).scrollTop() != 0) {
		    		$('#margin-maker').animate({ marginTop: '-58px' }, SPEED);
		    		$('#top-tag-list').css('box-shadow', '1px 1px 1px #d3d3d3');
		    	}
				else {
					$('#margin-maker').animate({ marginTop: '0px' }, SPEED);
		    		$('#top-tag-list').css('box-shadow', 'none');
				}
			}
            setTimeout(poll, 1);            
        }
    });
}
	
$(document).ready(function() {
	poll();
	
	//top menu
	$('a.menu-with-options').click(function() { $('.drop-down-tab li').fadeIn(SPEED); });
	$('.drop-down-tab').mouseleave(function() { $('.drop-down-tab li').fadeOut(SPEED); });
	$('a#top-menu').click(function() { 
		current_href = $(this).attr('href'); 
		current_menu_pane = $(this).index();		
		
		if(current_href == '#') {
			$('#entry-box').show(); 
			hide_notes_except(1); 
		}	
		else {
			$('#entry-box').hide();  
		}		
		$('#settings').hide(); 
		if(current_href == '#archive') { 
			hide_notes_except(2); 
		} 
		else if(current_href == '#trash') {	
			hide_notes_except(3); 
		} 
		if(current_href == '#settings') { 
			hide_notes_except(-1);
			$('#settings').show(); 
			$('#top-tag-list').hide(); 
		} else {			
			$('#top-tag-list').show(); 
		}
	});				
	$('a#top-menu, a#option-menu').mouseenter(function() { 
		if(current_menu_pane != $(this).index()) { //current page indicator
			this.style.backgroundColor = hover_color[color_scheme]; 
			this.style.color = 'white';	
		} 		
	});
	$('a#top-menu').mousedown(function(event) {
		if($(this).attr('href') == "#trash" && event.which == 3) { 
			$('slide-menu#top-menu').animate({ marginLeft: '0px', opacity: "1"}, SPEED); }
	});
	$('slide-menu#top-menu').mouseleave(function() { 
		$('slide-menu#top-menu').animate({ marginLeft: '-85px', opacity: "1"}, SPEED);
	});
	$('a#top-menu').click(function() {	
		for(var i = 1; i < num_tabs + 1; ++i) {
			$('a#top-menu:nth-child(' + i +')').css('background-color', color[color_scheme]); 
			$('a#top-menu:nth-child(' + i +')').css('color', 'white'); 
		}		
		this.style.backgroundColor = '#f4f4f4';
		this.style.color = '#2f2f2f'; 
	});
	$('a#top-menu, a#option-menu, slide-menu#top-menu').bind('mouseleave mouseup', function() { 
		if(current_menu_pane != $(this).index()) this.style.backgroundColor = color[color_scheme]; 
		else {
			this.style.backgroundColor = '#f4f4f4';
			this.style.color = '#2f2f2f'; 
		} 
	});	
	
	//tag list
	$('#top-tag-list').delegate('a', 'mouseenter', function() { this.style.color = color[color_scheme]; });
	$('#top-tag-list').delegate('a', 'mouseleave', function() { this.style.color = '#d3d3d3'; });
	$('#top-tag-list').delegate('a', 'mouseup', function() { 
		this.style.color = color[color_scheme]; 
		
		filter_tag = this.innerHTML;
		hide_notes_under(filter_tag);
	});
	$('#top-tag-list').delegate('a', 'mousedown', function() { this.style.color = hover_color[color_scheme]; });
	$('body').delegate('#tag-list a', 'mouseenter', function() { this.style.color = color[color_scheme]; });
	$('body').delegate('#tag-list a', 'mouseleave', function() { this.style.color = '#d3d3d3'; });
	$('body').delegate('#tag-list a', 'mouseup', function() { 
		this.style.color = color[color_scheme]; 
		
		filter_tag = this.innerHTML;
		hide_notes_under(filter_tag);
	});
	$('body').delegate('#tag-list a', 'mousedown', function() { this.style.color = hover_color[color_scheme]; });
		
	//drop down menu
	$('.drop-down-tab li').mouseenter(function() { this.style.backgroundColor = hover_color[color_scheme]; });
	$('.drop-down-tab li').mouseleave(function() { this.style.backgroundColor = color[color_scheme]; });	
	$('ul#color-chooser li').click(function() {	color_scheme = $(this).index(); update(); });
	
	//entry	
    $('textarea')
		.focus(function() {	if(this.value == this.defaultValue) this.value = ''; })
		.blur(function() { if(this.value == '') this.value = this.defaultValue; });	
    $('textarea#entry-box-title').focus(function(e) { this.style.color = '#2f2f2f'; });	
	$('textarea#entry-box-body').focus(function(e) { this.style.color = '#5f5f5f'; });		
	$('textarea#entry-tag-list').focus(function(e) { this.style.color = color[color_scheme]; });	
    $('textarea#entry-box-title').focusout(function() {	
    	if(this.value != '') this.style.color = '#2f2f2f';	
    	else if(this.value == '') this.style.color = '#d3d3d3'; 
    });	
    $('textarea#entry-box-body').focusout(function() {	
    	if(this.value != '') this.style.color = '#5f5f5f';	
    	else if(this.value == '') this.style.color = '#d3d3d3'; 
    });		
    $('textarea#entry-tag-list').focusout(function() {	
    	this.style.color = '#d3d3d3'; 
    });		  		
    $('textarea#entry-box-body').keypress(function(e) {	entry_body += String.fromCharCode(e.which); });
    $('textarea#entry-box-title').keypress(function(e) { if(e.which == 13) e.preventDefault(); });
    $('textarea#entry-tag-list').on('keydown', function(e) {
    	if(e.which == 8) {
    		if(this.value.substr(this.value.length - 1) == '#') {
				//e.preventDefault();
				this.value = this.value.substring(0, this.value.length - 4);
				//last_tag_position = this.value.length + 1;
			}
    	}
    	else if(e.which == 13) {
    		e.preventDefault();
    		
			this.value = insert(this.value, '#', last_tag_position);
			this.value += '    ';			
			last_tag_position = this.value.length;
    	}
    });
	/*
    $('body').delegate('label#entry-high-liner, label#high-liner, p#title' , 'click', function() {
		var index = $('section').index($(selected_element).parents('section:first'));
		var title = $(this).parents('section').children('.inner-tile').children('#title');
		var label = $(this).parents('section').children('#high-liner');
    	if(important[index] == 0) { 
    		important[index] = 1; 
    		label.css('opacity', '0'); 
    		title.css('color', '#2f2f2f');
    	}
    	else { 
    		important[index] = 0; 
    		label.css('opacity', '1'); 
    		title.css('color', 'white');
    	}
    });*/
    		
    //change color of button
	$('input[type="button"]').bind('mouseenter mouseup', function() { 
		this.style.backgroundColor = color[color_scheme];
		this.style.border = '1px solid ' + color[color_scheme];
		this.style.color = 'white';	
	});	
	$('input[type="button"]').mouseleave(function() { 
		this.style.backgroundColor = 'white';
		this.style.border = '1px solid white';
		this.style.color = '#2f2f2f'; 
	});
	$('input[type="button"]').mousedown(function() { 
		this.style.backgroundColor = hover_color[color_scheme];
		this.style.border = '1px solid ' + hover_color[color_scheme];
		this.style.color = 'white';	
	});
	//make a new element with the given user data
	$('#entry-button').click(function() { receive_entry_data(); }); 
	
	//update size		
	$('#entry-box, #inner-content, #top-tag-list').css('width', ($(document).width() - 50) + 'px');		
	$('div#account-info').css('width', ($(document).width() - 50) + 'px');
	$('div#account-info table').css('width', (($(document).width() - 50)/2) + 'px');
	$('textarea#entry-box-title').css('width', ($(document).width() - 80) + 'px');
	$('textarea#entry-box-body').css('width', ($(document).width() - 70) + 'px');
	$('textarea#entry-tag-list').css('width', ($(document).width() - 150) + 'px');
	
	//context menu
	$('*', document.body, 'body *').mousedown(function(event) { 
		if(event.which == 3) {
			selected_element = event.target; 
			var index = $('section').index($(selected_element).parents('section:first'));
			if(notes[index] == 1) $('#items').html('<li> archive </li> <li> delete </li>');
			else if(notes[index] == 2) $('#items').html('<li> unarchive </li> <li> delete </li>');
			else if(notes[index] == 3) $('#items').html('<li> restore </li> <li> delete forever </li>');			
		}
		else $('#context-menu').fadeOut(SPEED); 
	});
	$(document).bind('contextmenu', function(e) {
		e.preventDefault();       
		if($(selected_element).parents('section:first').attr('id') == 'inner-tile') {          
			$('#context-menu').css('left', e.pageX);   
			$('#context-menu').css('top', e.pageY - $(document).scrollTop());
			$('#context-menu').fadeIn(SPEED); 
		} 
	});
	$('#items').delegate('li', 'mouseenter', function() { 
		this.style.backgroundColor = color[color_scheme]; 
		this.style.color = 'white'; 
	});
	$('#items').delegate('li', 'mouseleave', function() { 
		this.style.backgroundColor = 'white'; 
		this.style.color = '#2f2f2f';
	});
	$('#items').delegate('li', 'mousedown', function() { this.style.backgroundColor = hover_color[color_scheme]; });
	$('#items').delegate('li', 'click', function() { 
		$('#context-menu').fadeOut(SPEED); 
					
		$('div#notification').slideDown(SPEED);	
		var index = $('section').index($(selected_element).parents('section:first'));
		var parent = $(selected_element).parents('section:first');
		
		switch(this.innerHTML) {
			case ' delete ':
				notes[index] = 3;
				parent.fadeOut(SPEED); 	
				document.getElementById('notification-message').innerHTML = 'note deleted.';	
				break;	
			case ' delete forever ':
				parent.fadeOut(SPEED, function() {	
					notes.splice(index, 1);	
					parent.remove();
					update();
				}); 	
				document.getElementById('notification-message').innerHTML = 'note deleted forever.';	
				break;	
			case ' archive ':
				notes[index] = 2;
				parent.fadeOut(SPEED); 	
				document.getElementById('notification-message').innerHTML = 'note archived.';	
				break;
			case ' unarchive ':
				notes[index] = 1;
				parent.fadeOut(SPEED); 	
				document.getElementById('notification-message').innerHTML = 'note unarchived.';	
				break;
			case ' restore ':
				notes[index] = 1;
				parent.fadeOut(SPEED); 	
				document.getElementById('notification-message').innerHTML = 'note restored.';	
				break;
		}
		store_data();
	});
	
	//notification
	$('#notification-close-button').click(function() { $('div#notification').slideUp(SPEED); });
	setInterval(function() { $('div#notification').slideUp(SPEED) }, 5000);
	
	//todo list
	$('body').delegate('box#box', 'mouseup', function() {	
		if($(this).children('#tick').css('border-color') == 'rgb(95, 95, 95) rgb(95, 95, 95) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)') {
			$(this).children('#tick').css('border', '2px solid ' + color[color_scheme]);	
			this.style.border = '2px solid transparent'; 
			$(this).parents('li:first').css('text-decoration', 'line-through');		
			$(this).parents('li:first').css('color', '#e5e5e5');	
		} 
		else {
			$(this).children('#tick').css('border', '2px solid transparent');		
			this.style.border = '2px solid #f4f4f4'; 
			$(this).parents('li:first').css('text-decoration', 'none');		
			$(this).parents('li:first').css('color', '#5f5f5f');	
		}
		
		$(this).children('#tick').css('border-top', 'none');
		$(this).children('#tick').css('border-right', 'none'); 
		
		store_data();
	});
		
	$('input[value="sign up"], input[value="log in"]').click(function() {
		email = document.getElementById('email').value;
		password = document.getElementById('password').value;
		update();
		$('#log-in').fadeOut(SPEED, function() { $('#log-in').remove(); });
	}); 
	$('textarea#email, input#password').css('width', ($(document).width() - 40) + 'px');	
	
	//content	
	$('body').delegate('p', 'keypress', function(e) { 
		update();
		if(e.which == 13) e.preventDefault();
	});
});
