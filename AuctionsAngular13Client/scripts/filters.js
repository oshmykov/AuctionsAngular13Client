(function(){
	var auctions2Filters = angular.module('auctions2Filters', []);
	
	auctions2Filters.filter('notFeaturedOrSearch', function() {
		return function(input, searchQuery, id) {
			var out = [];
			
			if (searchQuery && !String.isNullOrEmpty(searchQuery.name)) {
			    angular.forEach(input, function(item) {
			    	
			    	if (item.name.contains(searchQuery.name, true)) {
			    		out.push(item);
			        }
			    });			
			}
			else {
			    angular.forEach(input, function(item) {
			    	if (item.id != id) {
			    		out.push(item);
			        }
			    });	
			}
			
			return out;
		};
	});
	
	auctions2Filters.filter('orderByFilter', function() {
		return function(input, cropped) {
			switch (input) {
				case 'ending':
					return cropped ? 'Ending ' : 'Ending Soonest ';
				case 'name':
					return 'Name';
				default:
					throw 'orderByFilter is not set';
			}
		};
	});
	
	auctions2Filters.filter('orderFilter', function() {
		return function(ascending, orderBy) {
			switch (orderBy) {
				case 'ending':
					return ascending ? 'Soonest' : 'Latest';
				case 'name':
					return ascending ? 'A to Z' : 'Z to A';
				default:
					throw 'orderFilter is not set';
			}
		};
	});	
	
	auctions2Filters.filter('typeFilter', function() {
		return function(input) {
			switch (input) {
				case 'all-types':
					return 'All auctions';
				case 'pc':
					return 'Points + USD';
				case 'po': 
					return 'Points Only';
				default:
					return 'Not found';
			}
		};
	});	
	
	auctions2Filters.filter('dateFilter', function() {
		return function(input, part) {
			if (input) {
				switch (part) {
					case 'date':
						return new Date(input).format("mm/dd/yyyy");
					case 'time':
						return new Date(input).format("h:MM TT Z");
					default:
						return new Date(input).format("mm/dd/yyyy h:MM TT Z");
				}
			}
			else
				return '';
		};
	});	
	
	auctions2Filters.filter('timeFilter', function() {
		return function(timeLeft) {
			var formattime = new Date(timeLeft);
			
			return formattime.getUTCHours() + "h " + formattime.getUTCMinutes() + "m " + formattime.getUTCSeconds() + "s";
		};
	});	
	
	auctions2Filters.filter('biddingFilter', function() {
		return function(input) {
			result = '';
			switch (input) {
				case 'l':
					result = 'Leading Bidder';
					break;
				case 'o':
					result = 'Outbid';
					break;
				case 'e':
					result = 'Expired';
					break;
			}
			
			return result;
		};
	});		
	
	auctions2Filters.filter('extendedFilter', function() {
		return function(input) {
			switch (input) {
				case 'with-extended':
					return 'Including Extended Play';
				case 'extended-only':
					return 'Extended Play Only';
				case 'no-extended': 
					return 'No Extended Play';
				default:
					return 'extendedFilter is not set';
			}
		};
	});	
	
	auctions2Filters.filter('kindFilter', function() {
		return function(input) {
			switch (input) {
				case 'regular':
					return 'Regular Auctions';
				case 'sports':
					return 'Sports Auctions';
				default:
					return 'kindFilter is not set';
			}
		};
	});	
	
	auctions2Filters.filter('resumeFilter', function() {
		return function(type, extended, kind) {
			var result = '';
			
			switch (extended) {
				case 'with-extended':
					switch (type) {	
						case 'all-types':
							result = 'All{0}auctions including extended'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'pc':
							result = 'Points + USD{0}auctions including extended'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'po':
							result = 'Points only{0}auctions including extended'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
					}
					break;
				case 'extended-only':
					switch (type) {	
						case 'all-types':
							result = 'Only extended play{0}auctions'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'pc':
							result = 'Only extended Points + USD{0}auctions'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'po': 
							result = 'Extended Points only{0}auctions'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
					}					
					break;
				case 'no-extended': 
					switch (type) {	
						case 'all-types':
							result = 'All{0}auctions but extended'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'pc':
							result = 'Not extended Points + USD{0}auctions'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
						case 'po': 
							result = 'Not extended Points only{0}auctions'.format(String.isNullOrEmpty(kind) ? ' ' : ' ' + kind.capitalizeFirstLetter() + ' ');
							break;
					}					
					break;
				default:
					result = 'Filter is not defined for this case';
					break;
			}
			
			return result;
		};
	});	
	
	auctions2Filters.filter('endingFilter', function() {
		return function(input, switchedToCountDown) {
			return switchedToCountDown ? 'Time Left:' : 'Ending:';
		};
	});	
	
	
	
})();
