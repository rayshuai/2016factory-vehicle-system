factoryVehicle.controller('loginManager', function($scope, $http, $state){

	$scope.user;
	$scope.pass;

	$scope.login = function(){
		var url = '/factory_vehicle/api/login?username='+$scope.user+'&password='+$scope.pass;

		$http({
			method: 'POST',
			url: url
		}).success(function(state){
			console.log(state);
			if(state == 1){
				$state.go('affairs.showBus');
			}else if(state == 2){
				$state.go('admin.showStations');
			}else{

			}

		}).error(function(){
			console.log('登录出错');
		});
	}
});

factoryVehicle.controller('topbarManager',function($scope, $state){
	$scope.logout = function(){
		$state.go('login');
	};
});


factoryVehicle.controller('adminManager',function($scope,$http){
	$scope.stations = [];	//保存从后台取得的所有站点
	$scope.altermativeStations = [];		//保存从后台取得的所有备用站点
	$scope.deleteStaInfo = {
		'marker': null,
		'id': ''
	};		//保存要删除的站点信息
	$scope.updateStaInfo = {
		'name': '',
		'address': '',
		'id': '',
		'marker': null
	};		//保存要修改的站点信息
	$scope.addStaInfo = {
		'name': '',
		'x': '',
		'y': ''
	};		//保存新增加的站点信息
	$scope.searchCondition = '';		//保存用户搜索的条件
	$scope.searchResult = [];			//保存搜索结果
	$scope.map;		//界面地图控制对象
	$scope.markers = [];		//地图上所有站点marker的集合
	$scope.stopMarkers = [];	//地图上所有停车点marker的集合
	$scope.staffMarkers = [];		//地图上所有员工marker的集合
	$scope.staStaffList = [{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003},{'name': '帅全','eaddress': '杭州电子科技大学生活区','e_id':2015003}];
	$scope.stationInfo = {
		'name': '',
		'id': 0000000,
		'address': '',
		'num': 0,
		'passengers': []
	};	//要展示的站点信息
	$scope.stopStationInfo = null;		//要展示的停车点信息

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initMap('map-stations');
		//初始化部分功能
		initFunc();
	});

	/**
	 * 初始化地图
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	var initMap = function(element){
		var map = new BMap.Map(element);
		var point = new BMap.Point(120.164785,30.2453185);
		map.centerAndZoom(point, 12);

		//初始化控件
		map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT}));
		map.addControl(new BMap.OverviewMapControl());
		$scope.map = map;

		//获取站点数据
		getStations();
		//获取停车点数据
		getAlterMativeStations();
		//给地图添加右键菜单
		addMapMenu();
	}

	var initFunc = function(){
		$('#delete-station').find('.agree-delete-station').click(function(){
			deleteMarker();
		});

		$('#update-station').find('.agree-update-station').click(function(){
			updateMarker();
		});

		$('#add-stations').find('.agree-add-station').click(function(){
			addStation();
		});

		$('#sta-staff-date').find('.agree-get-sta-staff').click(function(){
			getStaStaffList();
		})
	};

	/**
	 * 给地图添加右键菜单，添加站点和获取坐标的功能
	 */
	var addMapMenu = function(){
		var mapMenu = new BMap.ContextMenu();

		mapMenu.addItem(new BMap.MenuItem('添加站点', function(point){
			
			$scope.addStaInfo.x = point.lng;
			$scope.addStaInfo.y = point.lat;

			$('#add-stations').openModal();

		}));

		mapMenu.addItem(new BMap.MenuItem('获取坐标', function(point){

			var lng = '经度：'+point.lng;
			var lat = '纬度：'+point.lat;
			$('#show-coordinates').find('.modal-content').find('.lng').text(lng);
			$('#show-coordinates').find('.modal-content').find('.lat').text(lat);
			$('#show-coordinates').openModal();
		}));

		$scope.map.addContextMenu(mapMenu);
	}

	/**
	 * 从后台取得站点数据
	 * @return {[type]} [description]
	 */
	var getStations = function(){
		var url = '/factory_vehicle/api/Station';

		$http.get(url).success(function(data){
			//console.log(data);
			$scope.stations = [];
			for(var i=0;i<data.length;i++){
				var station = {
					'name': data[i].s_name,
					'id': data[i].s_id,
					'x': data[i].longitude,
					'y': data[i].latitude,
					'address': data[i].s_address
				}

				$scope.stations.push(station);
			}

			//添加站点marker
			addMarker();
			$('#is-OK1').openModal();
		}).error(function(){
			console.log('从后台获得站点数据失败');
		});
	}

	/**
	 * 从后台获取停车点数据
	 * @return {[type]} [description]
	 */
	var getAlterMativeStations = function(){
		var url = '/factory_vehicle/api/Point';

		$http.get(url).success(function(data){
			// console.log(data.length);
			$scope.altermativeStations = [];
			for(var i=0;i<data.length;i++){
				var station = {
					'name': data[i].s_name,
					'id': data[i].s_id,
					'x': data[i].longitude,
					'y': data[i].latitude,
					'address': data[i].s_address
				}

				$scope.altermativeStations.push(station);
			}

			addStopMarker();
		}).error(function(){
			console.log('获取停车点失败');
		});
	}

	/**
	 * 添加站点marker
	 */
	var addMarker = function(){
		var point = null;
		$scope.markers = [];
		for(var i=0;i<$scope.stations.length;i++){
			point = new BMap.Point($scope.stations[i].x,$scope.stations[i].y);
			var marker = new BMap.Marker(point);
			$scope.map.addOverlay(marker);

			$scope.markers.push(marker);

			//给marker添加事件
			addEvent(marker,'站点<br>'+$scope.stations[i].name);
			//给marker添加右键菜单
			addMarkerMenu(marker,$scope.stations[i].id);
		}
	}

	/**
	 * 添加停车点marker
	 */
	var addStopMarker = function(){
		var point = null;
		var icon = new BMap.Icon('./images/sta6.png', new BMap.Size(12, 22));
		for(var i=0;i<$scope.altermativeStations.length;i++){
			point = new BMap.Point($scope.altermativeStations[i].x, $scope.altermativeStations[i].y);
			var marker = new BMap.Marker(point, {icon: icon});
			$scope.map.addOverlay(marker);

			$scope.stopMarkers.push(marker);

			addEvent(marker,'停车点<br>'+$scope.altermativeStations[i].name);
		}
	}

	/**
	 * 为marker添加事件
	 * @param {[type]} marker [description]
	 * @param {[type]} name   [description]
	 */
	var addEvent = function(marker,name){
		marker.addEventListener('click',function(e){
			marker.setAnimation(null);
			Materialize.toast(name,4000);
		});
	}

	/**
	 * 为marker添加右键菜单
	 * @param {[type]} marker [站点marker]
	 * @param {int} id [站点的id]
	 */
	var addMarkerMenu = function(marker,id){

		var markerMenu = new BMap.ContextMenu();

		markerMenu.addItem(new BMap.MenuItem('删除',function(){
			$scope.deleteStaInfo = {
				'marker': marker,
				'id': id
			};
			$('#delete-station').openModal();
		}));

		markerMenu.addItem(new BMap.MenuItem('修改',function(){
			$scope.updateStaInfo.marker = marker;
			$scope.updateStaInfo.id = id;

			$('#update-station').openModal();
		}));

		markerMenu.addItem(new BMap.MenuItem('乘车员工',function(){
			$('#sta-staff-date').openModal();
		}));

		marker.addContextMenu(markerMenu);
	};

	/**
	 * 删除站点
	 * @param marker 
	 * @param id     [站点id]
	 */
	var deleteMarker = function(){

		//在地图删除该marker
		$scope.map.removeOverlay($scope.deleteStaInfo.marker);

		//在本地的数据里删除该站点
		for(var i=0; i<$scope.stations.length; i++){
			if($scope.stations[i].id  == $scope.deleteStaInfo.id){
				$scope.stations.splice(i,1);
				break;
			}
		}
		//手动进行脏检查
		$scope.$apply($scope.stations);

		//调用后台接口，在数据库中删除该站点，通过发送id
		var url = '/factory_vehicle/api/Station/'+$scope.deleteStaInfo.id;
		$http({
			url: url,
			method: 'DELETE'
		}).success(function(){
			$('#success-delete').openModal();
			console.log('删除站点成功');
		}).error(function(){
			console.log('删除站点失败');
		});
	};

	/**
	 * 修改站点信息
	 * @param id [description]]
	 */
	var updateMarker = function(){
		console.log($scope.updateStaInfo);
		var url = '/factory_vehicle/api/Station/'+$scope.updateStaInfo.id;

		$http({
			url: url,
			method: 'PUT',
			data: {
				's_name': $scope.updateStaInfo.name,
				'longitude': $scope.updateStaInfo.x,
				'latitude': $scope.updateStaInfo.y
			}
		}).success(function(){
			$('#success-update').openModal();
			console.log('修改站点成功');
		}).error(function(){
			console.log('修改站点失败');
		});

		for(var i=0;i<$scope.stations.length;i++){
			if($scope.stations[i].id == $scope.updateStaInfo.id){
				$scope.stations[i].name = $scope.updateStaInfo.name;
				break;
			}
		}

		//是否对marker进行操作，取决于最终版本是否需要由用户输入经纬度
	};

	/**
	 * 添加站点信息
	 */
	var addStation = function(){
		console.log($scope.addStaInfo);

		var url = '/factory_vehicle/api/Station';

		$http({
			url: url,
			method: 'POST',
			data: {
				's_name': $scope.addStaInfo.name,
				'longitude': $scope.addStaInfo.x,
				'latitude': $scope.addStaInfo.y
			}
		}).success(function(){
			$('#success-add').openModal();
			console.log('新增站点成功');
			$scope.map.clearOverlays();
			getStations();
		}).error(function(){
			console.log('新增站点失败');
		});

	};

	/**
	 * 查询站点的乘车人员
	 * @param  {[type]} id [车辆ID]
	 * @return {[type]}    [乘车人员数组]
	 */
	var getStaPassengers = function(id){
		var url = '/factory_vehicle/api/StaMatchEmp/'+id;

		$http.get(url).success(function(data){
			if(data != undefined){
				$scope.stationInfo.passengers = data;
				$scope.stationInfo.num = data.length;
			}
		}).error(function(){
			console.log('查询站点乘车人员失败');
		})
	};

	/**
	 * 展示站点卡片
	 * @param  {[type]} index [description]
	 * @return {[type]}       [description]
	 */
	$scope.showStation = function(index){
		getStaPassengers($scope.stations[index].id);
		// console.log($scope.stationInfo);
		$scope.stationInfo.name = $scope.stations[index].name;
		$scope.stationInfo.id = $scope.stations[index].id;
		$scope.stationInfo.address = $scope.stations[index].address;

		reflectMarker($scope.stations[index].id);
		$scope.showLevel03();
	}

	/**
	 * 展示停车点卡片
	 * @param  {[type]} index [description]
	 * @return {[type]}       [description]
	 */
	$scope.showStopStation = function(index){
		$scope.stopStationInfo = $scope.altermativeStations[index];

		reflectStopMarker($scope.altermativeStations[index].id);
		$scope.showLevel05();
	}

	$scope.showStation2 = function(index){
		getStaPassengers($scope.searchResult[index].id);
		$scope.stationInfo.name = $scope.searchResult[index].name;
		$scope.stationInfo.id = $scope.searchResult[index].id;
		$scope.stationInfo.address = $scope.searchResult[index].address;

		reflectMarker($scope.searchResult[index].id);
		$scope.showLevel04();
	}

	$scope.showStopStation2 = function(index){
		$scope.stopStationInfo = $scope.altermativeStations[index];

		reflectStopMarker($scope.altermativeStations[i].id);
		$scope.showLevel06();
	}

	/**
	 * 以动画的效果标识站点名单和站点的marker
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
	var reflectMarker = function(id){
		console.log($scope.stations,$scope.markers);
		for(var i=0;i<$scope.markers.length;i++){
			$scope.markers[i].setAnimation(null);
		}
		console.log(id);
		for(i=0;i<$scope.stations.length;i++){
			if($scope.stations[i].id == id){
				break;
			}
		}
		console.log($scope.stations.length,$scope.markers.length,i);
		$scope.markers[i].setAnimation(BMAP_ANIMATION_BOUNCE);
	};

	/**
	 * 以动画的效果标识停车点名单和停车点的marker
	 * @param  {[type]} id [description]
	 * @return {[type]}    [description]
	 */
	var reflectStopMarker = function(id){
		// console.log($scope.stations,$scope.markers);
		for(var i=0;i<$scope.stopMarkers.length;i++){
			$scope.stopMarkers[i].setAnimation(null);
		}
		// console.log(id);
		for(i=0;i<$scope.altermativeStations.length;i++){
			if($scope.altermativeStations[i].id == id){
				break;
			}
		}
		// console.log($scope.stopMarkers.length,i);
		$scope.stopMarkers[i].setAnimation(BMAP_ANIMATION_BOUNCE);
	};	

	/**
	 * 查询站点信息
	 * @return {[type]} [description]
	 */
	$scope.searchStation = function(){
		$scope.searchResult = [];
		var url;

		var condition = Number($scope.searchCondition);
		if(!isNaN(condition)){
			//用户输入的是id
			url = '/factory_vehicle/api/Station/'+condition;
		}else{
			//用户输入的名称
			url = '/factory_vehicle/api/Station?name='+$scope.searchCondition;
		}
		console.log($scope.searchCondition,url);
		$http.get(url).success(function(data){
			// console.log(data);
			if(!isNaN(condition)){
				// $('#station-table').find('.search-result').find('.search-station-result').find('strong').text(1);
				var station = {
					'name': data.s_name,
					'id': data.s_id,
					'x': data.longitude,
					'y': data.latitude,
					'address': data.s_address
				}

				$scope.searchResult.push(station);
			}else{
				// $('#station-table').find('.search-result').find('.search-station-result').find('strong').text(data.length);
				for(var i=0;i<data.length;i++){
					var station = {
						'name': data[i].s_name,
						'id': data[i].s_id,
						'x': data[i].longitude,
						'y': data[i].latitude,
						'address': data[i].s_address
					}

					$scope.searchResult.push(station);
				}
			}
			// console.log($scope.searchResult);
			// $('#station-table').find('.search-result').find('.search-station-result').show();
		}).error(function(){
			console.log('查询失败');
		});

		$scope.showLevel02();
	};

	/**
	 * 获取在某个站点乘车的员工名单
	 * @return {[type]} [description]
	 */
	var getStaStaffList = function(){
		// $scope.staStaffList = [];
		var url = '';

		$http.get(url).success(function(data){
			$('#station-staff').show();
		}).error(function(){
			console.log('查询乘车员工失败');
		});
		$('#station-staff').show();
	};

	/**
	 * 在地图上添加员工的marker
	 */
	var addStaffMarker = function(){
		clearStaffMarkers();
		var point;
		var staffIcon = new BMap.Icon('./images/sta1.png', new BMap.Size(19,25));
		for(var i=0;i<$scope.staStaffList.length;i++){
			point = new BMap.Point($scope.staStaffList[i].lng,$scope.staStaffList[i].lat);
			var marker = new BMap.Marker(point,{icon: staffIcon});
			$scope.staffMarkers.push(marker);
			$scope.map.addOverlay(marker);
			addEvent(marker,$scope.staStaffList[i].address);
		}
	};

	/**
	 * 清除上一次的员工marker
	 * @return {[type]} [description]
	 */
	var clearStaffMarkers = function(){
		for(var i=0;i<$scope.staffMarkers.length;i++){
			$scope.map.removeOverlay($scope.staffMarkers[i]);
		}
		$scope.staffMarkers = [];
	};

	$scope.deleteStopSta = function(){
		for(var i=0;i<$scope.altermativeStations.length;i++){
			if($scope.altermativeStations[i].s_id == $scope.stopStationInfo.s_id ){
				$scope.altermativeStations.splice(i, 1);
				$scope.map.removeOverlay($scope.stopMarkers[i]);

				break;	
			}
		}

		if(document.getElementById('panel-level05').style.display != 'none'){
			$scope.showLevel01();
		}else if(document.getElementById('panel-level06').style.display != 'none'){
			$scope.showLevel02();
		}
	};

	$scope.setStopToStation = function(){
		var url = '/factory_vehicle/api/PointChange/'+$scope.stopStationInfo.s_id;

		$http({
			method: 'PUT',
			url: url,
			data: {
				id: $scope.stopStationInfo.s_id
			}
		}).success(function(){

		}).error(function(){

		});

		for(var i=0;i<$scope.altermativeStations.length;i++){
			if($scope.altermativeStations[i].s_id == $scope.stopStationInfo.s_id ){
				$scope.altermativeStations.splice(i, 1);
				$scope.map.removeOverlay($scope.stopMarkers[i]);

				var stop = $scope.stopStationInfo;
				var point = new BMap.Point(stop.longitude, stop.latitude);
				var marker = new BMap.Marker(point);

				addEvent(marker, '站点<br>'+stop.s_name);

				break;	
			}
		}

		if(document.getElementById('panel-level05').style.display != 'none'){
			$scope.showLevel01();
		}else if(document.getElementById('panel-level06').style.display != 'none'){
			$scope.showLevel02();
		}
	}


	/**
	 * 隐藏该页面下的所有level
	 * @return {[type]} [description]
	 */
	var hideLevel = function(){
		$('#station-table').find('.panel').each(function(){
			$(this).hide();
		});
	};

	/**
	 * 展示panel-level01
	 * @return {[type]} [description]
	 */
	$scope.showLevel01 = function(){
		hideLevel();
		$('#station-table').find('#panel-level01').show('normal');
	};

	/**
	 * 展示panel-level02
	 * @return {[type]} [description]
	 */
	$scope.showLevel02 = function(){
		hideLevel();
		$('#station-table').find('#panel-level02').show('normal');
	};

	/**
	 * 展示panel-level03
	 * @return {[type]} [description]
	 */
	$scope.showLevel03 = function(){
		hideLevel();
		$('#station-table').find('#panel-level03').show('normal');
	};

	/**
	 * 展示panel-level04
	 * @return {[type]} [description]
	 */
	$scope.showLevel04 = function(){
		hideLevel();
		$('#station-table').find('#panel-level04').show('normal');
	};

	/**
	 * 展示panel-level05
	 * @return {[type]} [description]
	 */
	$scope.showLevel05 = function(){
		hideLevel();
		$('#station-table').find('#panel-level05').show('normal');
	};

	/**
	 * 展示panel-level06
	 * @return {[type]} [description]
	 */
	$scope.showLevel06 = function(){
		hideLevel();
		$('#station-table').find('#panel-level06').show('normal');
	};

	/**
	 * 展示panel-level07
	 * @return {[type]} [description]
	 */
	$scope.showLevel07 = function(){
		hideLevel();
		$('#station-table').find('#panel-level07').show('normal');
	};

	$scope.showLevel08 = function(){
		hideLevel();
		$('#station-table').find('#panel-level08').show('normal');
	};

	$scope.showLevel09 = function(){
		hideLevel();
		$('#station-table').find('#panel-level09').show('normal');
	};
});




