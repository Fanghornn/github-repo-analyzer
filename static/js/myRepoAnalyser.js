(function(){

	"use strict";

	var app = angular.module('myRepoAnalyser', ['ngRoute', 'githubModule', 'githubRepoViewer']);

	//Initializing route configuration for specific repo viewing
	app.config(['$routeProvider',function($routeProvider){

		$routeProvider.when('/repoviewer/:owner/:repo/:view', {

			templateUrl : 'github-repo-viewer.html',
			controller: 'githubRepoViewerController'

		}).otherwise({
			redirectTo : '/'
		});

	}]);

	//Global factory
	app.factory('globalFactory', function(){

		var globalFactory = {

			alertMsg : null,

			alertLvl : null,

			saveRepo : function(repo){
				//Create repo object for his unique ID
				window.localStorage.repositories[repo.id] = {
					//and save repo object
					repo:repo
				};
			},
			
			addRepoData : function(repoId, key, data){
				window.localStorage.repositories[repoId][key] = data;
			},

			/**
			 * [displayAlert display an alert in the main view]
			 * 
			 * @param  {[string]} message 		[The message to display]
			 * @param  {[string]} lvl     		['error || warning || notice']
			 * 
			 * @return {[undefined]}
			 */
			displayAlert : function(message, lvl){

				this.alertMsg = message;
				this.alertLvl = 'alert-' + lvl; 

			},

			/**
			 * [discardAlert discard the alert hurr durr ]
			 * 
			 * @return {[undefined]}
			 */
			discardAlert : function(){
				this.alertMsg = null;
				this.alertLvl = null;
			}

		};

		return globalFactory;

	});

	//The factory which will handle searching through github and keep results in memory
	app.factory('searchFactory', ['githubAPI', '$location', function(githubAPI, $location){

		var searchFactory = {

			//will keep the results returned from github API
			results:[],

			//Linked with the text input value in the form
			pattern : null,

			//Keep page number in memory
			//Can be altered directly in the DOM
			page : null,

			//Keep last page computed in memory for a search pattern
			lastPage : null,

			//Toggle search results view display
			hidden:false,

			setHidden : function(val){
				this.hidden = val;
			},

			//Launch the search 
			submitForm : function(pageIndicator){

				//Return if text input is empty
				if(!this.pattern){
					return;
				}

				//Reset url path
				$location.url('/');

				//in case the result list has been previously disabled
				searchFactory.setHidden(false);

				//Handling the page number wanted
				if(!pageIndicator){
					//Default search through search bar
					this.page = 1;

				}else{

					//Nav scrollers
					if(pageIndicator === '+'){

						//Return user wants to go further and is already on last result page
						if(this.page === this.lastPage){
							return;
						}else{
							this.page++;
						}

					}else if(pageIndicator === '-'){
						
						//Return if user wants to go previous on first result page
						if(this.page === 1){
							return;
						}else{
							this.page--;
						}
					}

					//Reset previous search result before the new request
					this.results = [];


				}

				//Request repo resource for a list with the pattern from the input
				githubAPI.getRepositories(this.pattern, this.page).then(function(result){
					
					//Storing result
					this.results = result.items;
					
					//Computing last page if submitting from search bar
					if(!pageIndicator){					
						this.lastPage = Math.ceil(result.total_count / 30);
					}

				}.bind(this));

			}

		};

		return searchFactory;

	}]);

	//Global app controller
	app.controller('myRepoAnalyserController', ['$scope', 'globalFactory', 'searchFactory', function($scope, globalFactory, searchFactory){
		$scope.globalFactory = globalFactory;
		$scope.searchFactory = searchFactory;
	}]);

	//gihtub-searcher directive definition
	app.directive('githubSearcher', function(){
		return{
			restrict : 'E',
			templateUrl : 'github-searcher.html',
			controller : 'myRepoAnalyserController'
		};
	});

})();