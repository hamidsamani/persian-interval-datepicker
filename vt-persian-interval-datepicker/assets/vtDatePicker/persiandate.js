angular.module('persianDate', []).filter('persianDate', function($locale, PersianDateService) {
	function int(str) {
		return parseInt(str, 10);
	}
	var R_ISO8601_STR = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
	// 1 2 3 4 5 6 7 8 9 10 11
	function padNumber(num, digits, trim) {
		var neg = '';
		if (num < 0) {
			neg = '-';
			num = -num;
		}
		num = '' + num;
		while (num.length < digits)
			num = '0' + num;
		if (trim)
			num = num.substr(num.length - digits);
		return neg + num;
	}

	function dateGetter(name, size, offset, trim) {
		offset = offset || 0;
		return function(date) {

			// var value = date['get' + name]();
			var value = PersianDateService['get' + name](date);

			if (offset > 0 || value > -offset)
				value += offset;
			if (value === 0 && offset == -12)
				value = 12;
			return padNumber(value, size, trim);
		};
	}

	function dateStrGetter(name, shortForm) {
		return function(date, formats) {

			// var value = date['get' + name]();
			var value = PersianDateService['get' + name](date);

			var get = angular.uppercase(shortForm ? ('SHORT' + name) : name);

			return formats[get][value];
		};
	}

	function timeZoneGetter(date) {
		var zone = -1 * date.getTimezoneOffset();
		var paddedZone = (zone >= 0) ? "+" : "";

		paddedZone += padNumber(Math[zone > 0 ? 'floor' : 'ceil'](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);

		return paddedZone;
	}

	function ampmGetter(date, formats) {

		return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
	}

	function concat(array1, array2, index) {
		var slice = [].slice;
		return array1.concat(slice.call(array2, index));
	}
	var DATE_FORMATS = {
		yyyy : dateGetter('FullYear', 4),
		yy : dateGetter('FullYear', 2, 0, true),
		y : dateGetter('FullYear', 1),
		MMMM : dateStrGetter('Month'),
		MMM : dateStrGetter('Month', true),
		MM : dateGetter('Month', 2, 1),
		M : dateGetter('Month', 1, 1),
		dd : dateGetter('Date', 2),
		d : dateGetter('Date', 1),
		HH : dateGetter('Hours', 2),
		H : dateGetter('Hours', 1),
		hh : dateGetter('Hours', 2, -12),
		h : dateGetter('Hours', 1, -12),
		mm : dateGetter('Minutes', 2),
		m : dateGetter('Minutes', 1),
		ss : dateGetter('Seconds', 2),
		s : dateGetter('Seconds', 1),
		// while ISO 8601 requires fractions to be prefixed with `.` or `,`
		// we can be just safely rely on using `sss` since we currently don't
		// support single or two digit fractions
		sss : dateGetter('Milliseconds', 3),
		EEEE : dateStrGetter('Day'),
		EEE : dateStrGetter('Day', true),
		a : ampmGetter,
		Z : timeZoneGetter
	};

	var DATE_FORMATS_SPLIT = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/, NUMBER_STRING = /^\-?\d+$/;
	function jsonStringToDate(string) {
		var match;
		if (match = string.match(R_ISO8601_STR)) {
			var date = new Date(0), tzHour = 0, tzMin = 0, dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear, timeSetter = match[8] ? date.setUTCHours : date.setHours;

			if (match[9]) {
				tzHour = int(match[9] + match[10]);
				tzMin = int(match[9] + match[11]);
			}
			dateSetter.call(date, int(match[1]), int(match[2]) - 1, int(match[3]));
			var h = int(match[4] || 0) - tzHour;
			var m = int(match[5] || 0) - tzMin;
			var s = int(match[6] || 0);
			var ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
			timeSetter.call(date, h, m, s, ms);
			return date;
		}
		return string;
	}

	return function(date, format) {
		var text = '', parts = [], fn, match;

		format = format || 'mediumDate';
		format = $locale.DATETIME_FORMATS[format] || format;
		if (angular.isString(date)) {
			if (NUMBER_STRING.test(date)) {
				date = int(date);
			} else {
				date = jsonStringToDate(date);
			}
		}

		if (angular.isNumber(date)) {
			date = new Date(date);
		}

		if (!angular.isDate(date)) {
			return date;
		}

		while (format) {
			match = DATE_FORMATS_SPLIT.exec(format);
			if (match) {
				parts = concat(parts, match, 1);
				format = parts.pop();
			} else {
				parts.push(format);
				format = null;
			}
		}

		angular.forEach(parts, function(value) {
			fn = DATE_FORMATS[value];

			text += fn ? fn(date, {
				MONTH : 'فروردین,اردیبهشت,خرداد,تیر,مرداد,شهریور,مهر,آبان,آذر,دی,بهمن,اسفند'.split(','),
				SHORTMONTH : 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'.split(','),
				DAY : 'یک شنبه,دوشنبه,سه شنبه,چهارشنبه,پنج شنبه,جمعه,شنبه'.split(','),
				SHORTDAY : 'ی,د,س,چ,پ,ج,ش'.split(','),
				AMPMS : [ 'AM', 'PM' ],
				medium : 'MMM d, y h:mm:ss a',
				short : 'M/d/yy h:mm a',
				fullDate : 'EEEE, MMMM d, y',
				longDate : 'MMMM d, y',
				mediumDate : 'MMM d, y',
				shortDate : 'M/d/yy',
				mediumTime : 'h:mm:ss a',
				shortTime : 'h:mm a'
			}) : value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
			// text += fn ? fn(date, $locale.DATETIME_FORMATS) :
			// value.replace(/(^'|'$)/g, '').replace(/''/g, "'");
		});

		return text;
	};
}).service('PersianDateService', function() {

	// Converts two digit year to four digit
	var longYear = function(yr) {

		return parseInt(moment(yr, "jYY").format("jYYYY"));

	};

	var gregorian_to_persian = function(year, month, day) {

		var dateArray = moment(year + "/" + month + "/" + day, "YYYY/MM/DD").format("jYYYY/jMM/jDD").split("/");
		dateArray[0] = parseInt(dateArray[0]);
		dateArray[1] = parseInt(dateArray[1]);
		dateArray[2] = parseInt(dateArray[2]);
		return dateArray;
	};

	this.getFullYear = function(date) {
		return moment(date).jYear();
	};
	this.getMonth = function(date) {
		return moment(date).jMonth()

	};
	this.getDay = function(date) {
		return date.getDay();
	};

	// FIXME bad name
	this.getDate = function(date) {
		return moment(date).jDate()
	};
	this.getHours = function(date){
		return date.getHours();
	};
	this.getMinutes = function(date){
		return date.getMinutes();
	};
	this.getSeconds = function(date){
		return date.getSeconds();
	};
	this.persian_to_gregorian_Date = function(year, month, day) {
		return moment(year + "/" + month + "/" + day, "jYYYY/jMM/jDD").toDate();

	};
	this.persianMonthDays = function(year, month) {
		return moment(year + "/" + month + "/" + 1, 'jYYYY/jMM/jDD').endOf("jMonth").jDate();

	};

	this.addJMonthToGregDate = function(date, int) {
		return moment(date).add(int, 'jMonth').toDate();
	}
	this.addJYearToGregDate = function(date, int) {
		return moment(date).add(int, 'jYear').toDate();
	}

});
