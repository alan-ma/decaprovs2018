var entries = [];
var search_results = [];
var universal_sort_key = '';
var num_results = 0;
var results_id = 'results';

function loadData() {
	$.getJSON('scores.json', function(data) {
		$.getJSON('timetable.json', function(timetable) {
			var timetable_data = {};
			$.each(timetable, function(key, val) {
				var id_key = val.FIELD1 + val.FIELD2;
				timetable_data[id_key] = val.FIELD3;
			});
			$.each(data, function(index, value) {
			var entry = {};
			$.each(value, function(key, val) {
				switch(key) {
					case 'FIELD1':
						entry.series = val;
						break;
					case 'FIELD2':
						entry.id = val;
						if (entry.id.toString()[0] === '1') {
							entry.team = false;
						} else {
							entry.team = true;
						}
						break;
					case 'FIELD3':
						entry.chapter = val;
						break;
					case 'FIELD4':
						entry.exam = val;
						break;
					case 'FIELD5':
						entry.oral_one = val;
						break;
					case 'FIELD6':
						entry.oral_two = val;
						break;
					case 'FIELD7':
						entry.penalty = val;
						break;
					case 'FIELD8':
						entry.overall = val;
						break;
					default:
						console.log('field not found.');
					}
					entry.index = index;
				});
				
				var id_key = entry.series + entry.id;
				if (id_key in timetable_data) {
					entry.judge = timetable_data[id_key];
				} else {
					entry.judge = "";
				}

				entries.push(entry);
			});
		});
		
	});
}

function display_results() {
	if (search_results.length > 0) {
		$('#no_result').css('display', 'none');
		var counter = 0;
		$.each(search_results, function(index, value) {
			var id = counter.toString() + '-' + value.id;
			if (counter % 2 === 0) {
				$('#'+results_id).append('<div id="' + id + '" class="row data-row"></div>');
			} else {
				$('#'+results_id).append('<div id="' + id + '" class="row gray data-row"></div>');
			}
			
			counter += 1;
			$('#' + id).append('<div class="col col-xs-1">' + counter + '</div><div class="col col-xs-1">' + value.series + '</div><div class="col col-xs-1">' + value.id + '</div><div class="col col-xs-3">' + value.chapter + '</div><div class="col col-xs-1">' + value.judge + '</div><div class="col col-xs-1">' + value.penalty + '</div><div class="col col-xs-1">' + value.exam + '</div><div class="col col-xs-1">' + value.oral_one + '</div><div class="col col-xs-1">' + value.oral_two + '</div><div class="col col-xs-1">' + value.overall + '</div>');
			
		});
	} else {
		$('#no_result').css('display', 'block');
		console.log('no results');
	}
}

function filter(data, key, filter_by) {
	var filtered = [];
	if (key === "") {
		filtered = data;
	} else {
		$.each(data, function(index, value) {
			switch(filter_by) {
				case 'series':
					if (value.series.toUpperCase() === key.toUpperCase()) {
						filtered.push(value);
					}
					break;
				case 'chapter':
					if (value.chapter.toUpperCase() === key.toUpperCase()) {
						filtered.push(value);
					}
					break;
				case 'id':
					if (value.id === key) {
						filtered.push(value);
					}
					break;
				case 'include':
					if (key === 'teams') {
						if (value.team) {
							console.log(value.id);
							filtered.push(value);
						}
					} else if (key === 'individuals') {
						if (!value.team) {
							filtered.push(value);
						}
					} else {
						filtered.push(value);
					}
					break;
				case 'judge':
					if (value.judge === key.toUpperCase()) {
						filtered.push(value);
					}
					break;
			}
		});
	}
	return filtered;
}

function search(series, id, chapter, judge, include, key) {
	search_results = [];
	universal_sort_key = key;
	console.log('searching...');
	search_results = filter(entries, series, 'series');
	search_results = filter(search_results, chapter, 'chapter');
	search_results = filter(search_results, id, 'id');
	search_results = filter(search_results, include, 'include');
	search_results = filter(search_results, judge, 'judge');
	search_results.sort(function(a,b) {
		var backwards = 1;
		switch(universal_sort_key) {
			case 'exam':
				var entryA = a.exam;
				var entryB = b.exam;
				backwards = -1;
				break;
			case 'oral_one':
				var entryA = a.oral_one;
				var entryB = b.oral_one;
				backwards = -1;
				break;
			case 'oral_two':
				var entryA = a.oral_two;
				var entryB = b.oral_two;
				backwards = -1;
				break;
			case 'penalty':
				var entryA = a.penalty;
				var entryB = b.penalty;
				backwards = -1;
				break;
			case 'judge':
				var entryA = a.judge;
				var entryB = b.judge;
				break;
			case 'overall':
				var entryA = a.overall;
				var entryB = b.overall;
				backwards = -1;
				break;
		}
		if (entryA === "") {
			return 1;
		} else if (entryB === "") {
			return -1;
		}
		if (entryA < entryB) {
			return (-1*backwards);
		}
		if (entryA > entryB) {
			return (1*backwards);
		} else {
			entryA = a.index;
			entryB = b.index;
			if (entryA < entryB) {
				return -1;
			}
			if (entryA > entryB) {
				return 1;
			} else {
				return 0; // a is equal to b
			}
		}
	});
	display_results();
	console.log('done.');
}

function main() {
	$('#specs').submit(function(event) {
		$('#'+results_id).css('opacity', 0);
		num_results += 1;
		results_id = 'results' + num_results.toString();
		$('#intro').css('display', 'none');
		$('#loading').css('display', 'block');
		setTimeout(function() {
			setTimeout(function() {
				$('#intro').after('<div id="'+results_id+'" class="row"></div>');
				setTimeout(function() {
					var search_series = $('#specs #series').val();
					var search_id = $('#specs #id').val();
					var search_chapter = $('#specs #chapter').val();
					var search_judge = $('#specs #judge').val();
					var search_include = $('#specs #include').val();
					var search_key = $('#specs #key').val();
					search(search_series, search_id, search_chapter, search_judge, search_include, search_key);
					$('#loading').css('display', 'none');
				}, 100);
			}, 100);
		}, 100);				
		return false;
	});
}

$(document).ready(function() {
	loadData();
	main();
});
