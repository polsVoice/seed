require( {
	"packages": [ { "name": "ydn", "location": ".", "main": "ydn.db-iswu-core-e-qry-dev" } ] });

var seed = {
	schema: {
		stores: [ 
		{
			name: "active",  // store definition
			keyPath: "taskId"
		}, 
		{
			name: "completed",
			keyPath: "taskId"
		},
		{
			name: "projects",
			keyPath: "projId"
		} ]
	},
	db: null,
	array: [],		// array for active tasks
	completed: [],	// array for completed tasks
	projects: [],   // array for projects
    projMenu: null,
    forward: true,
	ctr: 0,
	init: function(){
        
        // Set up tab display and database
		$( "#tabs" ).tabs();
        if ( !seed.db ){
            seed.db = new ydn.db.Storage( "seedDB", seed.schema );
        }
        
        seed.readStorage( "completed", seed.completed, function( array ){
			var list = $( "<ul></ul>" );
			$( array ).each( function( index, item ){
				list.append( "<li>" + item.task + "</li>" );
			} );
			$( "#tab03" ).append( list );
		} );
        
        seed.readStorage( "projects", seed.projects, function( array ){
            if( array.length ){
                seed.projMenu = $( "<select id='projMenu'></select>" );
                seed.projMenu.append( "<option value='-'>-</option>" );
                $( array ).each( function( index, item ){
                    seed.projMenu.append( "<option value='" + item.projName + "'>" + item.projName + "</option>" );
                    console.log( item.projName );
                    console.log( item.projId );
                } );
            }
        } );
        
        seed.readStorage( "active", seed.array, function( array ){
			seed.dueDateSort( array );
			seed.taskDiv();
		} );
        
		$( "#submit, #projButton" ).click( seed.input );

		$( "#input, #projInput" ).keypress( function( e ){
			// Enter key saves task
			if ( e.which === 13 ){
				seed.input();
				// to prevent page reload from Enter key in text field
				return false;
			}
		} );
		$( "#clear" ).click( seed.clear );
		$( "#back, #forward" ).click( seed.navigate );
		
		// random task
		$( "#random" ).click( function(){
			seed.ctr = seed.random( seed.array );
			seed.taskDiv();
		} );
        
        if ( $( "#projMenu" ) ){
            console.log( "The projMenu exists" );
        }
        
        $( "#projMenu" ).change( function(){
            $( "#projMenu option" ).each( function(){
               console.log( $( "projMenu" ).val() ); 
            } );
            //~ seed.db.from( "active", "=", seed.array[ seed.ctr ].taskId ).patch( {projId: $( "#projMenu" ).val()} );
            //~ 
        } );
		
		// Keyboard navigation: left arrow is back, right arrow is forward
		$( document ).on( "keydown", function( event ){
			var keyCode = event.which;
			$( "body" ).data( "source", keyCode );
			if ( keyCode === 37 || keyCode === 39 ){
				seed.navigate();
			}
		} );
		
		$( "#input" ).focus();
        
		$( "#projButton" ).click( function(){
			var project = $( "#projInput" ).val();
		} );
	},
	input: function(){
		'use strict';
		console.log( "Input" );
		var task = $( "#input" ).val(), 
			project = $( "#projInput" ).val(),
			req = null,
			newTask = {},
			newProject = {};
		
		if ( task ){
			newTask = {
				taskId: new Date().getTime(),
				task: task,
				createdDate: seed.getISODate(),
				duration: "00:00:00",
				dueDate: "0000-00-00",
				deadline: "false",
				projId: null
			};
			
			var req = seed.db.put( {name: "active"}, newTask );
			req.done( function( key ){
				console.log( key );
			} );
			req.fail( function( e ){
				throw e;
			} );
			
			$( "#input" ).val( "" );
			seed.array.push( newTask );
			
			$( "#input" ).focus();
			
			seed.ctr = seed.array.length-1;
			console.log( "seed.ctr is " + seed.ctr );
			seed.taskDiv();
		}
		else if ( project ){
			console.log( "Project!" );
			newProject = {
				projId: new Date().getTime(),
				projName: project
			};
			var req = seed.db.put( {name: "projects"}, newProject );
			req.done( function( key ){
				console.log( key );
			} );
			req.fail( function( e ){
				throw e;
			} );
			$( "#projInput" ).val( "" );
			$( "#projInput" ).focus();
		}
	},
	deleteEntry: function( id ){
		"use strict";
		var taskId = parseInt( id, 10 );
		seed.db.remove( "active", taskId );
	},
	readStorage: function( store, array, callback ){
		"use strict";
		seed.db.values( store ).done( function( records ){
			var len = records.length;
            
			for ( var i = 0; i < len; i++ ){
				array.push( records[ i ] );
			}
			// callback must be used, because of asynchrony
			callback( array );
		} );
	},
	dueDateSort: function( array ){
		'use strict';
		
		// bubble sort adapted from 
		// http://www.contentedcoder.com/2012/09/bubble-sort-algorithm-in-javascript.html
		var len = array.length-1, isSwap = true, comparisons = 0, swaps = 0;
		for( var i = 0; i < len; i++ ){
			isSwap = false;
			for ( var j = 0, swap = null, lastIndex = len - i; j < lastIndex; j++ ){
				var curObjDate = Date.parse( array[ j ].dueDate );
				var nextObjDate = Date.parse( array[ j+1 ].dueDate );
				
				if ( ( curObjDate === null || curObjDate > nextObjDate ) && nextObjDate !== null ){
					swaps++;
					swap = array[ j ];
					array[ j ] = array[ j+1 ];
					array[ j+1 ] = swap;
					isSwap = true;
				}
			}
			if ( !isSwap ){
				break;
			}
		}
	},
	navigate: function(){
		'use strict';
		seed.stopTimer();
		
		var btnId = this.id;
		
		if ( $( "#delete" ).is( ":checked" ) ){
			var req = seed.db.put( { name: "completed" }, seed.array[ seed.ctr ] );
			req.done( function( key ){
				console.log( key );
			} );
			req.fail( function( e ){
				throw e;
			} );
			
			seed.deleteEntry( seed.array[ seed.ctr ].taskId );
			
			// array moves down
			seed.array.splice( seed.ctr, 1 );
			
			// back button or left arrow key
			if ( btnId === "back" || $( "body" ).data( "source" ) === 37 ){
				// When splicing from an array, the elements will move down, and the current index
				// will be pointing at the previously next element. So, the counter doesn't need to
				// be incremented after a splice.
				seed.forward = false;
				seed.ctr--;
			}
		}
		else {
			// forward button or right arrow key
			if ( btnId === "forward" || $( "body" ).data( "source" ) === 39 ){
				seed.forward = true;
				seed.ctr++;
			}
			else {
				// If all else fails, go back. I think it's a good idea to have a default case,
				// although I don't see how this code would ever be run.
				seed.forward = false;
				seed.ctr--;
			}
		}
		
		if ( seed.ctr >= seed.array.length ){
			seed.ctr = 0;
		}
		if ( seed.ctr < 0 ){
			seed.ctr = seed.array.length-1;
		}

		seed.taskDiv();
		$( "body" ).data( "source", 0 );
	},
	taskDiv: function( evt ){
		'use strict';
		var setDirection = "";
		setDirection = seed.forward ? "left" : "right";
		
		if ( $( "#task" ).length ){
			$( "#task" ).hide( "slide", {direction: setDirection}, 400, function(){
				$( "#task" ).html( "" );
				seed.taskDisplay();
				// if it's left, change it to right; otherwise, change it to left
				setDirection = setDirection === "left" ? "right" : "left";
				$( "#task" ).show( "slide", {direction: setDirection}, 400 );
			} );
		}
		else
		{
			$( "#taskContainer" ).prepend( "<div id='task'></div>" );
			seed.taskDisplay();
		}
	},
	taskDisplay: function(){
		'use strict';
		if( seed.array.length ){
			$( "#task" ).append( "<p><input type='checkbox' name='task' id='delete' value='' /><label for='delete'>" + seed.array[ seed.ctr ].task + "</label></p><p id='breakMsg'></p><img src='img/arrow-right.png' id='timerArrow' alt='arrow' /><span id='runner'>" + seed.array[ seed.ctr ].duration + "</span><p>Due: <input type='text' id='datepicker' /></p><p>Created on: " + seed.array[ seed.ctr ].createdDate + "</p>" );
            
            if ( seed.projMenu !== null ){
                $( "#task" ).append( seed.projMenu );
            }
			
			$( "#datepicker" ).val( seed.array[ seed.ctr ].dueDate );
			
			console.log( "deadline is " + seed.array[ seed.ctr ].deadline );
			
			var numDaysLeft = ( Date.parse( seed.array[ seed.ctr ].dueDate ) - Date.parse( seed.getISODate() ) ) / 86400000;
			
			if( numDaysLeft <= 3 && seed.array[ seed.ctr ].deadline === "true" ){
				$( "#reminder" ).html( "One or more tasks are due in 2 days or less!" );
				$( "#datepicker" ).addClass( "upcoming" );
				$( "#task p" ).addClass( "overdue" );
			}

			// icon from http://openiconlibrary.sourceforge.net/
			// under CC-by-SA http://creativecommons.org/licenses/by-sa/3.0/
			var duration = seed.array[ seed.ctr ].duration;
			var start = seed.stringToMilliseconds( duration );
			var stop = 356400000 + 3540000 + 59000; // 99 hours, 59 mins, 59 secs
			
			$( "#runner" ).runner({
				milliseconds: false,
				startAt: start,
				stopAt: stop,
				
				// http://pastebin.com/WZ1BA2nD
				format: function millisecondsToString(milliseconds) {
					var oneHour = 3600000;
					var oneMinute = 60000;
					var oneSecond = 1000;
					var seconds = 0;
					var minutes = 0;
					var hours = 0;
					var result;

					if (milliseconds >= oneHour) {
						hours = Math.floor(milliseconds / oneHour);
					}

					milliseconds = hours > 0 ? (milliseconds - hours * oneHour) : milliseconds;

					if (milliseconds >= oneMinute) {
						minutes = Math.floor(milliseconds / oneMinute);
					}

					milliseconds = minutes > 0 ? (milliseconds - minutes * oneMinute) : milliseconds;

					if (milliseconds >= oneSecond) {
						seconds = Math.floor(milliseconds / oneSecond);
					}

					milliseconds = seconds > 0 ? (milliseconds - seconds * oneSecond) : milliseconds;

					if (hours > 0) {
						result = (hours > 9 ? hours : "0" + hours) + ":";
					} else {
						result = "00:";
					}

					if (minutes > 0) {
						result += (minutes > 9 ? minutes : "0" + minutes) + ":";
					} else {
						result += "00:";
					}

					if (seconds > 0) {
						result += (seconds > 9 ? seconds : "0" + seconds);
					} else {
						result += "00";
					}
					
					return result;
				}
			}).on( "runnerFinish", function( evt, info ){
				// Ask if they want to take a break.
				$( "#breakMsg" ).html( "Time for a break?" );
				$( "#runner" ).runner( "reset" );
				$( "#timerArrow" ).attr( "src", "img/pause.png" );
			} );
			$( "#timerArrow" ).toggleFunc( seed.startTimer, seed.stopTimer );
			$( "#datepicker" ).datepicker( {
				dateFormat: "yy-mm-dd",
				gotoCurrent: "true",
				onSelect: function(){
					var index = seed.array[ seed.ctr ].taskNum;
					
					seed.array[ seed.ctr ].dueDate = $( "#datepicker" ).val();
					// update property
					seed.db.from( "active", "=", seed.array[ seed.ctr ].taskId ).patch( {dueDate: $( "#datepicker" ).val()} );
					
					seed.array[ seed.ctr ].deadline = "true";					
					seed.db.from( "active", "=", seed.array[ seed.ctr ].taskId ).patch( {deadline: "true"} );
					
					console.log( "datepicker val is " + $( "#datepicker" ).val() );
				}
			} );
		}
	},
	startTimer: function(){
		"use strict";
		$( "#runner" ).runner( "start" );
		$( "#timerArrow" ).attr( "src", "img/pause.png" );
		$( "#breakMsg" ).html( "" );
		// icon from http://openiconlibrary.sourceforge.net/
		// under CC-by-SA http://creativecommons.org/licenses/by-sa/3.0/
	},
	stopTimer: function(){
		'use strict';
		$( "#runner" ).runner( "stop" );
		$( "#timerArrow" ).attr( "src", "img/arrow-right.png" );
		
		// icon from http://openiconlibrary.sourceforge.net/
		// under CC-by-SA http://creativecommons.org/licenses/by-sa/3.0/
		
		if( seed.array.length ){
			seed.array[ seed.ctr ].duration = $( "#runner" ).html();
            // update time in database
			seed.db.from( "active", "=", seed.array[ seed.ctr ].taskId ).patch( {duration: $( "#runner" ).html()} );
		}
	},
	clear: function(){
		'use strict';
		while ( seed.array.length > 0 ){
			seed.array.pop();
		}
        seed.db.clear();
		seed.ctr = 0;
		seed.taskNum = 0;
		if( $( "#task" ) ){
			$( "#task" ).remove();
		}
	},
    // return random number based on array length
    random: function( array ){
        return 1 + Math.floor( Math.random() * array.length-1 );
    },
	stringToMilliseconds: function( theString ){
		'use strict';
		var theArray = theString.split( ":" );
		var total = 0, multiplier = 3600000;
		$( theArray ).each( function( i, val ){
			total += val * multiplier;
			multiplier /= 60;
		} );
		return total;
	},
	getISODate: function(){
		'use strict';
		var dateObj = new Date();
		var month = dateObj.getMonth() + 1;
		var day = dateObj.getDate();
		var date = dateObj.getFullYear() + "-" + ( month < 10 ? "0" : "" ) + month + "-" + ( day < 10 ? "0" : "" ) + day;
		return date;
	}
};
seed.init();
