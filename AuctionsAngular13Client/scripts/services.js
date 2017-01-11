(function(){
	var auctions2Services = angular.module('auctions2Services', ['ngResource']);
	
	auctions2Services.factory('AuctionsRestAPI', ['$q', '$timeout', 'UtilityService', function($q, $timeout, UtilityService) {
		var serviceInstance = {};
		
		serviceInstance.Request = function(type, ascending, primary, secondary, offset) {
			this.type = type;
			this.ascending = ascending;
			this.primaryOrder = primary;
			this.secondaryOrder = secondary;
			this.pageOffset = offset;
		};
		
		serviceInstance.Request.prototype.toString = function() {
			return this.type + this.ascending + this.primaryOrder + this.secondaryOrder + this.pageOffset;
		};
		
		serviceInstance.getAuctions = function(params) {
			var deferred = $q.defer();
			
			var requestTime = new Date();
			
			deferred.notify('Deferred test start at ' + requestTime);
			
			$timeout(function() {
				var responseTime = new Date();
				
				var response = _getAuctions(params);
				var latency = (responseTime.getTime() - requestTime.getTime()) / 2;
				
				for (var i = 0; i < response.auctions.length; i++) {
					var auction = response.auctions[i];
					auction.timeLeft = auction.ending - response.serverTimeStamp - latency;
					auction.expired = auction.timeLeft < 0;
				}
				
				deferred.notify('Deferred test end. Got ' + response.auctions.length + ', latency is ' + latency + 'ms');
			
				if (params.request.pageOffset > 1 && response.auctions.length == 0) {
					var rejectObj = {
						data: response,
						errorText: 'No auctions on page ' + params.request.pageOffset
					};
					
					deferred.reject(rejectObj);
				}
				else
					deferred.resolve(response);
			}, 150);
			
			
			return deferred.promise;
		};
		
		serviceInstance.getAuctionById = function(id) {
			var deferred = $q.defer();
			
			var requestTime = new Date();
			
			deferred.notify('Deferred test2 start at ' + requestTime);
			
			$timeout(function() {
				var responseTime = new Date();
				var latency = (responseTime.getTime() - requestTime.getTime()) / 2;
				
				var response = _getAuctionById(id);
				if (response.auction != null) {
					response.auction.timeLeft = response.auction.ending - response.serverTimeStamp - latency;
					response.auction.expired = response.timeLeft < 0;
					
					deferred.resolve(response);
				}
				else {
					var rejectObj = {
							data: response,
							errorText: 'Auction is not found ' + id
						};
						
					deferred.reject(rejectObj);					
				}
			}, 150);
			
			
			return deferred.promise;
		};	
		
		serviceInstance.getMyAuctions = function(id) {
			var deferred = $q.defer();
			
			var requestTime = new Date();
			
			$timeout(function() {
				var responseTime = new Date();
				var latency = (responseTime.getTime() - requestTime.getTime()) / 2;
				
				var response = _getMyAuctions();
				for (var i = 0; i < response.biddingOn.length; i++) {
					var auction = response.biddingOn[i];
					auction.timeLeft = auction.ending - response.serverTimeStamp - latency;
					auction.expired = auction.timeLeft < 0;
				}
				for (var i = 0; i < response.following.length; i++) {
					var auction = response.following[i];
					auction.timeLeft = auction.ending - response.serverTimeStamp - latency;
					auction.expired = auction.timeLeft < 0;
				}
				
				deferred.resolve(response);
			}, 150);
			
			
			return deferred.promise;			
		};
		
		var _getAuctions = function(params) {
			
			
			console.log("Request: type=" + params.request.type + " primary=" + params.request.primaryOrder + " secondary=" + params.request.secondaryOrder + " ascending=" + params.request.ascending + " offset=" + params.request.pageOffset);
			
			// Back end is doing filtering by auctions type (all-types, points only, points + usd)
			var active = allAuctions.filter(function(n) { return n.ending > _serverTimeStamp && (params.request.type == 'all-types' || n.type == params.request.type); });
			
			// Back end is doing sorting by ascending or descending			
			var sorted = active.sort(UtilityService.comparator(params.request.ascending, params.request.primaryOrder, params.request.secondaryOrder));
			
			var sliced = UtilityService.slice(sorted, params.request.pageOffset, params.initLength, params.chunkLength);
			
			console.log("Response: length=" + sliced.length + ", total=" + sorted.length);
			
			for (var i = 0; i < sliced.length; i++) {
				var auction = sliced[i];
				
				var bidInfo = _getBidInfo(auction.bidHistory);
				auction.bidding = bidInfo.bidding;
				auction.currentBid = bidInfo.currentBid;
				auction.uniqueLength = bidInfo.uniqueLength;
			}
			
			var result = {
				serverTimeStamp: _serverTimeStamp,
				auctions: sliced,
				total: sorted.length
			};
			
			return result;
		};
		
		var _getAuctionById = function(id) {
			var auction = allAuctions.find(function(n) { return n.id == id; });
			
			var bidInfo = _getBidInfo(auction.bidHistory);
			auction.bidding = bidInfo.bidding;
			auction.currentBid = bidInfo.currentBid;
			auction.uniqueLength = bidInfo.uniqueLength;
			
			var result = {
					serverTimeStamp: _serverTimeStamp,
					auction: auction
				};			
			
			return result;
		};		
		
		var _getMyAuctions = function() {
			var expired = allAuctions.filter(function(n) { return n.ending <= _serverTimeStamp; }),
				active = allAuctions.filter(function(n) { return n.ending > _serverTimeStamp; });
			
			for (var i = 0; i < expired.length; i++) {
				var auction = expired[i];
				
				var bidInfo = _getBidInfo(auction.bidHistory);
				auction.bidding = bidInfo.bidding;
				auction.currentBid = bidInfo.currentBid;
				auction.uniqueLength = bidInfo.uniqueLength;
			}
			for (var i = 0; i < active.length; i++) {
				var auction = active[i];
				
				var bidInfo = _getBidInfo(auction.bidHistory);
				auction.bidding = bidInfo.bidding;
				auction.currentBid = bidInfo.currentBid;
				auction.uniqueLength = bidInfo.uniqueLength;
			}			
			
			var won = expired.filter(function(n) { return n.bidding == 'l'; }),
				lost = expired.filter(function(n) { return n.bidding == 'o'; }),
				biddingOn = active.filter(function(n) { return n.bidding == 'l' || n.bidding == 'o'; }),
				following = active.filter(function(n) {
					var inFollowing = false;
					for (var i = 0; i < _following.length; i++) {
						if (_following[i].id == n.id) {
							inFollowing = true;
							break;
						}
					}
					
					return n.bidding == '' && inFollowing; 
				});
			
			return {
				serverTimeStamp: _serverTimeStamp,
				won: won,
				lost: lost,
				biddingOn: biddingOn,
				following: following
			};
		};
		
		var _getBidInfo = function(history) {
			var result = {
					currentBid: 0,
					bidding: '',
					uniqueLength: 0
			};
			
			if (history && history.length > 0) {
				var sorted = history.sort(UtilityService.comparator(false, 'time', 'bid'));
				
				result.uniqueLength = sorted.filter(function(n, index, self) {
					return self.findIndex(function(m) { return n.id == m.id; }) === index;
				}).length;
				
				result.currentBid = sorted[0].bid;
				
				if (sorted[0].me) {
					result.bidding = 'l';
				}
				else {
					var myBid = sorted.find(function(n) { return n.me; });
					if (myBid) {
						result.bidding = 'o';
					}
				}
			}
			
			return result;
		};
		
		return serviceInstance;
	}]);

	auctions2Services.factory('CommonService', [function() {
		var originBack = {
			title: 'Home',
			path: '/mobile/svc?t=showhomepage'
		};
		
		var instance = { 
				backData: originBack,
				tabs: [{ id: 'auctions', title: 'Auctions', path: '/auctions', active: false, disable: true }, 
				       { id: 'my-auctions', title: 'My Auctions', path: '/my-auctions', active: false, disable: true },
				       { id: 'settings', title: 'Settings', path: '/settings', active: false, disable: true },
				      ],
			    balance: 1128
		};
		
		instance.getTab = function(id) {
			return instance.tabs.find(function(n) { return n.id == id; });
		};
		
		instance.updateTab = function(params) {
			instance.tabs.find(function(n) { return n.id == params.id; }).path = params.path;
			instance.tabs.find(function(n) { return n.id == params.id; }).title = params.title;
		};
		
		instance.setActiveTab = function(id) {
			for (var i = 0; i < instance.tabs.length; i++) {
				instance.tabs[i].disable = false;
				instance.tabs[i].active = instance.tabs[i].id == id;
			}
		};
		
		instance.setBack = function(title, path) {
			this.backData = {
				title: title,
				path: '#' + path,
			};
		};
		
		instance.restoreBack = function() {
			instance.backData = originBack;
		};
		
		return instance;
	}]);
	
	auctions2Services.factory('TimerService', ['$interval', function($interval) {
		var stop,
			auctions = [],
			oneday = 24 * 60 * 60 * 1000,
			fimeMinutes = 5 * 60 * 1000; // 5 minutes left
		
        var update = function() {
        	if (angular.isDefined(stop)) return;
        	
        	stop = $interval(function() {
        		for (var i = 0; i < auctions.length; i++) {
        			var auction = auctions[i];

    				auction.timeLeft -= 1000;
    				
    				if (!auction.switchedToCountDown) {
    					
    					if (auction.timeLeft > 0 && auction.timeLeft < oneday)
    						auction.switchedToCountDown = true;
    				}
    				else {
    		        	if (auction.timeLeft > 0) {
    						
    						if (!auction.criticalTimeLeft && auction.timeLeft < fimeMinutes) {
    							auction.criticalTimeLeft = true;
    						}
    		        	}
    		        	else if (auction.timeLeft < -1000) {
    		        		auction.expired = true;
    					}
    				}  
    				
    				
        		}
        	}, 1000);
        };

        var stopUpdate = function() {
        	if (angular.isDefined(stop)) {
        		$interval.cancel(stop);
        		stop = undefined;
        	}
        };

        update();		
		
		return {
			setAuctions: function(source) {
				auctions = source;
			}
		};
	}]);
	
	var _serverTimeStamp = 1430313060000,
		_myName = 'Me-Tester3',
		_myId = 'metester3';
	
	var allAuctions = [{
			id: 26035,
			name: 'Bed Bath & Beyond $100 Gift Card - DEMO ONLY',
			name2: 'Retail Price: $100.00',
			ending: 1431008954919,
			staringBid: 1,
			biddingStep: 1,
			type: 'pc',
			paymentDue: 10,
			beedExceedes: false,
			winLimitReached: false,
			featured: true,
			special: 'wow',
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/product/aucgbbb50vici_4.jpg',
				full: 'https://media2.destinationrewards.com/catalogimages/product/aucgbbb50vici_5.jpg'
			},			
			bidHistory: [{
				id: 'tester1',
				name: 'Tester1',
				bid: 1,
				time: 1431008854919
			},
			{
				id: 'tester2',
				name: 'Tester2',
				bid: 2,
				time: 1431008864919
			},
			{
				id: 'tester1',
				name: 'Tester1',
				bid: 3,
				time: 1431008964919
			},
			{
				id: 'tester2',
				name: 'Tester2',
				bid: 4,
				time: 1431009064919
			},
			{
				id: 'tester4',
				name: '',
				bid: 5,
				time: 1431009164919
			},
			{
				id: _myId,
				name: _myName,
				bid: 6,
				time: 1431009264919,
				me: true
			}			
			]
		},
		{
			id: 25087,
			name: 'Beats By Dr. Dre - Beats Studio Over-the-Ear Headphones - DEMO ONLY',
			name2: 'DEMO ONLY item',
			ending: 1430399400000,
			staringBid: 3,
			biddingStep: 3,
			type: 'po',
			beedExceedes: false,
			winLimitReached: false,
			featured: true,
			special: 'pp',
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20121022101649_4_aucdreheadphonesred_4.jpg',
				full: 'https://media2.destinationrewards.com/catalogimages/20121022101649_5_aucdreheadphonesred_5.jpg'
			},		
			bidHistory: [{
				id: _myId,
				name: _myName,
				bid: 3,
				time: 1431008854919,
				me: true
			},
			{
				id: 'tester2',
				name: 'Tester2',
				bid: 6,
				time: 1431008864919
			},
			{
				id: _myId,
				name: _myName,
				bid: 9,
				time: 1431008964919,
				me: true
			},
			{
				id: 'tester2',
				name: 'Tester2',
				bid: 12,
				time: 1431009064919
			}			
			]
		},
		{
			id: 25088,
			name: 'Sample Auction 1',
			name2: 'Sample description',
			ending: 1433174400000,
			staringBid: 0,
			biddingStep: 1,
			type: 'pc',
			paymentDue: 5,
			beedExceedes: false,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		},
		{
			id: 25089,
			name: 'Macy\'s Gift Card $50',
			name2: 'Retail Price: $50.00',
			ending: 1433175300000,
			staringBid: 120,
			biddingStep: 50,
			type: 'pc',
			paymentDue: 10,
			beedExceedes: false,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		},
		{
			id: 25090,
			name: 'Macy\'s Gift Card $150',
			name2: 'Retail Price: $150.00. Greate deal!',
			ending: 1431008954919,
			staringBid: 1300,
			biddingStep: 100,
			type: 'po',
			beedExceedes: true,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		},
		{
			id: 25091,
			name: 'Sample Auction 4',
			name2: 'Sample description #4',
			ending: 1431008954919,
			staringBid: 0,
			biddingStep: 1,
			type: 'pc',
			paymentDue: 1,
			beedExceedes: false,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		},
		{
			id: 25090,
			name: 'Sample Auction 5',
			name2: 'Another description for sample auction 5',
			ending: 1431016154919,
			staringBid: 0,
			biddingStep: 5,
			type: 'pc',
			paymentDue: 30,
			beedExceedes: false,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		},
		{
			id: 25092,
			name: 'Sample Auction 6',
			name2: 'Greate value, hurry up',
			ending: 1431016254919,
			staringBid: 0,
			biddingStep: 2,
			type: 'pc',
			paymentDue: 12,
			beedExceedes: false,
			winLimitReached: false,
			images: {
				thumb: 'http://media2.destinationrewards.com/catalogimages/20110509014957_4_aucgmacy50b_4.jpg',
				full: 'http://media2.destinationrewards.com/catalogimages/20110509014957_5_aucgmacy50b_5.jpg'
			}
		}		
	];	
	
	var _following = [];
})();
