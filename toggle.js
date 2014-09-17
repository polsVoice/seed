jQuery.fn.toggleFunc = function( func1, func2 )
{
	return this.each( function()
	{
		$( this ).click( function()
		{
			var counter = $( this ).data( "counter" ) || 1;
			switch( counter )
			{
				case 1:
					func1();
					break;
				case 2:
					func2();
					break;
				default:
					break;
			}
			counter++;
			if ( counter > 2 )
			{
				counter = 1;
			}
			$( this ).data( "counter", counter );
		} );
	});
};
