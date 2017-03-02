var factoryVehicle = angular.module('FactoryVehicle',['ui.router']);

/**
 * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
 * 这里的run方法只会在angular启动的时候运行一次。
 * @param  {[type]} $rootScope         [description]
 * @param  {[type]} $state             [description]
 * @param  {[type]} $stateParams){	} [description]
 * @return {[type]}                    [description]
 */
factoryVehicle.run(function($rootScope,$state,$stateParams){
	$rootScope.$state = $state;
	$rootScope.$stateParams = $stateParams;
});

factoryVehicle.config(function($stateProvider,$urlRouterProvider) {
	$urlRouterProvider.otherwise('/login');
	$stateProvider
		.state('login',{
			url: '/login',
			templateUrl: 'htm/login.html',
			controller: 'loginManager'
		})
		.state('admin',{
			url: '/admin',
			views: {
				'': {
					templateUrl: 'htm/admin.html'
				},
				'AdminTopbar@admin': {
					templateUrl: 'htm/adminTopbar.html',
					controller: 'topbarManager'
				},
				'AdminSidebar@admin': {
					templateUrl: 'htm/adminSidebar.html'
				}
			}
			
		})
		.state('admin.showStations',{
			url: '/showStations',
			views: {
				'': {
					templateUrl: 'htm/adminShowAllStations.html',
					controller: 'adminManager'
				},
				'AdminShowAllStations@admin': {
					templateUrl: 'htm/adminShowAllStations.html',
					controller: 'adminManager'
				}
			}
		})
		.state('admin.showPeople',{
			url: '/showPeople',
			views: {
				'': {
					templateUrl: 'htm/adminShowPeople.html',
					controller: 'adminPeopleManager'
				},
				'adminShowPeople@admin': {
					templateUrl: 'htm/adminShowPeople.html',
					controller: 'adminPeopleManager'
				}
			}
		})
		.state('admin.showReport', {
			url: '/showReport',
			views: {
				'': {
					templateUrl: 'htm/adminReport.html',
					controller: 'adminReportManager'
				},
				'showReport@admin': {
					templateUrl: 'htm/adminReport.html',
					controller: 'adminReportManager'
				}
			}
		})
		.state('affairs',{
			url: '/affairs',
			views: {
				'': {
					templateUrl: 'htm/affairs.html'
				},
				'AffairsTopbar@affairs': {
					templateUrl: 'htm/affairsTopbar.html',
					controller: 'topbarManager'
				},
				'AffairsSidebar@affairs': {
					templateUrl: 'htm/affairsSidebar.html'
				}
			}
		})
		.state('affairs.showBus', {
			url: '/showBus',
			views: {
				'': {
					templateUrl: 'htm/affairsShowBus.html',
					controller: 'affairsBusManager'
				},
				'showBus@affairs': {
					templateUrl: 'htm/affairsShowBus.html',
					controller: 'affairsBusManager'
				}
			}
		})
		.state('affairs.showRoutes', {
			url: '/showRoutes',
			views: {
				'': {
					templateUrl: 'htm/affairsShowRoutes.html',
					controller: 'affairsRoutesManager'
				},
				'showRoutes@affairs': {
					templateUrl: 'htm/affairsShowRoutes.html',
					controller: 'affairsRoutesManager'
				}
			}
		})
		.state('affairs.showReport', {
			url: '/showReport',
			views: {
				'': {
					templateUrl: 'htm/affairsReport.html',
					controller: 'affairsReportManager'
				},
				'showReport@affairs': {
					templateUrl: 'htm/affairsReport.html',
					controller: 'affairsReportManager'
				}
			}
		})
		.state('affairs.showSchedual', {
			url: '/showSchedual',
			views: {
				'': {
					templateUrl: 'htm/affairsSchedual.html',
					controller: 'affairsSchedualManager'
				},
				'showSchedual@affairs': {
					templateUrl: 'htm/affairsSchedual.html',
					controller: 'affairsSchedualMananer'
				}
			}
		})
});
