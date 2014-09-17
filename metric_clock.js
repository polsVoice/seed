var timerID = null
var timerRunning = false

function stopclock()
{
	if(timerRunning)
		clearTimeout(timerID)
	timerRunning = false
}

function startclock()
{
	stopclock()
	showtime()
}

function showtime()
{
	var now = new Date()
	var day = now.getDate()
	var month = now.getMonth() + 1
	var year = now.getFullYear()

	// Local

	var hours = now.getHours()
	var minutes = now.getMinutes()
	var seconds = now.getSeconds()
	var totsecs = hours*3600
	totsecs += minutes*60
	totsecs += seconds
	totsecs += (now.getTime() % 1000) / 1000
	var dectime = totsecs / .864
	var cd = ((dectime - (dectime % 1000)) / 1000)
	var qd = (dectime - (dectime % 1) - (cd * 1000))

	// IDL

	var def = now.getTimezoneOffset()
	var idl = ((60 * now.getHours()) + (def - 720))
	if (idl < 0) idl = 1440 + idl
	idl = idl / 60
	totsecs = idl*3600
	totsecs += minutes*60
	totsecs += seconds
	totsecs += (now.getTime() % 1000) / 1000
	mtime = totsecs / .864
	var umtcd = ((mtime - (mtime % 1000)) / 1000)
	var umtqd = (mtime - (mtime % 1) - (umtcd * 1000))

	// Create strings

	var decimalValue = ((umtcd < 10) ? "0" : "") + umtcd + "."
	decimalValue  += ((umtqd < 10) ? "0" : "") + ((umtqd < 100) ? "0" : "") + umtqd

	var timedateStamp = year + "-" + ((month < 10) ? "0" : "") + month
	timedateStamp += "-" + ((day < 10) ? "0" : "") + day
	timedateStamp += "." + ((cd < 10) ? "0" : "") + cd 
	timedateStamp += ((qd < 10) ? "0" : "") + ((qd < 100) ? "0" : "") + qd + " LMT"

	window.status = timedateStamp
	document.getElementById('umt_clock').innerHTML = decimalValue
	timerID = setTimeout("showtime()", 86)
	timerRunning = true
}