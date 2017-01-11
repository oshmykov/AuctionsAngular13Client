(function(){
	var auctions2Utility = angular.module('auctions2Utility', []);
	
	auctions2Utility.factory('UtilityService', function() {
		var serviceInstance = {};
		
		serviceInstance.comparator = function(ascending, primary, secondary) {
			var result = function(a, b) {
				if (ascending) {
					if (a[primary] < b[primary]) {
						return -1;
					}
					else if (a[primary] > b[primary]) {
						return 1;
					}
					else if (secondary) {
						if (a[secondary] < b[secondary]) {
							return -1;
						}
						else if (a[secondary] > b[secondary]) {
							return 1;
						}
						else
							return 0;
					}
					else 
						return 0;
				}
				else {
					if (a[primary] < b[primary]) {
						return 1;
					}
					else if (a[primary] > b[primary]) {
						return -1;
					}
					else if (secondary) {
						if (a[secondary] < b[secondary]) {
							return 1;
						}
						else if (a[secondary] > b[secondary]) {
							return -1;
						}
						else
							return 0;
					}
					else
						return 0;
				}				
			};
			
			return result;
		};
		
		// This function will be moved to the back end
		serviceInstance.slice = function(source, pageOffset, length, chunkLength) {
			var result = [],
				from = (pageOffset - 1) * chunkLength,
				to = from + length;
			
			
			
			if (from < source.length) {
				to = Math.min(to, source.length);
				for (var i = from; i < to; i++) {
					result.push(source[i]);
				}
			}
			
			console.log("from=" + from + " to=" + to + " source=" + source.length + " length=" + length, " result.length=" + result.length);
			
			return result;
		};
		
		serviceInstance.getSecondary = function(primary) {
			return primary == 'ending' ? 'name' : 'ending';
		};
		
		serviceInstance.isAscending = function(order) {
			return order == 'soonest' || order == 'a-z';
		};
		
		serviceInstance.getOrder = function(order, ascending) {
			switch (order) {
				case 'ending':
					return ascending ? 'soonest' : 'latest';
				case 'name':
					return ascending ? 'a-z' : 'z-a';
				default:
					throw 'Unable to cast order=' + order;
			}
		};
		
		return serviceInstance;
	});
	
})();


if (!Array.prototype.find) {
	Array.prototype.find = function(predicate) {
		if (this == null) {
	    	throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
    	}
	    var list = Object(this);
	    var length = list.length >>> 0;
	    var thisArg = arguments[1];
	    var value;
	
	    for (var i = 0; i < length; i++) {
	    	value = list[i];
	    	if (predicate.call(thisArg, value, i, list)) {
	    		return value;
	    	}
	    }
	    return undefined;
	};
}

if (!String.prototype.contains) {
	String.prototype.contains = function(it, ignorecase) { 
		if (ignorecase) {
			return this.toLowerCase().indexOf(it.toLowerCase()) != -1;
		}
		else
			return this.indexOf(it) != -1; 
	};
}

if (!String.isNullOrEmpty) {
	String.isNullOrEmpty = function(value) {
	    if (value) {
	        if (typeof(value) == 'string') {
	        	if (value.length > 0)
	        		return false;
	        }
	        if (value != null)
	        	return false;
	    }
	    return true;
	};
}

if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) { 
	    	return typeof args[number] != 'undefined' ? args[number] : match;
	    });
    };
}

if (!Array.prototype.union) {
	Array.prototype.union = function(a) 
	{
	    var r = this.slice(0);
	    a.forEach(function(i) { if (r.indexOf(i) < 0) r.push(i); });
	    return r;
	};
}

if (!String.prototype.capitalizeFirstLetter) {
	String.prototype.capitalizeFirstLetter = function() {
	    return this.charAt(0).toUpperCase() + this.slice(1);
	}
}
if (!Math.clamp) {
	Math.clamp = function(value, min, max) {
		return Math.max(min, Math.min(max, value));
	};
}
if (!Array.prototype.findIndex) {
	Array.prototype.findIndex = function(predicate) {
		if (this == null) {
			throw new TypeError('Array.prototype.findIndex called on null or undefined');
	    }
	    if (typeof predicate !== 'function') {
	    	throw new TypeError('predicate must be a function');
	    }
	    var list = Object(this);
	    var length = list.length >>> 0;
	    var thisArg = arguments[1];
	    var value;
	
	    for (var i = 0; i < length; i++) {
	    	value = list[i];
	    	if (predicate.call(thisArg, value, i, list)) {
	    		return i;
	    	}
	    }
	    return -1;
	  };
}