factoryVehicle.controller('adminPeopleManager',function($scope,$http){
	$scope.map;		//保存当前视图的操作地图
	$scope.stations;		//保存当前的站点信息
	$scope.staMarkers = [];		//保存当前的站点marker
	$scope.updateStaffSta = {
		'e_id': '',
		's_id': ''
	};			//保存要更换站点的员工与对应的站点
	$scope.addpeoples = [{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'},{'id':1212, 'name':'帅全'}]
	$scope.deletepeole;
	$scope.updatepeople;
	$scope.staffList;		//全部员工的信息
	$scope.searchStaffList;	//搜索到的员工信息
	$scope.searchCondition;	//搜索条件
	$scope.chosenStaff;		//被选中查看的员工
	$scope.chosenStaffMarker;	//被选中员工的标志
	$scope.staffGoSta			//员工到站点路线
	$scope.changeSID;
	
	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initMap('map-people');
	});

	/**
	 * 初始化地图
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	var initMap = function(element){
		var map = new BMap.Map(element);
		var point = new BMap.Point(120.164785,30.2453185);
		map.centerAndZoom(point, 12);

		//初始化控件
		map.addControl(new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_RIGHT}));
		map.addControl(new BMap.OverviewMapControl());
		$scope.map = map;

		//获取站点
		getStations();
		//获取员工列表
		getAllStaff();
	}

	/**
	 * 从后台取得站点数据
	 * @return {[type]} [description]
	 */
	var getStations = function(){
		var url = '/factory_vehicle/api/Station';

		$http.get(url).success(function(data){
			//console.log(data);
			$scope.stations = [];
			for(var i=0;i<data.length;i++){
				var station = {
					'name': data[i].s_name,
					'id': data[i].s_id,
					'x': data[i].longitude,
					'y': data[i].latitude
				}

				$scope.stations.push(station);
			}

			//添加站点marker
			addMarker();
			setTimeout(function(){
				$('select').material_select();

				$('#people-table').find('.change-station').click(function(){
					$('#change-sta').openModal();
				});
			},100);

		}).error(function(){
			console.log('从后台获得站点数据失败');
		});
	}

	/**
	 * 添加站点marker
	 */
	var addMarker = function(){
		var point = null;
		$scope.staMarkers = [];
		for(var i=0;i<$scope.stations.length;i++){
			point = new BMap.Point($scope.stations[i].x,$scope.stations[i].y);
			var marker = new BMap.Marker(point);
			$scope.map.addOverlay(marker);

			$scope.staMarkers.push(marker);
			//给marker添加事件
			addEvent(marker,$scope.stations[i].name);
			//给marker添加右键菜单
			addMarkerMenu(marker,$scope.stations[i].id);
		}
	}

	/**
	 * 为marker添加事件
	 * @param {[type]} marker [description]
	 * @param {[type]} name   [description]
	 */
	var addEvent = function(marker,name){
		marker.addEventListener('click',function(e){
			marker.setAnimation(null);
			Materialize.toast(name,4000);
		});
	}

	/**
	 * 为marker添加右键菜单
	 * @param {[type]} marker [站点marker]
	 * @param {int} id [站点的id]
	 */
	var addMarkerMenu = function(marker,id){

		var markerMenu = new BMap.ContextMenu();

		markerMenu.addItem(new BMap.MenuItem('更改当前员工的乘车站点为该站点',function(){
			console.log(id);
			$scope.updateStaffSta.s_id = id;
			updateEmployeeSta();
		}));

		marker.addContextMenu(markerMenu);
	};

	/**
	 * 更改员工的乘车站点
	 */
	var updateEmployeeSta = function(){
		var url = '/factory_vehicle/api/EmpMatchSta/'+$scope.chosenStaff.e_id;

		$http({
			method: 'PUT',
			url: url,
			data: {
				e_id: $scope.chosenStaff.e_id,
				ems: $scope.chosenStaff.s_id
			}
		}).success(function(){
			$('#success-change-sta').openModal();
			for(var i=0;i<$scope.stations.length;i++){
				if($scope.stations[i].s_id == chosenStaff.s_id){
					chosenStaff.s_name = $scope.stations[i].s_name;
					break;
				}
			}

			showEmployeeOnMap();
			console.log('员工站点修改成功！');
		}).error(function(){
			console.log('员工站点修改失败！');
		});

		for(var i=0;i<$scope.staffList.length;i++){
			if($scope.staffList[i].e_id == $scope.chosenStaff.e_id){
				$scope.staffList[i].s_id = $scope.chosenStaff.s_id;
				for(var j=0;j<$scope.stations.length;j++){
					if($scope.stations[j].s_id == $scope.chosenStaff.s_id){
						$scope.staffList[i].s_name = $scope.$scope.stations[j].s_name;
						break;
					}
				}
				break;
			}
		}

		$('#success-change-sta').openModal();
	};

	var getAllStaff = function(){
		var url = '/factory_vehicle/api/EmpMatchSta';

		$http.get(url).success(function(data){
			$scope.staffList = data;
			$('#match').openModal();
		}).error(function(){
			console.log('获取全部员工信息出错');
		});
	};

	$scope.searchStaffFunc = function(){
		var url = '/factory_vehicle/api/EmpMatchSta?name='+$scope.searchCondition;

		$http.get(url).success(function(data){
			$scope.searchStaffList = data;
			$scope.showLevel02();
		}).error(function(){
			console.log('获取查询人员名单失败');
		});

	};


	/**
	 * 展示选中的员工和对应的站点
	*/ 
	$scope.showEmployeeSta = function(staff){
		$scope.chosenStaff = staff;
		// console.log($scope.chosenStaff);
		if($scope.chosenStaffMarker != undefined){
			$scope.map.removeOverlay($scope.chosenStaffMarker);
		}
		if($scope.staffGoSta != undefined){
			$scope.staffGoSta.clearResults();
		}
		showEmployeeOnMap();

		if(document.getElementById('panel-level02').style.display == 'none'){
			$scope.showLevel03();
		}else if(document.getElementById('panel-level01').style.display == 'none'){
			$scope.showLevel04();
		}
	};

	var showEmployeeOnMap = function(){
		var ePoint = new BMap.Point($scope.chosenStaff.e_x, $scope.chosenStaff.e_y);
		var homeIcon = new BMap.Icon('./images/sta1.png',new BMap.Size(19,25));
		$scope.chosenStaffMarker = new BMap.Marker(ePoint,{icon: homeIcon});
		$scope.map.addOverlay($scope.chosenStaffMarker);
		addEvent($scope.chosenStaffMarker, $scope.chosenStaff.e_name+'<br>'+$scope.chosenStaff.e_address);

		var s_id = $scope.chosenStaff.s_id;
		for(var i=0;i<$scope.stations.length;i++){
			if($scope.stations[i].id == s_id){
				var sMarker = $scope.staMarkers[i];
				break;
			}
		}

		var sPoint = sMarker.point;
		$scope.staffGoSta = new BMap.WalkingRoute($scope.map, {renderOptions:{map: $scope.map, autoViewport: true}});
		$scope.staffGoSta.search(ePoint,sPoint);
	};


	$scope.searchNear = function(){
		var url = '/factory_vehicle/api/EmpMatchSta/Near';

		$http({
			method: 'PUT',
			url: url,
			data: $scope.chosenStaff
		}).success(function(data){
			var points = [];

			for(var i=0;i<data.length;i++){
				for(var j=0;j<$scope.stations.length;j++){
					if($scope.stations[j].s_id == data[i].s_id){
						$scope.staMarkers[j].setAnimation(BMAP_ANIMATION_BOUNCE);
						break;
					}
				}
				var point = new BMap.Point(data[i].longitude, data[i].latitude);
				points.push(point);
			}

			$scope.map.setViewport(points);

			console.log(data);
		}).error(function(){
			console.log('获取附近站点失败');
		});


	}

	/**
	 * 隐藏所有Level
	 * @return {[type]} [description]
	 */
	var hideLevel = function(){
		$('#people-table').find('.panel').hide();
	};

	$scope.showLevel01 = function(){
		hideLevel();
		$('#people-table').find('#panel-level01').show('normal');

		if($scope.chosenStaffMarker != undefined){
			$scope.map.removeOverlay($scope.chosenStaffMarker);
		}
		if($scope.staffGoSta != undefined){
			$scope.staffGoSta.clearResults();
		}

		$scope.map.panTo(new BMap.Point(120.164785,30.2453185));
		$scope.map.setZoom(12);

	};

	$scope.showLevel02 = function(){
		hideLevel();
		$('#people-table').find('#panel-level02').show('normal');

		$scope.map.panTo(new BMap.Point(120.164785,30.2453185));
		$scope.map.setZoom(12);
	};

	$scope.showLevel03 = function(){
		hideLevel();
		$('#people-table').find('#panel-level03').show('normal');
	};

	$scope.showLevel04 = function(){
		hideLevel();
		$('#people-table').find('#panel-level04').show('normal');
	};

	$scope.showLevel05 = function(){
		hideLevel();
		$('#people-table').find('#panel-level05').show('normal');
		showGuiHua();
	};

	$scope.guihuaList;

	var showGuiHua = function(){
		var url = '/factory_vehicle/api/EmpMatchSta/calcu';

		$http.get(url).success(function(data){
			$scope.guihuaList = data;
			console.log(data);
		}).error(function(){
			console.log('人员规划失败');
		});
	}
});



