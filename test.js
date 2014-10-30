( function(){
	var queue = [], paused = false, results;
	this.test = function( name, fn ){
		queue.push( function(){
			results = document.getElementById( "results" );
			results = assert( true, name ).appendChild( document.createElement( "ul" ) );
			fn();
		} );
		runTest();
	};
	this.pause = function(){
		paused = true;
	};
	this.resume = function(){
		paused = false;
		setTimeout( runTest, 1 );
	};
	function runTest(){
		if ( !paused && queue.length ){
			queue.shift()();
			if ( !paused ){
				resume();
			}
		}
	}
	
	this.assert = function assert( value, desc ){
		var li = document.createElement( "li" );
		li.className = value ? "pass" : "fail";
		li.appendChild( document.createTextNode( desc ) );
		results.appendChild( li );
		if ( !value ){
			li.parentNode.parentNode.className = "fail";
		}
		return li;
	};
} )();

window.onload = function(){
	var result = null,
        today = "2014-10-30";
	test( "Async Test #1: testing getISODate", function(){
		pause();
		var date = null;
		setTimeout( function(){
			date = seed.getISODate();
			result = date === today ? true : false;
			assert( result, "First test completed" );
			console.log( date );
			resume();
		}, 1000 );
		test( "Async Test #2: testing stringToMilliseconds()", function(){
			pause();
			var testString = "06:33:21", result = null;
			setTimeout( function(){
				testString = seed.stringToMilliseconds( testString );
				result = testString == "23601000" ? true : false;
				assert( result, "Second test completed" );
				resume();
			}, 1000 );
		} );
	} );
    test( "Testing random()", function(){
        var testArr = [ 0, 1, 2, 3, 4, 5 ], num = 0;
        num = seed.random( testArr );
        result = ( num <= testArr.length-1 && num >= 0 ) ? true : false;
        assert( result, "Third test completed" );
    } );
    test( "Testing input()", function(){
        var testTask = null,
            testProj = null;
        
        $( "body" ).append( "<input type='text' id='input' />" );
        $( "#input" ).val( "foo" );
        testTask = seed.input();
        assert( testTask.taskId, "Object has taskId" );
        assert( testTask.task === "foo", "Object has task" );
        assert( testTask.createdDate === today, "Object has created date" );
        assert( testTask.duration === "00:00:00", "Object has duration" );
        assert( testTask.dueDate === "0000-00-00", "Object has dueDate" );
        assert( testTask.deadline === "false", "Object has deadline" );
        assert( testTask.projId === null, "Object has null projId" );
        $( "#input" ).remove();
        
        $( "body" ).append( "<input type='text' id='projInput' />" );
        $( "#projInput" ).hide();
        $( "#projInput" ).val( "bar" );
        testProj = seed.input();
        assert( testProj.projId, "Project has projId" );
        assert( testProj.projName === "bar", "Project has projName" );
    } );
    test( "Testing insertData()", function(){
        var id = new Date().getTime();
        var taskObj = {
            taskId: id,
            task: "foo",
            createdDate: today,
            duration: "00:00:00",
            dueDate: "0000-00-00",
            deadline: "false",
            projId: null
       };
       seed.insertData( taskObj, seed.db );
       
       // if object can be found in db, result is true; otherwise, it's false
       seed.db.get( "active", id ).done( function( value ){
           result = value.taskId === id ? true : false;
       } );
       assert( result, "The task object was found in the database" );
       assert( seed.array.pop() === taskObj,
            "The task object was successfully inserted into the seed array" );
       
       id = new Date().getTime();
       var projObj = {
           projId: id,
           projName: "foo"
       };
       seed.insertData( projObj, seed.db );
       
       seed.db.get( "projects", id ).done( function( value ){
           result = value.projId === id ? true : false;
       } );
       assert( result, "The project object was found in the database" );
       assert( seed.projects.pop() === projObj,
        "The project object was successfully inserted into the projects array" );
       
       seed.db.clear();
    } );
    test( "Testing clearField()", function(){
        $( "body" ).append( "<input type='text' id='input' />" );
        $( "#input" ).val( "foo" );
        seed.clearField( "#input" );
        assert( $( "#input" ).val() === "" && $( "#input" ).is( ":focus" ),
            "The input field has no value and is focused" );
        $( "#input" ).remove();
    } );
};
