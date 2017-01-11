(function(){
	var auctions2Directives = angular.module('auctions2Directives', ['angular-inview', 'ngTouch']);
	
	auctions2Directives.directive('scrollableTabset', [function($window) {
		return {
			restrict: 'E',
		    transclude: true,	    
		    controller: function($scope, $element, $attrs) {
		        var panes = $scope.panes = [];

		        $scope.select = function(pane) {
		        	angular.forEach(panes, function(pane) {
		        		pane.selected = false;
		        	});
		        	pane.selected = true;
		        	
		        	adjustOffset($element);
		        };
		        
		        $scope.switchPane = function(forward) {
		        	var currentIndex = getSelectedIndex();
		        	
		        	if (forward) {
		        		if (currentIndex < panes.length - 1) {
		        			this.select(panes[currentIndex + 1]);
		        		}
		        	}
		        	else {
		        		if (currentIndex > 0) {
		        			this.select(panes[currentIndex - 1]);
		        		}		        		
		        	}
		        };

		        this.addPane = function(pane) {
		        	if (panes.length === 0) {
		        		$scope.select(pane);
		        	}
		        	panes.push(pane);
		        };
		        
		        var adjustOffset = function(element) {
		        	var currentIndex = getSelectedIndex();
		        	
		        	if (currentIndex >= 0) {
			        	setTimeout(function () {
			        		var tabsContainer = element[0].querySelector('.' + $attrs.tabsContainerClass),
			        			viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
			        			slider = tabsContainer.parentNode,
			        			maxOffset = viewportWidth - tabsContainer.clientWidth,
			        			offset = 0;
			        		
			        		if (currentIndex == 0 || maxOffset >= 0) {
			        			offset = 0;
			        		}
			        		else {
				        		if (currentIndex == panes.length - 1) {
				        			offset = maxOffset;
				        		}
				        		else {
				        			var activeTab = tabsContainer.children[currentIndex],
				        				elemOffsetLeft = -activeTab.parentNode.offsetLeft + activeTab.offsetLeft;
			        				
				        			offset = Math.clamp((viewportWidth - activeTab.clientWidth) / 2 - elemOffsetLeft, maxOffset, 0);
				        		}
			        		}
			        		
			        		slider.style.marginLeft = offset + 'px';
			        	});
		        	}
		        };
		        
		        var getSelectedIndex = function() {
		        	var result = -1;
		        	for(var i = 0; i < panes.length; i++) {
		        		if (panes[i].selected) {
		        			result = i;
		        			break;
		        		}
		        	}		
		        	
		        	return result;
		        };
		    },
			link: function(scope, element, attrs) {
				setTimeout(function () {
					 
					 					
				});
				

			},
			templateUrl: 'template/scrollable-tabs/tabset.html',
		};
	}])
	.directive('scrollableTab', function() {
		return {
		    require: '^scrollableTabset',
		    restrict: 'E',
		    transclude: true,
		    scope: {
		    	title: '@'
		    },
		    link: function(scope, element, attrs, tabsCtrl) {
		    	tabsCtrl.addPane(scope);
		    },
		    templateUrl: 'template/scrollable-tabs/tab.html'
		};
	});
	
	auctions2Directives.directive('testDir', [function () {
		var loading = '',
			firstLoad = true,
			init = false;
		
		
		
		return {
			link: function (scope, element, attrs) {
				var attrsObj = JSON.parse(attrs.testDir);
				
				scope.inView = function(index, inview, inviewpart, event) {
					return;
					if (document.getElementById('page-2')) {
						var current = document.getElementById('page-2').parentElement;
						var limit = Math.max(document.body.scrollHeight, document.body.offsetHeight, element[0].clientHeight, element[0].scrollHeight, element[0].offsetHeight) 
							- window.innerHeight;
						console.log(current.offsetTop + " " + element[0].scrollTop + " " + limit);
					}
					
					if (!init) {
						element[0].style.height = element[0].offsetHeight - element[0].children[0].offsetHeight + 'px';
						init = true;
					}
					
					switch (loading) {
						case 'next':
							
							break;
						case 'previous':
							
							break;
						default:
							if (inview && inviewpart == 'both') {
								if (index == 'next') {
									loading = index;
									
									scope.loadPage('next', function() {
										loading = '';
									});
								}
								else if (index == 'previous') {
									if (firstLoad) {
										element[0].scrollTop = element[0].children[0].offsetHeight;
										firstLoad = false;
									}
									else {
										scope.loadPage('previous', function(from) {
											if (from) {
												setTimeout(function () {
													
													var current = document.getElementById('page-' + from).parentElement;
													console.log(current.offsetTop + " " + (element[0].children[0].offsetHeight * 3));
													element[0].scrollTop = current.offsetTop - (element[0].children[0].offsetHeight * 3);
													console.log("->" + element[0].scrollTop);
												});
											}
											else {
												element[0].scrollTop = element[0].children[0].offsetHeight;
											}
											

											
												
											loading = '';
											console.log('previous loading is over ' + loading);
										});											
									}
								}
							}
							break;
					}
				};
			}
		};
	}]);	
})();