factoryVehicle.controller('adminReportManager',function($scope,$http){
	var month = ['','一月,','二月,','三月,','四月,','五月,','六月,','七月,','八月,','九月,','十月,','十一月,','十二月,'];
	$scope.date = '2016-08-01';		//查询日期
	$scope.style = 2;			//查询方式
	$scope.mychart = null;
	$scope.xAxis;
	$scope.num;

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initChart();
	});

	$scope.getChartData = function(){
		$scope.mychart.showLoading();
		var date = translateDate();

		var url;
		if($scope.style == 1){
			url = '/factory_vehicle/api/Excel/day?day='+date;
		}else if($scope.style == 2){
			url = '/factory_vehicle/api/Excel/week?day='+date;
		}else if($scope.style == 3){
			url = '/factory_vehicle/api/Excel/month?day='+date;
		}

		$http.get(url).success(function(data){
			console.log(data);
			$scope.xAxis = data.sname;
			$scope.num = data.count;
			$scope.mychart.hideLoading();
			setOption();
		}).error(function(){
			console.log('获取报表信息出错');
		});
	};

	/**
	 * 初始化图表
	 * @return {[type]} [description]
	 */
	var initChart = function(){
		var mychart = echarts.init(document.getElementById('body-chart'));
		$scope.mychart = mychart;

		option = {
		    title: {
		        text: '各站点乘车人数图'
		    },
		    tooltip: {
		        trigger: 'axis'
		    },
		    legend: {
		        data:[
		        	{
		        		name: '乘车人数',
		        		icon: 'circle'
		        	}
		        ]
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '8%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {},
		            dataView: {},
		            magicType: {
		            	show: true,
		            	type: ['line', 'bar']
		            }
		        }
		    },
		    dataZoom: [
		    	{
		    		type: 'slider',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0,
		    		bottom: '1%'
		    	},
		    	{
		    		type: 'inside',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0
		    	}
		    ],
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: []
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'乘车人数',
		            type:'line',
		            stack: '总量',
		            silent: false,
		            data: []
		        }
		    ]
		}

		$scope.mychart.setOption(option);

		$scope.mychart.showLoading();

		var url = '/factory_vehicle/api/Excel/week?day=2016-08-01';
		$http.get(url).success(function(data){
			$scope.xAxis = data.sname;
			$scope.num = data.count;
			$scope.mychart.hideLoading();
			setOption();
		}).error(function(){
			console.log('初始化报表出错');
		});

		$scope.mychart.on('click',function(params){
			console.log(params);
			if(params.componentType == 'series'){
				getNameList(params.name);
			}
		});

	}

	$scope.nameList;

	var getNameList = function(name){
		var url = '/factory_vehicle/api/Excel/nameSta';

		var date = translateDate();

		$http({
			method: 'GET',
			url: url,
			params: {
				day: date,
				sname: name
			}
		}).success(function(data){
			console.log(data);
			$scope.nameList = data;
			$('#name-list').openModal();
		}).error(function(){
			console.log('获取名单失败');
		});
	}

	/**
	 * 更新数据
	 */
	var setOption = function(){
		var option = {
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: $scope.xAxis
			},
			series: [
				{
					name: '乘车人数',
					type: 'line',
					stack: '总量',
					silent: false,
					data: $scope.num
				}
			]
		};

		$scope.mychart.setOption(option);
	}

	/**
	 * 日期格式转化
	 * @return {[type]} [description]
	 */
	var translateDate = function(){
		var dateArr = $scope.date.split(' ');
		var m = month.indexOf(dateArr[1]);
		var dateStr = ''+dateArr[2]+'-'+m+'-'+dateArr[0];
		return dateStr;
	}

	/*var createChart = function(){
		var mychart = echarts.init(document.getElementById('body-chart'));

		option = {
		    title: {
		        text: '各站点乘车人数图'
		    },
		    tooltip: {
		        trigger: 'axis'
		    },
		    legend: {
		        data:[
		        	{
		        		name: '乘车人数',
		        		icon: 'circle'
		        	}
		        ]
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '8%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {},
		            dataView: {},
		            magicType: {
		            	show: true,
		            	type: ['line', 'bar']
		            }
		        }
		    },
		    dataZoom: [
		    	{
		    		type: 'slider',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0,
		    		bottom: '1%'
		    	},
		    	{
		    		type: 'inside',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0
		    	}
		    ],
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: ['周一','周二','周三','周四','周五','周六','周日','周一','周二','周三','周四','周五','周六','周日','周一','周二','周三','周四','周五','周六','周日','周一','周二','周三','周四','周五','周六','周日','周一','周二','周三','周四','周五','周六','周日','周一','周二','周三','周四','周五','周六','周日']
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'乘车人数',
		            type:'line',
		            stack: '总量',
		            data:[120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230, 210,120, 132, 101, 134, 90, 230, 210]
		        }
		    ]
		}
		mychart.setOption(option);

	}*/

});




