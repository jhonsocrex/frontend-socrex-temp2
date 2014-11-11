var socrexControllers = angular.module('socrex.controllers', []);
var dataCollection = []

filters={}

socrexControllers.controller('listCtrl', ['$scope' , '$http', '$location', '$rootScope', '$routeParams' ,
    function($scope,$http, $location,$rootScope, $routeParams) {
        
        $scope.directives3 = [];
        
        $scope.addPictureToSlider = function(pictureUrl) {
            var directive = '<li><img src="'+pictureUrl+'" /></li>';
            $scope.directives3.push(directive);
        }
        
        $scope.addPictureArrayToSlider = function(pictureUrlArray) {
            for (var i = 0; i < pictureUrlArray.length; i++) {
                $scope.addPictureToSlider(pictureUrlArray[i]);
            }
        }
        
        $scope.getDetailedListing = function(listingId) {
            // dummy filters
    		//var listingId = '542c3f86b43c2c00029a8211';
    		    
            var responsePromise = $http({
    		    //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/listings/' + listingId,
                method: 'GET',
    		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
    
            responsePromise.success(function(data, status, headers, config) {
                $rootScope.selectedListing = data.Data;
                // add pictures to slider
                $scope.addPictureArrayToSlider($rootScope.selectedListing.pictures);
                // reload slider styles
                $scope.$broadcast('reload-slider')
            });
                
            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });
        }
        
        $scope.onClickOriginalListingButton = function(){
            $scope.openOriginalListingTab();
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"originallisting");
        }
        
        $scope.onClickContact = function(){
            angular.element('#contactdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"sendemail");
        }

        $scope.onClickInterested = function(){
            if (typeof($rootScope.userId) === 'undefined' || $rootScope.userId == "") {
                angular.element('#provide_email_dialog').dialog( "open" );
            } else {
                angular.element('#workingdialog').dialog( "open" );
                $scope.sendEmailConcierge($routeParams.listingId,$rootScope.userId, $rootScope.fullName, $rootScope.userPhone);
            }
        }

        $scope.onSubmitConcierge = function(user){

            $rootScope.fullName = user.fullname;
            $rootScope.userId = user.email;
            $rootScope.userPhone = user.phone;
            $scope.sendEmailConcierge($routeParams.listingId,$rootScope.userId, $rootScope.fullName, $rootScope.userPhone);
            angular.element('#provide_email_dialog').dialog( "close" );
            angular.element('#workingdialog').dialog( "open" );
            
        }

        
        $scope.onClickVerifyAvailability = function(){
            angular.element('#verifyavailabilitydialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"verifyavailability");
        }
        
        $scope.onClickExpertReview = function(){
            angular.element('#expertreviewdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"expertreview");
        }
        
        $scope.onClickTour = function(){
            angular.element('#tourdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"virtualtour");
        }
        
        $scope.openOriginalListingTab = function(){
            window.open($rootScope.selectedListing.url,'_blank');
        }
        
        $scope.redirecToListingList = function(){
            $location.path( "/listings/filter/"+$rootScope.currentListingFilter, false );
        }
        
        $scope.validateSelectedListing = function(){
            // always call listing detail from server to get images
            //if($rootScope.selectedListing == null){
                $scope.getDetailedListing($routeParams.listingId)
            //}
        }
        
        $scope.saveClickOnDB = function(listingid,useremail, option) {
            // dummy filters
    		//var listingId = '542c3f86b43c2c00029a8211';
            url = ""

            if (typeof(useremail) === 'undefined' || useremail == "") {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/'+option;
            } else {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/user/'+useremail+'/'+option;
            }
    		    
            var responsePromise = $http({
    		    //url: 'http://127.0.0.1:5000/listings/filter', 
                url: url,
                method: 'POST',
    		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }

        $scope.sendEmailConcierge = function(listingid, useremail, username, userphone) {
            // dummy filters
            //var listingId = '542c3f86b43c2c00029a8211';
            listing_url = $rootScope.selectedListing.url
                
            var responsePromise = $http({
                //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/conciergeEmail',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    email: useremail,
                    name: username,
                    phone: userphone,
                    listingurl: listing_url,
                    listingid: listingid
                }
            });
            console.log(responsePromise)
        }
        
        $scope.validateSelectedListing();
        
    }
]);

socrexControllers.controller('listCtrl2', ['$scope' , '$http', '$location', '$rootScope', '$routeParams',
    function($scope,$http,$location, $rootScope, $routeParams) {
        
        $rootScope.selectedListingCity = {};
        
        $scope.filterId = $routeParams.filterId;
        
        $scope.isTableVisibleFlag = false;
        
        $scope.isLoadingListingsFlag = true;
        
        $scope.noListingFoundFlag = false;
        
        $scope.unexpectedErrorFlag = false;
        
        $scope.rows = [];
        
        $scope.rows2 = [];
        
        $rootScope.selectedListing = null;
                       
        $scope.temp = false;
        
        $scope.totalPages = 0;
        
        $scope.totalListings = 0;
        
        $rootScope.reloadMap = false;
        
        $rootScope.currentListedListings = [];
        
        
        
        $scope.hideTable = function(){
            $scope.rows2.length = 0;
            $scope.updateIsTableVisibleFlag(false);
        }
        
        $scope.showTable = function(){
            $scope.updateIsTableVisibleFlag(true);
            $scope.updateLoadingListingsFlag(false);
            $scope.updateNoListingFoundFlag(false);
        }

        
        $scope.updateIsTableVisibleFlag = function(value){
            $scope.isTableVisibleFlag = value;
        }
        
        $scope.updateLoadingListingsFlag = function(value){
            $scope.isLoadingListingsFlag = value;
        }
        
        $scope.updateNoListingFoundFlag = function(value){
            $scope.noListingFoundFlag = value;
        }
        
        $scope.updateUnexpectedErrorFlag = function(value){
            $scope.unexpectedErrorFlag = value;
        }
        
        
        
        
        $scope.initRating = function(){
            
        }
    
        $scope.addRow = function(){
            $scope.temp = false;
            $scope.addName="";
        };
    
        $scope.deleteRow = function(row){
            $scope.rows.splice($scope.rows.indexOf(row),1);
        };
    
        $scope.plural = function (tab){
            return tab > 1 ? 's': ''; 
        };
    
        $scope.addTemp = function(){
            if($scope.temp) $scope.rows.pop(); 
            else if($scope.addName) $scope.temp = true;
        
            if($scope.addName) $scope.rows.push($scope.addName);
            else $scope.temp = false;
        };
        
        $scope.isTemp = function(i){
            return i==$scope.rows.length-1 && $scope.temp;
        };
        
        $scope.clickedPaginationButton = function(pageNumber) {
            
            $scope.filterListings(pageNumber,10);
            
            /*
    		$scope.saveClickOnDB(listingId,$rootScope.userId ,"listingdetails")
    		    
            var responsePromise = $http({
    		    //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/listings/' + listingId,
                method: 'GET',
    		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
    
            responsePromise.success(function(data, status, headers, config) {
                //$scope.rows2 = data.Data;
                $rootScope.selectedListing = data.Data;
                //$rootScope.selectedListing['price'] = 3000;
                $scope.redirecToListingDetail();
            });
                
            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });*/
        }
        
        
        
        $scope.onTableRowHover = function(id) {
            //console.log("onTableRowHover");
            
            var coordPoint = {'id' : id}
            $rootScope.selectedListingCity = coordPoint;
            
        }
        
        $scope.getDetailedListing = function(listingId) {
            // dummy filters
    		//var listingId = '542c3f86b43c2c00029a8211';
    		//$scope.saveClickOnDB(listingId,$rootScope.userId ,"listingdetails")
    		    
            var responsePromise = $http({
    		    //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/listings/' + listingId,
                method: 'GET',
    		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
    
            responsePromise.success(function(data, status, headers, config) {
                //$scope.rows2 = data.Data;
                $rootScope.selectedListing = data.Data;
                //$rootScope.selectedListing['price'] = 3000;
                $scope.redirecToListingDetail();
            });
                
            responsePromise.error(function(data, status, headers, config) {
                $scope.updateLoadingListingsFlag(false);
                $scope.updateUnexpectedErrorFlag(true);
            });
        }
        
        $scope.redirecToListingDetail = function(){
            $location.path( "/listing/" + $rootScope.selectedListing._id.$oid, false );
        }
        
        // when the filter listings request fails, this method is added in the requestobject on the error attribute
        $scope.onErrorFilterListings = function(data, status, headers, config) {
            $scope.errorFilterListings();
        }
        
        $scope.errorFilterListings = function() {
            $scope.updateLoadingListingsFlag(false);
            $scope.updateUnexpectedErrorFlag(true);
        }
        
        // when the filter listings request succeeded, this method is added in the requestobject on the success attribute
        $scope.onSuccessFilterListings = function(data, status, headers, config) {
            if(data.IsValid === true)
            { 
                if(data.Data.Listings.length > 0){
                    $rootScope.currentListingFilter = $scope.filterId;
                    $rootScope.currentListedListings = data.Data.Listings;
                    $scope.rows2 = data.Data.Listings;
                    //$rootScope.userId = data.Data.Email
                    $scope.showTable();
                    
                    if($scope.totalPages != data.Data.TotalPages){
                        $scope.totalPages = data.Data.TotalPages;
                        //$scope.totalPages = 6;
                    }
                        
                    if($scope.totalListings != data.Data.Total){
                        $scope.totalListings = data.Data.Total;
                    }
                        
                    $rootScope.reloadMap = true;
                    
                }else{
                    $scope.updateLoadingListingsFlag(false);
                    $scope.updateNoListingFoundFlag(true);
                }
            } else {
                $scope.errorFilterListings();
            }
        };
        
        $scope.filterListings = function(currentPage, numberOfItems) {
		    // dummy filters
            // must be bery carefull with the filters value structure, it has to start with single couotes, and de inner quotes be double
            // otherwise there would be an error in python decoding  
		    //var filters = {'filters':'{"bedroom":2}'};
		    var filters = {'id':$scope.filterId, 'currentPage' : currentPage , 'itemsOnPage': numberOfItems };
		    // clean current listing list
		    $scope.hideTable();
		    $scope.updateLoadingListingsFlag(true);
		    // do call to server to retrieve listings list
            var responsePromise = $http({
		        //url: 'http://127.0.0.1:5000/listings/filter', 
		        //url: 'http://byopapp-api-stage-c9-jhonjairoroa877.c9.io/listings/filter',
                url: 'http://byopapp-api-stage.herokuapp.com/listings/filter',
                method: 'POST',
		        data: $.param(filters),
		        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
            // added methods when call succeeds or fails
            responsePromise.success($scope.onSuccessFilterListings);
            responsePromise.error($scope.onErrorFilterListings);
        }
        
        // from here: http://stackoverflow.com/questions/1527803/generating-random-numbers-in-javascript-in-a-specific-range
        $scope.getRandomInt = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        $scope.setRandomStarRating = function(listingsArray){
            for (var i = 0; i < listingsArray.length; i++) {
                listingsArray[i].relevance = $scope.getRandomInt(0,20);
            }
        }
        
        $scope.init = function(){
            // Do the first call to server
            $scope.filterListings(1,10);
            // init rating 
            $scope.initRating();
        }
        
        $scope.saveClickOnDB = function(listingid,useremail, option) {
            // dummy filters
    		//var listingId = '542c3f86b43c2c00029a8211';
            url = ""
            if (typeof(useremail) === 'undefined' || useremail == "") {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/'+option;
            } else {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/user/'+useremail+'/'+option;
            }
    		    
            var responsePromise = $http({
    		    //url: 'http://127.0.0.1:5000/listings/filter', 
                url: url,
                method: 'POST',
    		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }
        
        $scope.init();
        
    }
]);

socrexControllers.controller('MapCtrl', ['$scope' , '$rootScope', function ($scope, $rootScope) {

    $scope.isReadyMapFlag = false;
    $scope.loadingMapFlag = true;
    $scope.normalIcon = null;
    $scope.selectedIcon = null;
    $scope.latlngList = [];
    $scope.bounds = new google.maps.LatLngBounds();
    
    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(42.3432, -71.082866),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    
    
    $rootScope.$watch( 'reloadMap',
        function(newValue, oldValue){
            $scope.refreshMap();
            $rootScope.reloadMap = false;   
            /*
            if(oldValue == false && newValue == true){
                google.maps.event.trigger($scope.map, 'resize');
                $rootScope.reloadMap = false;    
            }*/
            
        }
    );
    
    $rootScope.$watch( 'selectedListingCity',
        function(newValue, oldValue){
            if('id' in newValue){
                //console.log(newValue);
                //console.log(oldValue);
                
                for (var i = 0; i < $scope.markers.length; i++) {
                    var currentMarker = $scope.markers[i]['marker']
                    if($scope.normalIcon == null){
                        $scope.normalIcon = currentMarker.getIcon();
                    }
                    
                    if($scope.markers[i]['listingId'] == newValue['id']){
                        currentMarker.setAnimation(google.maps.Animation.BOUNCE);
                    }else{
                        currentMarker.setAnimation(null);
                    }
                }
            }
        }
    );
    
    $rootScope.$watch( 'currentListedListings',
        function(newValue, oldValue){
             $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
            
             google.maps.event.addListenerOnce($scope.map, 'tilesloaded', function(){
                $scope.isReadyMapFlag = true;
                $scope.loadingMapFlag = false;
                $scope.refreshMap();
                // do something only the first time the map is loaded
            });
            
            
            
            $scope.deleteMarkers();
            $scope.latlngList.length = 0;
            $scope.bounds = new google.maps.LatLngBounds();
            
            for (var i = 0; i < $rootScope.currentListedListings.length; i++) {
                
                var newPoint = { 'id': $rootScope.currentListedListings[i]._id.$oid, 'latitude' : $rootScope.currentListedListings[i].latitude , 'longitude': $rootScope.currentListedListings[i].longitude};
                var newGoogleMapsPoint = new google.maps.LatLng($rootScope.currentListedListings[i].latitude,$rootScope.currentListedListings[i].longitude);
                $scope.latlngList.push(newGoogleMapsPoint);
                $scope.bounds.extend(newGoogleMapsPoint);
                $scope.createMarker(newPoint);    
            }
            
            /*
            $scope.bounds = new google.maps.LatLngBounds();
            
            for (var i = 0; i < $scope.latlngList.length; i++) {
                $scope.bounds.extend($scope.latlngList[i]);
            }*/
            
            // TODO: center de map once all the markers are identifyed
            var boundsCenter = $scope.bounds.getCenter();
            $scope.centerPoint = boundsCenter;
            //var newCenter = new google.maps.LatLng(42.3432, -71.082866);
            
            //$scope.map.setCenter(newCenter); //or use custom center
            //$scope.map.panTo(newCenter); //or use custom center
            
            //$scope.refreshMap();
            
            /*
            if('latitude' in newValue){
                //console.log(newValue);
                //console.log(oldValue);
            
                var newPoint = new google.maps.LatLng(newValue.latitude,newValue.longitude);
            
                $scope.clearMarkers();
                $scope.createMarker(newValue);
                //$scope.map.setCenter(newPoint);
                // with animation
                $scope.map.panTo(newPoint);
            }else{
                google.maps.event.trigger($scope.map, 'resize');
            }*/
        }
    );

    
    
   

    $scope.markers = [];
    
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    var infoWindow = new google.maps.InfoWindow();
    
    $scope.createMarker = function (info){
        
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.latitude, info.longitude),
            title: info.city
        });
        
        //marker.content = '<div class="infoWindowContent">' + info.desc + '</div>';
        
        /*
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
            infoWindow.open($scope.map, marker);
        });*/
        
        //$scope.markers.push(marker);
        $scope.markers.push({'listingId':info.id , 'marker':marker});
        
    }  

    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
    
    // Sets the map on all markers in the array.
    $scope.setAllMap = function setAllMap(map) {
      for (var i = 0; i < $scope.markers.length; i++) {
        $scope.markers[i]['marker'].setMap(map);
      }
    }
    
    // Removes the markers from the array
    $scope.clearMarkersArray = function () {
      $scope.markers.length = 0;
    }

    // Removes the markers from the map, but keeps them in the array.
    $scope.clearMarkers = function () {
      $scope.setAllMap(null);
    }
    
    // Shows any markers currently in the array.
    $scope.showMarkers = function () {
      $scope.setAllMap(map);
    }
    
    // Deletes all markers in the array by removing references to them.
    $scope.deleteMarkers = function() {
      $scope.clearMarkers();
      $scope.markers = [];
    }
    
    // this is because the google api bug: http://stackoverflow.com/questions/15748374/assistance-needed-map-does-not-load-properly-in-jquery-ui-tabs-not-a-duplica    
    $scope.refreshMap = function(){
        //var newCenter = new google.maps.LatLng(42.3432, -71.082866);
        var newCenter = $scope.centerPoint;
        $scope.map.setCenter(newCenter); //or use custom center
        google.maps.event.trigger($scope.map, 'resize'); 
    }

}]);

socrexControllers.controller('preferencesFormController', ['$scope' , '$rootScope' , '$http' , '$location', function ($scope, $rootScope, $http , $location) {

    // zero based index
  this.showQuestionIndex = 0;
  // array of questions
  this.questionsArray = ['One','Two'];
  
  this.userPreferences = {};
  
  this.archetype = {};
  
  this.hoodExpectSelectedOptions = [];
  
  this.onClickHoodExpectOption = function(checkBoxElement){
      console.log("onClickHoodExpectOption");
      console.log("checkBoxElement");
      console.log(checkBoxElement);
      console.log("checkBoxElement.checked");
      console.log(checkBoxElement.checked);
  }
  
  this.isShownQuestionNumber = function(questionNumber){
      var returnValue = false;
      
      if (this.questionsArray[this.showQuestionIndex] === questionNumber){
          returnValue = true;
      }
      
      return returnValue;
  }
  
  this.onClickNextButton = function(){
      this.increaseShowQuestionIndex();
  }
  
  this.onClickPreviousButton = function(){
      this.decreaseShowQuestionIndex();
  }
  
  this.increaseShowQuestionIndex = function(){
      if(this.validateIncreaseShowQuestionIndex()){
          this.showQuestionIndex++;
      }
  }
  
  this.decreaseShowQuestionIndex = function(){
      if(this.validateDecreaseShowQuestionIndex()){
          this.showQuestionIndex--;
      }
  }
  
  this.validateIncreaseShowQuestionIndex = function(){
      var returnValue = false;
      if(this.showQuestionIndex < this.questionsArray.length - 1){
          returnValue = true;
      }
      return returnValue;
  }
  
  this.validateDecreaseShowQuestionIndex = function(){
      var returnValue = false;
      if(this.showQuestionIndex > 0){
          returnValue = true;
      }
      return returnValue;
  }
  
  this.addAttributesOfArchetype1 = function(objectToModify){
      // for hood
      objectToModify['Near_action'] = true;
      objectToModify['Locales_good'] = true;
      objectToModify['Parks'] = true;
      objectToModify['Modern'] = true;
      objectToModify['Easy_transport'] = true;
      // for unit
      objectToModify['modern'] = true;
      objectToModify['loft'] = true;
       // person type
      //objectToModify['Student_vibe'] = true; 
  }
  
  
  this.addAttributesOfArchetype2 = function(objectToModify){
      // for hood
      objectToModify['Near_action'] = true;
      objectToModify['Easy_transport'] = true;
      objectToModify['Classic'] = true; 
      // for unit
      objectToModify['maintaned'] = true; 
      objectToModify['lighting'] = true;
      objectToModify['hardwood'] = true; 
      objectToModify['laundry'] = true;
      objectToModify['maintaned'] = true;
      objectToModify['classic'] = true; 
       // person type
      //objectToModify['Young_pro'] = true; 
  }
  
  this.addAttributesOfArchetype3 = function(objectToModify){
      // for hood
      objectToModify['Quiet'] = true;
      // for unit
      objectToModify['deck_balcony'] = true;
      objectToModify['cieling'] = true; 
      objectToModify['kitchen'] = true; 
      objectToModify['ameneties'] = true; 
      objectToModify['deck_balcony'] = true; 
      // person type
      //objectToModify['Family'] = true; 
  }
  
  this.addAttributesOfArchetype4 = function(objectToModify){
      objectToModify['Parking'] = true;
      objectToModify['Student_vibe'] = true;
  }
  
  this.addAttributesOfArchetype5 = function(objectToModify){
      objectToModify['Near_action'] = true;
      objectToModify['Locales_good'] = true;
  }
  
  this.addAttributesOfArchetype6 = function(objectToModify){
      objectToModify['Safe'] = true;
      objectToModify['Parks'] = true;
  }
  
  this.onSubmitFirstPage = function(){
      console.log("onSubmitFirstPage");
      switch(this.archetype){
          case 'sublet_roomate':
            this.addAttributesOfArchetype1(this.userPreferences);    
            break;
          case 'studio':
            this.addAttributesOfArchetype2(this.userPreferences);    
            break;
          case '1bed':
            this.addAttributesOfArchetype3(this.userPreferences);    
            break;
          case '2bed':
            this.addAttributesOfArchetype4(this.userPreferences);    
            break;
          case '3bed':
            this.addAttributesOfArchetype5(this.userPreferences);    
            break;
          case '4bed':
            this.addAttributesOfArchetype6(this.userPreferences);    
            break;
      }
      
      //console.log("this.userPreferences.budget");
      //console.log(this.userPreferences.budget);
      console.log("userPreferences");
      console.log(this.userPreferences);
      this.onClickNextButton();
  }
  
  this.saveUserPreferences = function(){
		    // do call to server to save preferences
            var responsePromise = $http({
		        //url: 'http://127.0.0.1:5000/listings/filter', 
		        //url: 'http://byopapp-api-stage-c9-jhonjairoroa877.c9.io/userpreferences',
                url: 'http://byopapp-api-stage.herokuapp.com/userpreferences',
                method: 'POST',
		        data: $.param(this.userPreferences),
		        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            responsePromise.success(function(data, status, headers, config) {
                console.log("Succeeded response");
                $scope.redirecToListingList(data.Data.PreferenceId.$oid);
            });
            
            responsePromise.error(function(data, status, headers, config) {
                console.log("Succeeded response");
            }); 
  }
  /*
  this.onSubmitSecondPage = function(){
      console.log("onSubmitSecondPage");
      console.log("#### HOOD Expected:");
      console.log("this.userPreferences.Near_action");
      console.log(this.userPreferences.Near_action);
      console.log("this.userPreferences.Safe");
      console.log(this.userPreferences.Safe);
      console.log("userPreferences.Easy_transport");
      console.log(this.userPreferences.Easy_transport);
      console.log("userPreferences.Parking");
      console.log(this.userPreferences.Parking);
      console.log("#### HOOD Love:");
      console.log("this.userPreferences.Locales_good");
      console.log(this.userPreferences.Locales_good);
      console.log("this.userPreferences.Parks");
      console.log(this.userPreferences.Parks);
      console.log("userPreferences.Family");
      console.log(this.userPreferences.Family);
      console.log("userPreferences.Student_vibe");
      console.log(this.userPreferences.Student_vibe);
      console.log("this.userPreferences.Young_pro");
      console.log(this.userPreferences.Young_pro);
      console.log("this.userPreferences.Quiet");
      console.log(this.userPreferences.Quiet);
      console.log("userPreferences.Classic");
      console.log(this.userPreferences.Classic);
      console.log("userPreferences.Modern");
      console.log(this.userPreferences.Modern);
      
  
      this.onClickNextButton();
  }*/
  
  this.onSubmitThirdPage = function(){
      console.log("onSubmitThirdPage");
      console.log("UNIT LOVE");
      console.log("this.userPreferences.pet");
      console.log(this.userPreferences.pet);
      /*
      console.log("this.userPreferences.spacingUnitLove");
      console.log(this.userPreferences.spacingUnitLove);
      console.log("this.userPreferences.lightingUnitLove");
      console.log(this.userPreferences.lightingUnitLove);
      */
      console.log("this.userPreferences.spacing");
      console.log(this.userPreferences.spacing);
      console.log("this.userPreferences.lighting");
      console.log(this.userPreferences.lighting);
      
      console.log("this.userPreferences.maintaned");
      console.log(this.userPreferences.maintaned);
      console.log("this.userPreferences.parking");
      console.log(this.userPreferences.parking);
      
      console.log("UNIT EXPECT");
      console.log("this.userPreferences.hardwood");
      console.log(this.userPreferences.hardwood);
      console.log("this.userPreferences.laundry");
      console.log(this.userPreferences.laundry);
      /*
      console.log("this.userPreferences.lightingUnitExpect");
      console.log(this.userPreferences.lightingUnitExpect);
      */
      console.log("this.userPreferences.deck_balcony");
      console.log(this.userPreferences.deck_balcony);
      console.log("this.userPreferences.cieling");
      console.log(this.userPreferences.cieling);
      console.log("this.userPreferences.kitchen");
      console.log(this.userPreferences.kitchen);
      /*
      console.log("this.userPreferences.spacingUnitExpect");
      console.log(this.userPreferences.spacingUnitExpect);
      */
      console.log("this.userPreferences.ameneties");
      console.log(this.userPreferences.ameneties);
      console.log("this.userPreferences.view");
      console.log(this.userPreferences.view);
      console.log("this.userPreferences.modern");
      console.log(this.userPreferences.modern);
      console.log("this.userPreferences.classic");
      console.log(this.userPreferences.classic);
      console.log("this.userPreferences.loft");
      console.log(this.userPreferences.loft);
      
      /*
      console.log("this.userPreferences.desiredComute");
      console.log(this.userPreferences.desiredComute);
      console.log("this.userPreferences.Walking");
      console.log(this.userPreferences.Walking);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.Biking);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.Driving);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.PublicTransi);*/
      
      this.onClickNextButton();
  }
  
  this.onSubmitSecondPage = function(){
      console.log("onSubmitFourthPage");
      console.log("this.userPreferences.firstname");
      console.log(this.userPreferences.firstname);
      console.log("this.userPreferences.lastname");
      console.log(this.userPreferences.lastname);
      console.log("this.userPreferences.gender");
      console.log(this.userPreferences.gender);
      console.log("this.userPreferences.email");
      console.log(this.userPreferences.email);
      console.log("this.userPreferences.budget");
      console.log(this.userPreferences.budget);
      console.log("this.userPreferences.move_reason");
      console.log(this.userPreferences.move_reason);
      console.log("this.userPreferences.moveinoriginal");
      console.log(this.userPreferences.movein);
      this.userPreferences.movein = this.userPreferences.movein.split("-").join("");
      console.log("this.userPreferences.moveinreplaced");
      console.log(this.userPreferences.movein);
      console.log("this.userPreferences.importance");
      console.log(this.userPreferences.importance);
      console.log("this.userPreferences.wherecommuting");
      console.log(this.userPreferences.wherecommuting);
      console.log("this.userPreferences.transportation");
      console.log(this.userPreferences.transportation);
      
      this.saveUserPreferences();
      
      /*
      console.log("this.userPreferences.desiredComute");
      console.log(this.userPreferences.desiredComute);
      console.log("this.userPreferences.Walking");
      console.log(this.userPreferences.Walking);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.Biking);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.Driving);
      console.log("userPreferences.Biking");
      console.log(this.userPreferences.PublicTransi);*/
      
  }
  
  $scope.redirecToListingList = function(filterId){
            $location.path( "/listings/filter/" + filterId);   
        }
  
  /*
  preferencesFormCtrl.userPreferences.desiredComute
  
  Walking 
Biking 
Driving 
Public Transit*/

}]);

socrexControllers.controller('landingQuestionsController', ['$scope' , '$rootScope' , '$http' , '$location', function($scope, $rootScope, $http , $location) {
$(document).ready(function() {
  var form = new Form(), general = new generalEvents(), change = new Change(), collect = new dataCollect(),
  ph = form.placeholders(), g = general.selectedType(), c = change.change(), data = collect.collect();

  userPreferences = {}

  function Form() {
    this.placeholders = function() {
      $('input').on('focus', function() {
        var val = $(this).val();
        switch (val) {
          case '$ enter amount':
            $(this).val('$');
            break;
          default:
            $(this).val();
            break;
        }
      });
      $('input').on('blur', function() {
        var val = $(this).val();
        switch (val) {
          case '':
            $(this).val('$ enter amount');
            break;
          default:
            $(this).val();
            break;
        }
      });
    }
  }
  
  function generalEvents() {
    this.selectedType = function() {
      $('.size').click(function(e) {
        e.preventDefault();
        $('.size').removeClass('selected-type');
        $(this).toggleClass('selected-type');
        figA = $(this).text().trim();
        console.log(figA)
      });
      $('.space-type').click(function() {
        $('.space-type').removeClass('selected-type');
        $(this).toggleClass('selected-type');
        figB = $(this).next().html().trim();
        console.log(figB)
      });
      $('.pro-type').click(function() {
        $('.pro-type').removeClass('selected-type');
        $(this).toggleClass('selected-type');
        figC = $(this).next().html().trim();
        console.log(figC)
      });
    }
  }
  
  function Change() {
    this.change = function() {
      $('.amount').on("keyup", function() {
        var pattern = /[^-0-9|$]/g, value = $(this).val(), sanitize = value.replace(pattern, '');
        sanitize = sanitize.replace(/(.)-/, '$1');
        $(this).val(sanitize);
      });
    }
  }
  
  function dataCollect() {
    this.collect = function() {
      $('.controls .btn').on("click", function() {

        switch (figA){
            case 'Room or Sublet':
                userPreferences['sublet_roomate'] = true;
                break;
            case 'Studio':
                userPreferences['studio'] = true;
                break;
            case 'One Bedroom':
                userPreferences['1bed'] = true;
                break;
            case 'Two Bedroom':
                userPreferences['2bed'] = true;
                break;
        }

        switch (figB){
            case 'Modern and Bustling':
                userPreferences['Near_action'] = true
                userPreferences['Locales_good'] = true
                userPreferences['Parks'] = true
                userPreferences['Modern'] = true
                userPreferences['Easy_transport'] = true

                userPreferences['modern'] = true
                userPreferences['loft'] = true
                break;
            case 'Classic Boston':
                userPreferences['Near_action'] = true
                userPreferences['Easy_transport'] = true
                userPreferences['Classic'] = true

                userPreferences['lighting'] = true
                userPreferences['hardwood'] = true
                userPreferences['laundry'] = true
                userPreferences['classic'] = true
                break;
            case 'Chill Burbs':
                userPreferences['Quiet'] = true;

                userPreferences['deck_balcony'] = true;
                userPreferences['cieling'] = true;
                userPreferences['kitchen'] = true;
                userPreferences['ameneties'] = true;
                break;
        }

        switch (figC){
            case 'Student':
                userPreferences['Parking'] = true
                userPreferences['Student_vibe'] = true
                break;
            case 'Professional':
                userPreferences['Near_action'] = true
                userPreferences['Locales_good'] = true
                break;
            case 'Family':
                userPreferences['Safe'] = true;
                userPreferences['Parks'] = true;
                break;
        }

        userPreferences['budget'] = $('.budget').val()
        movein = $('.movein').val()
        userPreferences['movein'] = movein.split("-").join("");

        saveUserPreferences();
      });
    }
  }

  saveUserPreferences = function(){
    // do call to server to save preferences
    var responsePromise = $http({
        //url: 'http://127.0.0.1:5000/listings/filter', 
        //url: 'http://byopapp-api-stage-c9-jhonjairoroa877.c9.io/userpreferences',
        url: 'http://byopapp-api-stage.herokuapp.com/userpreferences',
        method: 'POST',
        data: $.param(userPreferences),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });

    responsePromise.success(function(data, status, headers, config) {
        console.log("Succeeded response");
        $scope.redirecToListingList(data.Data.PreferenceId.$oid);
    });
    
    responsePromise.error(function(data, status, headers, config) {
        console.log("Succeeded response");
    }); 
  }

  $scope.redirecToListingList = function(filterId){
            $location.path( "/listings/filter/" + filterId);   
        }

});
  
}]);



// *******************************************************************************
// *******************************************************************************
// *******************************************************************************
// *******************************************************************************
// *******************************************************************************
// *******************************************************************************



socrexControllers.controller('initialFormCtrl', ['$scope' , '$rootScope' , '$http' , '$location', function ($scope, $rootScope, $http, $location) {

    this.initialForm = {};
    $rootScope.prefs = {}


    $scope.onSubmitInitial = function(){
        this.initialForm.movein = this.initialForm.movein.split("-").join("");
        $rootScope.prefs.movein = this.initialForm.movein;
        saveUserPreferences(this.initialForm);
    }

    $scope.toListingList = function(){
        $location.path( "/listings/");   
    }

    saveUserPreferences = function(requestObj){
        // do call to server to save preferences
        var responsePromise = $http({
            //url: 'http://127.0.0.1:5000/listings/filter', 
            url: 'http://byopapp-api-stage.herokuapp.com/userpreferences',
            method: 'POST',
            data: $.param(requestObj),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });

        responsePromise.success(function(data, status, headers, config) {
            console.log("Succeeded response");
            $rootScope.currentListingFilter = data.Data.PreferenceId.$oid;
            $scope.toListingList();
        });
        
        responsePromise.error(function(data, status, headers, config) {
            console.log("Succeeded response - error");
        }); 
    }

}]);



socrexControllers.controller('listingsListCtrl', ['$scope' , '$rootScope' , '$http' , '$location', function ($scope, $rootScope, $http, $location) {

    $scope.showListingsFlag = false;
    $scope.isLoadingListingsFlag = true;
    $scope.noListingFoundFlag = false;
    $scope.unexpectedErrorFlag = false;


    $scope.rooms = [
        {type: "Studio", option: ["studio"]},
        {type: "1 Bedroom", option: ["1bed"]},
        {type: "2 Bedroom", option: ["2bed"]},
        {type: "Room", option: ["room_sublet"]}
    ];

    $scope.persons = [
        {type: "Student", option: ["Parking", "Student_vibe"]},
        {type: "Professional", option: ["Near_action", "Locales_good"]},
        {type: "Family", option: ["Safe", "Parks"]}
    ];

    $scope.hoods = [
        {type: "Classic Boston", option: ["Near_action", "Easy_transport", "Classic", "lighting", "hardwood", "laundry", "classic"]},
        {type: "Modern and Bustling", option: ["Near_action", "Locales_good", "Parks", "Modern", "Easy_transport", "modern", "loft"]},
        {type: "Chill Burbs", option: ["Quiet", "deck_balcony", "cieling","kitchen", "ameneties"]}
    ];

    $scope.onSubmitFilters = function(){

        filters = $scope.filter;
        requestObject = {};

        for (var filter in filters){
            if (filters.hasOwnProperty(filter)){
                filterObj = filters[filter];
                if (typeof(filterObj) != "string"){
                    filtersList = filterObj['option'];
                    for(var i=0; i<filtersList.length; i++){
                        requestObject[filtersList[i]]=true;
                    }
                } else{
                    requestObject["budget"] = parseInt(filterObj);
                }
            }
        }

        requestObject["movein"] = $rootScope.prefs.movein;

        saveUserPreferences(requestObject);

        console.log(requestObject);
        console.log($.param(requestObject));
        console.log($scope.filter);
        console.log($rootScope.prefs);


    }

    $scope.init = function(){
        // Do the first call to server

        $scope.filterId = $rootScope.currentListingFilter
        $scope.filterListings(1,9);
        
        // init rating 
        //$scope.initRating();
    }

     // when the filter listings request fails, this method is added in the requestobject on the error attribute
    $scope.onErrorFilterListings = function(data, status, headers, config) {
        console.log("Error");
        $scope.errorFilterListings();
    }
    
    $scope.errorFilterListings = function() {
        $scope.updateLoadingListingsFlag(false);
        $scope.updateUnexpectedErrorFlag(true);
    }
    
    // when the filter listings request succeeded, this method is added in the requestobject on the success attribute
    $scope.onSuccessFilterListings = function(data, status, headers, config) {
        console.log(data)
        if(data.IsValid === true)
        { 
            if(data.Data.Listings.length > 0){
                $rootScope.currentListingFilter = $scope.filterId;
                $rootScope.currentListedListings = data.Data.Listings;
                console.log(data.Data.Listings);
                $scope.rowdata = data.Data.Listings;
                $scope.showListings();
                
                if($scope.totalPages != data.Data.TotalPages){
                    $scope.totalPages = data.Data.TotalPages;
                }
                    
                if($scope.totalListings != data.Data.Total){
                    $scope.totalListings = data.Data.Total;
                }
                
            }else{
                console.log("0 Listings found");
                $scope.updateLoadingListingsFlag(false);
                $scope.updateNoListingFoundFlag(true);
            }
        } else {
            console.log("Data invalid error");
            $scope.errorFilterListings();
        }
    };
    
    $scope.filterListings = function(currentPage, numberOfItems) {
        console.log($scope.filterId)
        // dummy filters
        // must be very careful with the filters value structure, it has to start with single quotes, and the inner quotes must be double
        // otherwise there would be an error in python decoding  
        //var filters = {'filters':'{"bedroom":2}'};
        var filters = {'id':$scope.filterId, 'currentPage' : currentPage , 'itemsOnPage': numberOfItems };
        // clean current listing list
        $scope.hideListings();
        $scope.updateLoadingListingsFlag(true);
        // do call to server to retrieve listings list
        var responsePromise = $http({
            url: 'http://byopapp-api-stage.herokuapp.com/listings/filter',
            method: 'POST',
            data: $.param(filters),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });
        // added methods when call succeeds or fails
        responsePromise.success($scope.onSuccessFilterListings);
        responsePromise.error($scope.onErrorFilterListings);
    }

    saveUserPreferences = function(requestObj){
        // do call to server to save preferences
        var responsePromise = $http({
            //url: 'http://127.0.0.1:5000/listings/filter', 
            url: 'http://byopapp-api-stage.herokuapp.com/userpreferences',
            method: 'POST',
            data: $.param(requestObj),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });

        responsePromise.success(function(data, status, headers, config) {
            console.log("Succeeded response");
            $scope.filterId = data.Data.PreferenceId.$oid;
            // $scope.reloadListingList(data.Data.PreferenceId.$oid);
            $scope.filterListings(1,6)
        });
        
        responsePromise.error(function(data, status, headers, config) {
            console.log("Succeeded response - error");
        }); 
    }

    $scope.getDetailedListing = function(listingId) {
            
        var responsePromise = $http({
            url: 'http://byopapp-api-stage.herokuapp.com/listings/' + listingId,
            method: 'GET',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        });

        responsePromise.success(function(data, status, headers, config) {
            $rootScope.selectedListing = data.Data;
            $scope.redirecToListingDetail();
        });
            
        responsePromise.error(function(data, status, headers, config) {
            $scope.updateLoadingListingsFlag(false);
            $scope.updateUnexpectedErrorFlag(true);
        });

        return false;
    }

    $scope.redirecToListingDetail = function(){
        $location.path( "/listingDetails/" + $rootScope.selectedListing._id.$oid, false );
    }


    $scope.clickedPaginationButton = function(pageNumber) {
            
        $scope.filterListings(pageNumber,9);

    }

    // Functions for handling showing of elements

    $scope.hideListings = function(){
        //$scope.rowdata.length = 0;
        $scope.updateShowListingsFlag(false);
    }
    
    $scope.showListings = function(){
        $scope.updateShowListingsFlag(true);
        $scope.updateLoadingListingsFlag(false);
        $scope.updateNoListingFoundFlag(false);
    }

    
    $scope.updateShowListingsFlag = function(value){
        $scope.showListingsFlag = value;
    }
    
    $scope.updateLoadingListingsFlag = function(value){
        $scope.isLoadingListingsFlag = value;
    }
    
    $scope.updateNoListingFoundFlag = function(value){
        $scope.noListingFoundFlag = value;
    }
    
    $scope.updateUnexpectedErrorFlag = function(value){
        $scope.unexpectedErrorFlag = value;
    }

    $scope.init();


}]);



socrexControllers.controller('detailsCtrl', ['$scope' , '$http', '$location', '$rootScope', '$routeParams' ,
    function($scope,$http, $location,$rootScope, $routeParams) {
        
        $scope.pictures = []
        
        $scope.getDetailedListing = function(listingId) {
            // dummy filters
            //var listingId = '542c3f86b43c2c00029a8211';
                
            var responsePromise = $http({
                //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/listings/' + listingId,
                method: 'GET',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
    
            responsePromise.success(function(data, status, headers, config) {
                $rootScope.selectedListing = data.Data;
                // add pictures to slider
                $scope.pictures = $rootScope.selectedListing.pictures

                //$scope.addPictureArrayToSlider($rootScope.selectedListing.pictures);
                // reload slider styles
                $scope.$broadcast('reload-slider')
            });
                
            responsePromise.error(function(data, status, headers, config) {
                alert("AJAX failed!");
            });
        }
        
        $scope.onClickOriginalListingButton = function(){
            $scope.openOriginalListingTab();
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"originallisting");
        }
        
        $scope.onClickContact = function(){
            angular.element('#contactdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"sendemail");
        }

        $scope.onClickInterested = function(){
            if (typeof($rootScope.userId) === 'undefined' || $rootScope.userId == "") {
                angular.element('#provide_email_dialog').dialog( "open" );
            } else {
                angular.element('#workingdialog').dialog( "open" );
                $scope.sendEmailConcierge($routeParams.listingId,$rootScope.userId, $rootScope.fullName, $rootScope.userPhone);
            }
        }

        $scope.onSubmitConcierge = function(user){

            $rootScope.fullName = user.fullname;
            $rootScope.userId = user.email;
            $rootScope.userPhone = user.phone;
            $scope.sendEmailConcierge($routeParams.listingId,$rootScope.userId, $rootScope.fullName, $rootScope.userPhone);
            angular.element('#provide_email_dialog').dialog( "close" );
            angular.element('#workingdialog').dialog( "open" );
            
        }

        
        $scope.onClickVerifyAvailability = function(){
            angular.element('#verifyavailabilitydialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"verifyavailability");
        }
        
        $scope.onClickExpertReview = function(){
            angular.element('#expertreviewdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"expertreview");
        }
        
        $scope.onClickTour = function(){
            angular.element('#tourdialog').dialog( "open" );
            $scope.saveClickOnDB($routeParams.listingId,$rootScope.userId ,"virtualtour");
        }
        
        $scope.openOriginalListingTab = function(){
            window.open($rootScope.selectedListing.url,'_blank');
        }
        
        $scope.redirecToListingList = function(){
            $location.path( "/listings/filter/"+$rootScope.currentListingFilter, false );
        }
        
        $scope.validateSelectedListing = function(){
            // always call listing detail from server to get images
            //if($rootScope.selectedListing == null){
                $scope.getDetailedListing($routeParams.listingId)
            //}
        }
        
        $scope.saveClickOnDB = function(listingid,useremail, option) {
            // dummy filters
            //var listingId = '542c3f86b43c2c00029a8211';
            url = ""

            if (typeof(useremail) === 'undefined' || useremail == "") {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/'+option;
            } else {
                url = 'http://byopapp-api-stage.herokuapp.com/listing/'+listingid+'/user/'+useremail+'/'+option;
            }
                
            var responsePromise = $http({
                //url: 'http://127.0.0.1:5000/listings/filter', 
                url: url,
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        }

        $scope.setRandomStarRating = function(listingsArray){
            for (var i = 0; i < listingsArray.length; i++) {
                listingsArray[i].relevance = $scope.getRandomInt(0,20);
            }
        }

        $scope.sendEmailConcierge = function(listingid, useremail, username, userphone) {
            // dummy filters
            //var listingId = '542c3f86b43c2c00029a8211';
            listing_url = $rootScope.selectedListing.url
                
            var responsePromise = $http({
                //url: 'http://127.0.0.1:5000/listings/filter', 
                url: 'http://byopapp-api-stage.herokuapp.com/conciergeEmail',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    email: useremail,
                    name: username,
                    phone: userphone,
                    listingurl: listing_url,
                    listingid: listingid
                }
            });
            console.log(responsePromise)
        }
        
        $scope.validateSelectedListing();
        
    }
]);