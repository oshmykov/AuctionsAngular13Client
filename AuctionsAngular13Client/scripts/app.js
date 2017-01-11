(function(){
	var auctions2App = angular.module('auctions2App', ['ngRoute', 'ui.bootstrap', 'auctions2Controllers', 'auctions2Filters', 'auctions2Services', 'auctions2Directives', 'auctions2Utility']);
	
	
	auctions2App.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
	    var original = $location.path;
	    $location.path = function (path, reload) {
	        if (reload === false) {
	            var lastRoute = $route.current;
	            var un = $rootScope.$on('$locationChangeSuccess', function () {
	                $route.current = lastRoute;
	                un();
	            });
	        }
	        
	        return original.apply($location, [path]);
	    };

	    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
	    	if (current && current.$$route)
	    		$rootScope.title = current.$$route.title;
	    });
	}]);	
	
	
	auctions2App.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/auctions/:type/:kind/:extended/:orderby/:order/:offset', {
			templateUrl: 'partials/auction-list.html',
			controller: 'auctionListController',
			title: 'Auctions2 - Home'
		}).
		when('/auction/:auctionId', {
			templateUrl: 'partials/auction-detail.html',
			controller: 'auctionDetailController',
			title: 'Auctions2 - Auction Details'
		}).
		when('/my-auctions', {
			templateUrl: 'partials/my-auctions.html',
			controller: 'auction2MyAuctions',
			title: 'Auctions2 - My Auctions'
		}).	
		when('/settings', {
			templateUrl: 'partials/settings.html',
			controller: 'auction2Settings',
			title: 'Auctions2 - Settings'
		}).			
		otherwise({
			redirectTo: '/auctions/all-types/regular/with-extended/ending/soonest/1',
		});
	}]);
})();