factoryVehicle.controller('affairsBusManager',function($scope,$http){
	//$scope.buses = [{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24},{'brand': '安凯','logon': '2013-10-11','dated': '2019-10-11','license': '浙A56798', 'seat': 24}];
	$scope.buses;	//保存车辆信息
	$scope.deleteBusInfo;	//保存要删除的车辆信息
	$scope.updateBusInfo;	//保存要更新的车辆信息
	$scope.addBusInfo = {
		brand: '',
		seat: '',
		d_license: '',
		dated: '',
		logon: ''
	};		//保存新增加的车辆信息
	$scope.searchCondition = {
		condition: '',
		way: ''		//1表示按照ID,2表示按照品牌
	};		//保存查询的信息
	$scope.searchResult;		//保存查询的结果

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initFunc();
		getBusInfo();
	});

	/**
	 * 初始化页面的模态框，与业务逻辑无关
	 * @return {[type]} [description]
	 */
	var initFunc = function(){
		$('#showBus-all').find('.heading').find('.add').click(function(){
			$('#add-bus-modal').openModal();
		});
		$('#showBus-all').find('.heading').find('.search').click(function(){
			$('#search-bus-modal').openModal();
		});

		$('#update-bus-modal').find('.modal-footer').find('.agree-update-bus').click(function(){
			console.log($scope.updateBusInfo);
			updateBus();
		});
		$('#delete-bus-modal').find('.modal-footer').find('.agree-delete-bus').click(function(){
			// console.log($scope.deleteBusInfo);
			deleteBus();
		});
		$('#add-bus-modal').find('.modal-footer').find('.agree-add-bus').click(function(){
			console.log($scope.addBusInfo);
			addBus();
		});
		$('#search-bus-modal').find('.modal-footer').find('.agree-search-bus').click(function(){
			console.log($scope.searchCondition);
			searchBus();
		});
	}

	/**
	 * 向后台请求车辆信息
	 * @return {[type]} [description]
	 */
	var getBusInfo = function(){
		var url = '/factory_vehicle/api/car_inf';
		$http.get(url).success(function(data){
			$scope.buses = data;	//将后台取得的数据保存
		}).error(function(err){
			console.log(err);
		});
	};

	/**
	 * 向后台请求删除车辆信息
	 * @return {[type]} [description]
	 */
	var deleteBus = function(){
		var url = '/factory_vehicle/api/car_inf/'+$scope.deleteBusInfo.id;

		for(var i=0;i<$scope.buses.length;i++){
			if($scope.buses[i].id == $scope.deleteBusInfo.id){
				$scope.buses.splice(i,1);
				break;
			}
		}

		$http({
			url: url,
			method: 'DELETE'
		}).success(function(){
			$('#success-delete').openModal();
			console.log('车辆删除成功');
		}).error(function(){
			console.log('车辆删除失败');
		})
	}

	/**
	 * 向后台请求添加车辆
	 */
	var addBus = function(){
		var url = '/factory_vehicle/api/car_inf';

		$http({
			url: url,
			method: 'POST',
			data: {
				'id': '',
				'brand': $scope.addBusInfo.brand,
				'seat': $scope.addBusInfo.seat,
				'd_license': $scope.addBusInfo.d_license,
				'logon': $scope.addBusInfo.logon,
				'dated': $scope.addBusInfo.dated
			}
		}).success(function(){
			console.log('新增车辆成功');
			getBusInfo();		//重新获取车辆数据
			$('#success-add').openModal();
		}).error(function(){
			console.log('新增车辆失败');
		})
	}

	/**
	 * 向后台请求查询车辆信息
	 * @return {[type]} [description]
	 */
	var searchBus = function(){
		var url;

		if($scope.searchCondition.way == '1'){
			url = '/factory_vehicle/api/car_inf/'+$scope.searchCondition.condition;
		}else if($scope.searchCondition.way == '2'){
			url = '/factory_vehicle/api/car_inf?brand='+$scope.searchCondition.condition;
		}

		$http.get(url).success(function(data){
			console.log(data);
			$scope.searchResult = data;

		}).error(function(){
			console.log('查询车辆信息出错');
		});
	}

	/**
	 * 向后台请求修改车辆信息
	 * @return {[type]} [description]
	 */
	var updateBus = function(){
		var url = '/factory_vehicle/api/car_inf/'+$scope.updateBusInfo.id;

		$http({
			url: url,
			method: 'PUT',
			data: {
				'id': $scope.updateBusInfo.id,
				'brand': $scope.updateBusInfo.brand,
				'seat': $scope.updateBusInfo.seat,
				'logon': $scope.updateBusInfo.logon,
				'dated': $scope.updateBusInfo.dated,
				'd_license': $scope.updateBusInfo.d_license
			}
		}).success(function(){
			$('#success-update').openModal();
			console.log('修改成功');
		}).error(function(){
			console.log('修改失败');
		})
	}

	/**
	 * 获得要修改的车辆信息
	 * @param  {[type]} bus [description]
	 * @return {[type]}     [description]
	 */
	$scope.getUpdateBus = function(bus){
		$scope.updateBusInfo = bus;

		$('#update-bus-modal').find('.modal-content').find('#update-brand').val(bus.brand);
		$('#update-bus-modal').find('.modal-content').find('#update-seat').val(bus.seat);
		$('#update-bus-modal').find('.modal-content').find('#update-logon').val(bus.logon);
		$('#update-bus-modal').find('.modal-content').find('#update-dated').val(bus.dated);
		$('#update-bus-modal').find('.modal-content').find('#update-license').val(bus.d_license);
		$('#update-bus-modal').openModal();
	};

	/**
	 * 获得要删除的车辆信息
	 * @param  {[type]} bus [description]
	 * @return {[type]}     [description]
	 */
	$scope.getDeleteBus = function(bus){

		$scope.deleteBusInfo = bus;
		$('#delete-bus-modal').openModal();
		
	};
});

