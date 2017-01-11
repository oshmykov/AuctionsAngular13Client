(function() {
	var auctions2Controllers = angular.module('auctions2Controllers', []);

	auctions2Controllers.controller('auctionListController', ['$scope', '$routeParams', '$http', '$log', '$location', '$filter', '$route', '$interval', 'AuctionsRestAPI', 'UtilityService', 'CommonService', 'TimerService', function($scope, $routeParams, $http, $log, $location, $filter, $route, $interval, AuctionsRestAPI, UtilityService, CommonService, TimerService) {
		$scope.itemsPerPage = 5;
		
		// 1. Get route parameters
		$scope.type = $routeParams.type;
		$scope.kind = $routeParams.kind;
		$scope.extended = $routeParams.extended;
		$scope.primaryOrder = $routeParams.orderby;
		$scope.secondaryOrder = UtilityService.getSecondary($routeParams.orderby);
		$scope.ascending = UtilityService.isAscending($routeParams.order);
		$scope.offset = parseInt($routeParams.offset);
		$scope.isBookmarked = false;
		
		CommonService.updateTab({ id: 'auctions', path: $location.$$path, title: 'Auctions' });
		CommonService.setActiveTab('auctions');
		CommonService.restoreBack();	

		$scope.auctions = [];
		setTotal(0, $scope.itemsPerPage * $scope.offset);
		
		// 2. Make request
		var request = new AuctionsRestAPI.Request($scope.type, $scope.ascending, $scope.primaryOrder, $scope.secondaryOrder, $scope.offset);
		
		var promise = AuctionsRestAPI.getAuctions({ request: request, chunkLength: $scope.itemsPerPage, initLength: $scope.itemsPerPage });
		promise.then(function(data) {
			$scope.auctions = data.auctions;
			
			setTotal(data.total);
			
			TimerService.setAuctions($scope.auctions);
		},
		function(reject) {
			setTotal(reject.data.total);
		},
		function(update) {
			console.log(update);
		});
		
		$scope.changeOrderBy = function(orderby) {
			var order = UtilityService.getOrder(orderby, true);
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/1'.format($routeParams.type, $routeParams.kind, $routeParams.extended, orderby, order), true);
		};
		
		$scope.filterByType = function(type) {
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/1'.format(type, $routeParams.kind, $routeParams.extended, $routeParams.orderby, $routeParams.order), true);
		};
		
		$scope.filterByExtended = function(extended) {
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/1'.format($routeParams.type, $routeParams.kind, extended, $routeParams.orderby, $routeParams.order), true);
		};		
		
		$scope.changeOrder = function() {
			var order = UtilityService.getOrder($routeParams.orderby, !$scope.ascending);
			
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/1'.format($routeParams.type, $routeParams.kind, $routeParams.extended, $routeParams.orderby, order), true);
		};
		
		$scope.filterByKind = function(kind) {
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/1'.format($routeParams.type, kind, $routeParams.extended, $routeParams.orderby, $routeParams.order), true);
		};
		
		$scope.pageChanged = function() {
			$location.path('/auctions/{0}/{1}/{2}/{3}/{4}/{5}'.format($routeParams.type, $routeParams.kind, $routeParams.extended, $routeParams.orderby, $routeParams.order, $scope.offset), true);
		};
		
		$scope.openDetails = function(id) {
			CommonService.setBack('Auctions', $location.$$path);			
		};
		
        $scope.toggleBookmark = function() {
        	$scope.isBookmarked = !$scope.isBookmarked;
        };
        
        function setTotal(display, pager) {
    		$scope.total = display;
    		$scope.totalForPager = pager != undefined ? pager : display;        	
        }
	}]);
	
	auctions2Controllers.controller('auctionDetailController', ['$scope', '$routeParams', '$location', 'CommonService', 'AuctionsRestAPI', 'TimerService', function($scope, $routeParams, $location, CommonService, AuctionsRestAPI, TimerService) {
		if (CommonService.backData.title != 'Auctions') {
			CommonService.setBack('Auctions', '/auctions2');
		}
		
		$scope.loaded = false;
		$scope.isfollowing = false;

		var promise = AuctionsRestAPI.getAuctionById($routeParams.auctionId);
		promise.then(function(data) {
			$scope.auction = data.auction;
			$scope.nextBid = $scope.auction.currentBid + ($scope.auction.biddingStep ? $scope.auction.biddingStep : 1);
			
			TimerService.setAuctions([$scope.auction]);
		},
		function(reject) {
			
		},
		function(update) {
			console.log(update);
			
		}).finally(function() {
			CommonService.updateTab({ id: 'auctions', path: $location.$$path, title: $scope.$eval('auction.type | typeFilter | uppercase') });
			CommonService.setActiveTab('auctions');
			$scope.loaded = true;
		});
		
		$scope.toggleFollowing = function () {
			$scope.isFavorite = !$scope.isFavorite;
		};
	}]);
	
	auctions2Controllers.controller('auction2MyAuctions', ['$scope', 'CommonService', 'AuctionsRestAPI', 'TimerService', function($scope, CommonService, AuctionsRestAPI, TimerService) {
		CommonService.setActiveTab('my-auctions');
		
		$scope.groups = [];
		$scope.oneAtATime = true;
		
		var promise = AuctionsRestAPI.getMyAuctions();
		promise.then(function(data) {
			if (data.biddingOn.length > 0) {
				$scope.groups.push({ title: 'Bidding On', auctions: data.biddingOn, open: true });
				TimerService.setAuctions($scope.groups[$scope.groups.length - 1].auctions);
			}
			if (data.following.length > 0) {
				
				$scope.groups.push({ title: 'Following', auctions: data.following });
			}			
			if (data.won.length > 0) {
				
				$scope.groups.push({ title: 'Won (last 30 days)', auctions: data.won });
			}
			if (data.lost.length > 0) {
				
				$scope.groups.push({ title: 'Did not Win (last 30 days)', auctions: data.lost });
			}
		},
		function(reject) {
			
		},
		function(update) {
			console.log(update);
			
		}).finally(function() {
			
		});		
	}]);
	
	auctions2Controllers.controller('auction2Settings', ['$scope', 'CommonService', function($scope, CommonService) {
		CommonService.setActiveTab('settings');
	}]);	
	
	auctions2Controllers.controller('auction2LayoutController', ['$scope', '$location', 'CommonService', function($scope, $location, CommonService) {
		
		
		$scope.tabs = CommonService.tabs;

        $scope.$watch(function() { return CommonService.backData; }, 
    		function (value) {
        		$scope.back = value.title;
        		$scope.backPath = value.path;                
        	});
		
		$scope.balance = CommonService.balance;
		
		$scope.selectTab = function(id) {
			if (!CommonService.getTab(id).disable) {
				$location.path(CommonService.getTab(id).path, true);	
			}
		};
	}]);	
})();