factoryVehicle.controller('affairsRoutesManager', function($scope,$http){
	$scope.map;
	$scope.stations;	//保存站点信息
	$scope.routes;		//保存路线信息
	$scope.searchRoutes;		//保存查询到的线路信息
	$scope.searchCondition;		//查询条件
	$scope.theBus = {
		'license': '',
		'driver': '',
		'brand': '',
		'seat': '',
		'logon': '',
		'dated': '',
		'driver_license': ''
	};	//保存当前线路的车辆信息
	$scope.theStations = [];	//保存当前线路的站点信息
	$scope.theSta = {
		'id': '',
		'name': '',
		'num': 0,
		'date': ''
	};		//保存当前产看站点的详情
	$scope.paths = [];		//保存地图上要展示的路线信息
	$scope.searchPaths = [];
	$scope.theUpdateSta = {
		o_id: 0,
		n_id: 0
	};		//保存要修改的站点信息
	$scope.theAddSta = {
		's_id': 0,
		's_name': '',
		'num_of_emp': 0,
		'used_time': 0,
		'arrival_time': []
	};		//保存新增的站点信息
	$scope.theChangeRoute = {
		'car': {},
		'stations': []
	};	//保存修改的路线信息
	$scope.theDrivingRoutes = [];	//保存地图上的驾驶路线

	$scope.intelligentRoutes = [];	//保存路线只能规划结果
	$scope.inteMapRoute = [];
	$scope.inteOneRoute;

	$scope.fitrate;		//保存路线的合适率

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initMap('map-routes');
		// getRoutes();
	});

	//地图上路线的预设颜色
	var pathColors = ['#07377E','#6F89F1','#602BA7','#3275A9','#2AF1EF','#4EE2A8','#C3F03F','#98F3FC'];

	/**
	 * 初始化地图
	 * @param  {[type]} element [description]
	 * @return {[type]}         [description]
	 */
	var initMap = function(element){
		var map = new BMap.Map(element);
		var point = new BMap.Point(120.164785,30.2453185);
		map.centerAndZoom(point, 13);

		//初始化控件
		map.addControl(new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_RIGHT}));
		map.addControl(new BMap.OverviewMapControl());
		$scope.map = map;

		//展示站点
		showStations();
		//获取路线信息
		getRoutes();
	}

	$scope.setToRealRoutes = function(plan){
		$scope.routes = plan;
		$scope.showLevel01();
	}

	/**
	 * 在地图上展示站点
	 * @return {[type]} [description]
	 */
	var showStations = function(){
		var url = '/factory_vehicle/api/Station';

		$http.get(url).success(function(data){
			$scope.stations = data;
			setTimeout(function(){
				$('select').material_select();
			},0);		
			//添加站点marker
			addMarker();
		}).error(function(){
			console.log('获取站点信息出错');
		});
	};

	/**
	 * 添加站点marker
	 */
	var addMarker = function(){
		var point = null;

		for(var i=0;i<$scope.stations.length;i++){
			point = new BMap.Point($scope.stations[i].longitude,$scope.stations[i].latitude);
			var marker = new BMap.Marker(point);
			$scope.map.addOverlay(marker);
			//给marker添加事件
			addEvent(marker,$scope.stations[i].s_name);
			//给marker添加右键菜单
			//addMarkerMenu(marker,$scope.stations[i].id);
		}

		// getIntelligent();
	};

	var addEvent = function(marker,name){
		marker.addEventListener('click',function(){
			marker.setAnimation(null);
			Materialize.toast(name,4000);
		});
	};

	var getRoutesRate = function(){
		var url = '/factory_vehicle/api/route/fitrate';

		$http.get(url).success(function(data){
			$scope.fitrate = data;
			$('#success-fitrate').openModal();
			getIntelligent();
			console.log('获取路线合适率成功');
		}).error(function(){
			console.log('获取路线合适率失败');
		})
	};

	var getRoutes = function(){
		var url = '/factory_vehicle/api/route';

		$http.get(url).success(function(data){
			$scope.routes = data;
			$scope.paths = [];
			for(var i=0;i<data.length;i++){
				var path = data[i].stations;
				$scope.paths.push(path);
			}
			showRoutes();
			// getIntelligent();
			getRoutesRate();
		}).error(function(){
			console.log('获取全部路线信息出错');
		})
	};

	var getIntelligent = function(){
		var url = '/factory_vehicle/api/route/plan';

		$http.get(url).success(function(data){
			$scope.intelligentRoutes = data;
			console.log('成功');
		}).error(function(){
			console.log('路线智能规划失败');
		});
	};

	$scope.showIntelligentOnMap = function(routes){
		// if(document.getElementById('panel-level07').style.display != 'none'){
		// 	$scope.showLevel08();
		// }

		if($scope.inteMapRoute.length != 0){
			for(var i=0;i<$scope.inteMapRoute.length;i++){
				$scope.inteMapRoute[i].clearResults();
			}
			$scope.inteMapRoute = [];
		}

		var route;
		var start,end;
		if(routes instanceof Array){
			var num = 0;
			for(var i=0;i<routes.length;i++){
				var route = routes[i];

				start = new BMap.Point(route.stations[0].longitude,route.stations[0].latitude);
				end = new BMap.Point(route.stations[route.stations.length-1].longitude,route.stations[route.stations.length-1].latitude);
				var waypoints = [];
				for(var j=1;j<route.stations.length-1;j++){
					var point = new BMap.Point(route.stations[j].longitude,route.stations[j].latitude);
					waypoints.push(point);
				}
				var driving = new BMap.DrivingRoute($scope.map, {renderOptions: {map: $scope.map, autoViewport:false}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
				driving.search(start,end,{waypoints: waypoints});
				driving.setPolylinesSetCallback(function(routes){
					for(var k=0;k<routes.length;k++){
						routes[k].getPolyline().setStrokeColor(pathColors[num]);
						routes[k].getPolyline().setStrokeOpacity(0.75);
					}
					num++;
				});
				$scope.inteMapRoute.push(driving);

			}
		}else{
			$scope.inteOneRoute = routes;
			$scope.showLevel08();
			start = new BMap.Point(routes.stations[0].longitude,routes.stations[0].latitude);
			end = new BMap.Point(routes.stations[routes.stations.length-1].longitude,routes.stations[routes.stations.length-1].latitude);
			var waypoints = [];
			for(var i=1;i<routes.stations.length-1;i++){
				var point = new BMap.Point(routes.stations[i].longitude,routes.stations[i].latitude);
				waypoints.push(point);
			}
			var driving = new BMap.DrivingRoute($scope.map, {renderOptions: {map: $scope.map, autoViewport:true}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
			driving.search(start,end,{waypoints: waypoints});
			driving.setPolylinesSetCallback(function(routes){
				for(var k=0;k<routes.length;k++){
					routes[k].getPolyline().setStrokeColor('#153F98');
					routes[k].getPolyline().setStrokeOpacity(0.7);
				}
			});
			$scope.inteMapRoute.push(driving);		
		}
	};

	var showRoutes = function(){
		clearMapRoutes();
		$scope.theDrivingRoutes = [];
		var start,end;
		var num = 0;
		for(var i=0;i<$scope.paths.length;i++){
			var l = $scope.paths[i].length;
			start = new BMap.Point($scope.paths[i][0].longitude,$scope.paths[i][0].latitude);
			end = new BMap.Point($scope.paths[i][l-1].longitude,$scope.paths[i][l-1].latitude);
			var droute = new BMap.DrivingRoute($scope.map,{renderOptions:{map:$scope.map, autoViewport: false}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
			var waypoints = [];
			for(var j=1;j<$scope.paths[i].length-1;j++){
				var point = new BMap.Point($scope.paths[i][j].longitude,$scope.paths[i][j].latitude);
				waypoints.push(point);
			}
			droute.search(start,end,{waypoints: waypoints});
			droute.setPolylinesSetCallback(function(routes){
				// console.log(routes,routes[0].getPolyline());
				for(var k=0;k<routes.length;k++){
					routes[k].getPolyline().setStrokeColor(pathColors[num]);
					routes[k].getPolyline().setStrokeOpacity(0.75);
				}
				num++;			
			});
			$scope.theDrivingRoutes.push(droute);
		}
	};

	var clearMapRoutes = function(){
		for(var i=0;i<$scope.theDrivingRoutes.length;i++){
			$scope.theDrivingRoutes[i].clearResults();
		}
		$scope.theDrivingRoutes = [];
	}

	var showBus = function(index){
		$scope.theBus.id = $scope.routes[index].car.id;
		$scope.theBus.name = $scope.routes[index].car.name;
		$scope.theBus.brand = $scope.routes[index].car.brand;
		$scope.theBus.seat = $scope.routes[index].car.seat;
		$scope.theBus.logon = $scope.routes[index].car.logon;
		$scope.theBus.dated = $scope.routes[index].car.dated;
		$scope.theBus.license = $scope.routes[index].car.d_license;
		$scope.theBus.driver = $scope.routes[index].car.ename;
		$scope.theBus.driver_license = $scope.routes[index].car.eiden;
	}

	var showRouteStations = function(index){
		$scope.theStations = [];

		$scope.theStations = $scope.routes[index].stations;
		$scope.theChangeRoute.car = $scope.routes[index].car;
	}

	var getOneSta = function(index){
		$scope.theSta.id = $scope.theStations[index].s_id;
		$scope.theSta.name = $scope.theStations[index].s_name;
		$scope.theSta.num = $scope.theStations[index].num_of_emp;
		$scope.theSta.date = '' + $scope.theStations[index].arrival_time[0] + '/' + $scope.theStations[index].arrival_time[1];
	}

	var showOneRouteOnMap = function(index){
		clearMapRoutes();
		var l = $scope.paths[index].length;
		var start = new BMap.Point($scope.paths[index][0].longitude,$scope.paths[index][0].latitude);
		var end = new BMap.Point($scope.paths[index][l-1].longitude,$scope.paths[index][l-1].latitude);
		var waypoints = [];
		for(var j=1;j<l-1;j++){
			var point = new BMap.Point($scope.paths[index][j].longitude,$scope.paths[index][j].latitude);
			waypoints.push(point);
		}
		var driving = new BMap.DrivingRoute($scope.map, {renderOptions: {map: $scope.map,autoViewport:true}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
		driving.search(start, end, {waypoints: waypoints});
		driving.setPolylinesSetCallback(function(routes){
			for(var k=0;k<routes.length;k++){
				routes[k].getPolyline().setStrokeColor('#153F98');
				routes[k].getPolyline().setStrokeOpacity(0.7);
			}
		});
		$scope.theDrivingRoutes.push(driving);
	}

	$scope.showOneRoute = function(index){
		showBus(index);
		showRouteStations(index);
		showOneRouteOnMap(index);
		$scope.showLevel03();
	};

	$scope.showOneSta = function(index){
		getOneSta(index);
		$scope.showLevel05();
	};

	$scope.lookForRoute = function(){
		var url = '/factory_vehicle/api/route?station='+$scope.searchCondition;

		$http.get(url).success(function(data){
			$scope.searchRoutes = data;
			$scope.searchPaths = [];
			for(var i=0;i<data.length;i++){
				var path = data[i].stations;
				$scope.searchPaths.push(path);
			}
		}).error(function(){
			console.log('查询路线时出错');
		});

		$scope.showLevel02();
	};

	var showSearchRoutes = function(){
		clearMapRoutes();
		$scope.theDrivingRoutes = [];
		var start,end;
		var num = 0;
		for(var i=0;i<$scope.searchPaths.length;i++){
			var l = $scope.searchPaths[i].length;
			start = new BMap.Point($scope.searchPaths[i][0].longitude,$scope.searchPaths[i][0].latitude);
			end = new BMap.Point($scope.searchPaths[i][l-1].longitude,$scope.searchPaths[i][l-1].latitude);
			var droute = new BMap.DrivingRoute($scope.map,{renderOptions:{map:$scope.map, autoViewport:false}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
			var waypoints = [];
			for(var j=1;j<$scope.searchPaths[i].length-1;j++){
				var point = new BMap.Point($scope.searchPaths[i][j].longitude,$scope.searchPaths[i][j].latitude);
				waypoints.push(point);
			}
			droute.search(start,end,{waypoints: waypoints});
			droute.setPolylinesSetCallback(function(routes){
				// console.log(routes,routes[0].getPolyline());
				for(var k=0;k<routes.length;k++){
					routes[k].getPolyline().setStrokeColor(pathColors[num]);
					routes[k].getPolyline().setStrokeOpacity(0.75);
				}
				num++;			
			});
			$scope.theDrivingRoutes.push(droute);
		}
	};

	var searchShowBus = function(index){
		$scope.theBus.id = $scope.searchRoutes[index].car.id;
		$scope.theBus.name = $scope.searchRoutes[index].car.name;
		$scope.theBus.brand = $scope.searchRoutes[index].car.brand;
		$scope.theBus.seat = $scope.searchRoutes[index].car.seat;
		$scope.theBus.logon = $scope.searchRoutes[index].car.logon;
		$scope.theBus.dated = $scope.searchRoutes[index].car.dated;
		$scope.theBus.license = $scope.searchRoutes[index].car.d_license;
		$scope.theBus.driver = $scope.searchRoutes[index].car.ename;
		$scope.theBus.driver_license = $scope.searchRoutes[index].car.eiden;
	};

	var searchShowRouteStations = function(index){
		$scope.theStations = [];

		$scope.theStations = $scope.searchRoutes[index].stations;
		$scope.theChangeRoute.car = $scope.searchRoutes[index].car;
	};

	var searchGetOneSta = function(index){
		$scope.theSta.id = $scope.theStations[index].s_id;
		$scope.theSta.name = $scope.theStations[index].s_name;
		$scope.theSta.num = $scope.theStations[index].num_of_emp;
		$scope.theSta.date = '' + $scope.theStations[index].arrival_time[0] + '/' + $scope.theStations[index].arrival_time[1];
		
	};

	var showSearchOneRouteOnMap = function(index){
		clearMapRoutes();
		var l = $scope.searchPaths[index].length;
		for(var i=0;i<l;i++){
			var start = new BMap.Point($scope.searchPaths[index][0].longitude,$scope.searchPaths[index][0].latitude);
			var end = new BMap.Point($scope.searchPaths[index][l-1].longitude,$scope.searchPaths[index][l-1].latitude);
			var waypoints = [];
			for(var j=1;j<l-1;j++){
				var point = new BMap.Point($scope.searchPaths[index][j].longitude,$scope.searchPaths[index][j].latitude);
				waypoints.push(point);
			}
		}
		var driving = new BMap.DrivingRoute($scope.map, {renderOptions: {map: $scope.map, autoViewport: true}, policy: BMAP_DRIVING_POLICY_LEAST_DISTANCE});
		driving.search(start, end, {waypoints: waypoints});
		driving.setPolylinesSetCallback(function(routes){
			for(var k=0;k<routes.length;k++){
				routes[k].getPolyline().setStrokeColor('#153F98');
				routes[k].getPolyline().setStrokeOpacity(0.7);
			}
		});
		$scope.theDrivingRoutes.push(driving);
	}

	$scope.searchShowOneRoute = function(index){
		searchShowBus(index);
		searchShowRouteStations(index);
		showSearchOneRouteOnMap(index);
		$scope.showLevel04();
	};

	$scope.searchShowOneSta = function(index){
		searchGetOneSta(index);
		$scope.showLevel06();
	};

	$scope.updateBusInfo = function(){
		var url = '/factory_vehicle/api/car_inf/'+$scope.theBus.id;

		$http({
			method: 'PUT',
			url: url,
			data: {
				'id': $scope.theBus.id,
				'brand': $scope.theBus.brand,
				'seat': $scope.theBus.seat,
				'logon': $scope.theBus.logon,
				'dated': $scope.theBus.dated,
				'd_license': $scope.theBus.license
			}
		}).success(function(){
			console.log('更新路线中的车辆信息成功');
			$('#success-bus').openModal();
		}).error(function(){
			console.log('更新路线中的车辆信息失败');
		});

	};

	$scope.deleteRouteSta = function(){
		var url = '/factory_vehicle/api/route/'+$scope.theChangeRoute.car.id;

		removeStaFromRoute();
		$scope.theChangeRoute.stations = $scope.theStations;
		$http({
			method: 'PUT',
			url: url,
			data: $scope.theChangeRoute
		}).success(function(){
			$('#success-delete-sta').openModal();
			$scope.showLevel03();
			console.log('删除路线中的站点成功');
		}).error(function(){
			console.log('删除路线中的站点失败');
		});
	};

	$scope.deleteSearchRouteSta = function(){
		var url = '/factory_vehicle/api/route/'+$scope.theChangeRoute.car.id;

		removeStaFromRoute();
		$scope.theChangeRoute.stations = $scope.theStations;
		$http({
			method: 'PUT',
			url: url,
			data: $scope.theChangeRoute
		}).success(function(){
			$('#success-delete-sta').openModal();
			$scope.showLevel04();
			console.log('删除路线中的站点成功');
		}).error(function(){
			console.log('删除路线中的站点失败');
		});
	};

	var removeStaFromRoute = function(){
		for(var i=0;i<$scope.theStations.length;i++){
			if($scope.theSta.id == $scope.theStations[i].s_id){
				$scope.theStations.splice(i,1);
				break;
			}
		}
	};

	$scope.addRouteSta = function(){
		var url = '/factory_vehicle/api/route/'+$scope.theChangeRoute.car.id;

		addStaToRoute();
		$scope.theChangeRoute.stations = $scope.theStations;
		console.log($scope.theChangeRoute);
		$http({
			method: 'PUT',
			url: url,
			data: $scope.theChangeRoute
		}).success(function(){
			$('#success-add-sta').openModal();
			$scope.showLevel03();
			console.log('添加路线中的站点成功');
		}).error(function(){
			console.log('添加路线中的站点失败');
		});
	};

	$scope.addSearchRouteSta = function(){
		var url = '/factory_vehicle/api/route/'+$scope.theChangeRoute.car.id;

		addStaToRoute();
		$scope.theChangeRoute.stations = $scope.theStations;
		$http({
			method: 'PUT',
			url: url,
			data: $scope.theChangeRoute
		}).success(function(){
			$('#success-add-sta').openModal();
			$scope.showLevel04();
			console.log('添加路线中的站点成功');
		}).error(function(){
			console.log('添加路线中的站点失败');
		});
	};

	var addStaToRoute = function(){
		for(var i=0;i<$scope.stations.length;i++){
			if($scope.theAddSta.s_id == $scope.stations[i].s_id){
				$scope.theAddSta.s_name == $scope.stations[i].s_name;
				break;
			}
		}

		for(var i=0;i<$scope.theStations.length;i++){
			if($scope.theSta.id == $scope.theStations[i].s_id){
				$scope.theStations.push({});
				for(var j=$scope.theStations.length;j>i;j--){
					$scope.theStations[j] = $scope.theStations[j-1];
				}
				$scope.theStations[i+1] = $scope.theAddSta;
			}
		}
	};

	/**
	 * 隐藏该页面下所有的panel
	 * @return {[type]} [description]
	 */
	var hideLevel = function(){
		$('#show-routes').find('.panel').each(function(){
			$(this).hide();
		});
	};

	/**
	 * 展示panel-level01
	 * @return {[type]} [description]
	 */
	$scope.showLevel01 = function(){
		hideLevel();
		$('#panel-level01').show("normal");	

		if($scope.inteMapRoute.length != 0){
			for(var i=0;i<$scope.inteMapRoute.length;i++){
				$scope.inteMapRoute[i].clearResults();
			}
			$scope.inteMapRoute = [];
		}

		showRoutes();
	};

	/**
	 * 展示panel-level02
	 * @return {[type]} [description]
	 */
	$scope.showLevel02 = function(){
		hideLevel();
		$('#panel-level02').show("normal");
		showSearchRoutes();
	};

	/**
	 * 展示panel-level03
	 * @return {[type]} [description]
	 */
	$scope.showLevel03 = function(){
		hideLevel();
		$('#panel-level03').show("normal");
	};

	/**
	 * 展示panel-level04
	 * @return {[type]} [description]
	 */
	$scope.showLevel04 = function(){
		hideLevel();
		$('#panel-level04').show("normal");
	};

	/**
	 * 展示panel-level05
	 * @return {[type]} [description]
	 */
	$scope.showLevel05 = function(){
		hideLevel();
		$('#panel-level05').show("normal");
	};

	/**
	 * 展示panel-level06
	 * @return {[type]} [description]
	 */
	$scope.showLevel06 = function(){
		hideLevel();
		$('#panel-level06').show("normal");
	};

	$scope.showLevel07 = function(){
		hideLevel();
		$('#panel-level07').show("normal");
		clearMapRoutes();
	};

	$scope.showLevel08 = function(){
		hideLevel();
		$('#panel-level08').show("normal");
	};
});


factoryVehicle.controller('affairsSchedualManager',function($scope,$http){
	var month = ['','一月,','二月,','三月,','四月,','五月,','六月,','七月,','八月,','九月,','十月,','十一月,','十二月,']	
	var date = '';			//保存格式化后的查询时间
	$scope.date = '2016-08-08';		//保存要查询的时间
	$scope.week = '2016-8-8~2016-8-14';		//保存当前查询的周
	$scope.showTime = [];
	$scope.mon;
	$scope.tue;
	$scope.wed;
	$scope.thu;
	$scope.fri;
	$scope.sat;
	$scope.sun;

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		getArrange('2016-08-08');
	});

	$scope.lastWeek = function(){
		getArrange('2016-08-08');
	}

	/*
	获取用户要查询的日期
	 */
	$scope.getDate = function(){
		setTimeout(function(){
			console.log($scope.date);
			translateDate();
		},4000);
	};

	/*
	转化日期格式
	 */
	var translateDate = function(){
		var dateArr = $scope.date.split(' ');
		var m = month.indexOf(dateArr[1]);
		var dateStr = ''+dateArr[2]+'-'+m+'-'+dateArr[0];
		console.log(dateStr);
		setWeek(dateStr);
	}

	/**
	 * 更改当前周
	 * @param {[type]} str [description]
	 */
	var setWeek = function(str){
		var firstday = '';
		var lastday = '';
		var time = new Date(str);
		var w = time.getDay();
		if(w == 0){
			lastday = str;
			var first = new Date();
			first.setTime(time.getTime()-6*24*60*60*1000);
			var m = first.getMonth();
			firstday = ''+first.getFullYear()+'-'+(++m)+'-'+first.getDate();
		}else{
			w--;
			var first = new Date();
			var last = new Date();
			first.setTime(time.getTime()-w*24*60*60*1000);
			last.setTime(time.getTime()+(6-w)*24*60*60*1000);
			var m1 = first.getMonth();
			var m2 = last.getMonth();
			firstday = ''+first.getFullYear()+'-'+(++m1)+'-'+first.getDate();
			lastday = ''+last.getFullYear()+'-'+(++m2)+'-'+last.getDate();
		}

		$scope.week = firstday+'~'+lastday;
		$scope.$apply();
		getArrange(firstday);
		// console.log($scope.week);
	}

	/**
	 * 获取排版数据
	 * @return {[type]} [description]
	 */
	var getArrange = function(date){
		var url = '/factory_vehicle/api/arrange?date='+date;

		$http.get(url).success(function(data){
			$scope.showTime = [];
			for(var i=0;i<data.length;i++){
				$scope.showTime.push(data[i].date);
			}
			$scope.mon = data[0].ag;
			$scope.tue = data[1].ag;
			$scope.wed = data[2].ag;
			$scope.thu = data[3].ag;
			$scope.fri = data[4].ag;
			$scope.sat = data[5].ag;				
			$scope.sun = data[6].ag;

		}).error(function(){
			console.log('获取排班信息出错');
		});
	}

});


factoryVehicle.controller('affairsReportManager', function($scope,$http){
	var month = ['','一月,','二月,','三月,','四月,','五月,','六月,','七月,','八月,','九月,','十月,','十一月,','十二月,'];
	$scope.date = '2016-08-01';		//查询日期
	$scope.style = 2;			//查询方式
	$scope.mychart;
	$scope.xAxis;
	$scope.num;

	//页面加载完成执行的函数
	$scope.$watch('$viewContentLoaded',function(){
		initChart();
	});

	$scope.getChartData = function(){
		$scope.mychart.showLoading();
		var date = translateDate();
		// console.log(date,$scope.style);
		var url;
		if($scope.style == 1){
			url = '/factory_vehicle/api/Excel/routeday?day='+date;			
		}else if($scope.style == 2){
			url = '/factory_vehicle/api/Excel/routeweek?day='+date;
		}else if($scope.style == 3){
			url = '/factory_vehicle/api/Excel/routemonth?day='+date;
		}
		// console.log(url);
		$http.get(url).success(function(data){
			// console.log(data,'shaquan');
			$scope.xAxis = data.sname;
			$scope.num = data.count;
			$scope.mychart.hideLoading();
			setOption();
		}).error(function(){
			$scope.mychart.hideLoading();
			console.log('获取报表信息出错');
		});
	};

	/**
	 * 初始化图表
	 * @return {[type]} [description]
	 */
	var initChart = function(){
		var mychart = echarts.init(document.getElementById('body-chart'));
		$scope.mychart = mychart;

		option = {
		    title: {
		        text: '各站点乘车人数图'
		    },
		    tooltip: {
		        trigger: 'axis'
		    },
		    legend: {
		        data:[
		        	{
		        		name: '乘车人数',
		        		icon: 'circle'
		        	}
		        ]
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '8%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {},
		            dataView: {},
		            magicType: {
		            	show: true,
		            	type: ['line', 'bar']
		            }
		        }
		    },
		    dataZoom: [
		    	{
		    		type: 'slider',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0,
		    		bottom: '1%'
		    	},
		    	{
		    		type: 'inside',
		    		start: 0,
		    		end: 100,
		    		xAxisIndex: 0
		    	}
		    ],
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: []
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'乘车人数',
		            type:'line',
		            stack: '总量',
		            data: []
		        }
		    ]
		}
		
		$scope.mychart.setOption(option);

		$scope.mychart.showLoading();

		var url = '/factory_vehicle/api/Excel/routeweek?day=2016-08-01';
		$http.get(url).success(function(data){
			$scope.xAxis = data.sname;
			$scope.num = data.count;
			$scope.mychart.hideLoading();
			setOption();
		}).error(function(){
			console.log('初始化报表出错');
		});

	}

	var setOption = function(){
		var option = {
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: $scope.xAxis
			},
			series: [
				{
					name: '乘车人数',
					type: 'line',
					stack: '总量',
					data: $scope.num
				}
			]
		};

		$scope.mychart.setOption(option);
	}

	/**
	 * 日期格式转化
	 * @return {[type]} [description]
	 */
	var translateDate = function(){
		var dateArr = $scope.date.split(' ');
		var m = month.indexOf(dateArr[1]);
		var dateStr = ''+dateArr[2]+'-'+m+'-'+dateArr[0];
		return dateStr;
	}

	/**
	 * 创建图表
	 * @return {[type]} [description]
	 */
	var createChart = function(){
		var mychart = echarts.init(document.getElementById('body-chart'));

		option = {
		    title: {
		        text: '折线图堆叠'
		    },
		    tooltip: {
		        trigger: 'axis'
		    },
		    legend: {
		        data:['邮件营销','联盟广告','视频广告','直接访问','搜索引擎']
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    toolbox: {
		        feature: {
		            saveAsImage: {}
		        }
		    },
		    xAxis: {
		        type: 'category',
		        boundaryGap: false,
		        data: ['周一','周二','周三','周四','周五','周六','周日']
		    },
		    yAxis: {
		        type: 'value'
		    },
		    series: [
		        {
		            name:'邮件营销',
		            type:'line',
		            stack: '总量',
		            data:[120, 132, 101, 134, 90, 230, 210]
		        },
		        {
		            name:'联盟广告',
		            type:'line',
		            stack: '总量',
		            data:[220, 182, 191, 234, 290, 330, 310]
		        },
		        {
		            name:'视频广告',
		            type:'line',
		            stack: '总量',
		            data:[150, 232, 201, 154, 190, 330, 410]
		        },
		        {
		            name:'直接访问',
		            type:'line',
		            stack: '总量',
		            data:[320, 332, 301, 334, 390, 330, 320]
		        },
		        {
		            name:'搜索引擎',
		            type:'line',
		            stack: '总量',
		            data:[820, 932, 901, 934, 1290, 1330, 1320]
		        }
		    ]
		}
		mychart.setOption(option);

	};
});