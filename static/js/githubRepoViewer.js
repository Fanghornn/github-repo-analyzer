(function(){

	"use strict";

	var app = angular.module('githubRepoViewer', []);

	//The factory which will handle single repos details viewing 
	app.factory('repoFactory', ['githubAPI', 'searchFactory', 'globalFactory', function(githubAPI, searchFactory, globalFactory){

		var repoFactory = {

			//Will store repo object fetched from github
			repo : null,

			//Will store repoContributors fetched from gtihub
			repoContributors : null,

			//Will store 100 last commits
			lastCommits : null,

			//Will store the ranking per each users
			commitsRanking : null,

			//Will store failed API access
			failed : {},

			//initialize all the data about a repo
			openRepo : function(owner, repo){

				//If an another repo has been browsed previously, we reset the factory memory
				if(this.repo){
					this.resetFootPrints();
				}
				
				//We first fetch the repo definition from the github API
				githubAPI.getSingleRepository(repo, owner).then(function(singleRepoResult){
					console.log(singleRepoResult);
					//Keep the repo definition in an attribute
					this.repo = singleRepoResult;

					//Hiding results of search to get a proper view
					searchFactory.setHidden(true);

					//We now fetch the contributors of the repo
					githubAPI.getRepoContributors(this.repo).then(function(repoContributorsResult){

						//And save them in the factory
						this.repoContributors = repoContributorsResult;

					}.bind(this), function(http){

						this.failed.committers = true;

						this.handleError(http);

					}.bind(this));

					//And then fetch the last 100 commits of the repo
					githubAPI.getLastCommits(this.repo).then(function(lastCommitsResult){
						
						//And save them in the factory
						this.lastCommits = lastCommitsResult;

						//We now compute ranking of committers
						this.buildCommittersRanking();

					}.bind(this), function(http){

						this.failed.lastcommits = true;

						this.handleError(http);

					}.bind(this));

				}.bind(this), function(http){

					this.failed.repo = true;

					this.handleError(http);

				});

			},

			/**
			 * [buildCommittersRanking Build the commiters ranking in term of number of commits for the 100 ladts ]
			 * 
			 * @return {[undefined]} 		[Set the ranking in a class attribute]
			 */
			buildCommittersRanking : function(){

				//Initialisation as an empty object
				var listObject = {};

				//Itterate through the 100 last commits
				for(var i = 0; i < this.lastCommits.length; i++){

					//If there is a committer 
					if(this.lastCommits[i].committer !== null){
						
						//and that comitter hasn't been record yet
						if( !listObject[this.lastCommits[i].committer.id] ){
							
							//We add him in our listObject
							listObject[this.lastCommits[i].committer.id] = {
								counter : 1,
								user : this.lastCommits[i].committer
							};

						}else{
					
							listObject[this.lastCommits[i].committer.id].counter++;
					
						}
					}

				}

				//Now that we each user's commit count,
				//we put them in an array
				var listArray = [];

				for(var idUser in listObject){
					listArray.push(listObject[idUser]);
				}

				//And sort this array in the order of commits count DSC
				listArray.sort(function(a,b){
					if( a.counter < b.counter ){
						return 1;
					}
					if( a.counter > b.counter ){
						return -1;
					}
					return 0;
				});

				//We now have the ordered array in the factory for this repo
				this.commitsRanking = listArray;

			},

			/**
			 * [resetFootPrints reset factory attributes]
			 * @return {[undefined]}
			 */
			resetFootPrints : function(){
				this.repo = null;
				this.repoContributors = null;
				this.lastCommits = null;
				this.commitsRanking = null;
				this.failed = {};
			},

			/**
			 * [handleError triggered when an http errors occurs in the promise]
			 * 
			 * @param  {[object]} http [$http helper from angulr]
			 * @return {[undefined]}
			 */
			handleError : function(http){
				
				var errorMsg;
				
				//When error occurs (e.g forbidden repo access
				if(http && http.data && http.data.message){
					errorMsg = http.data.message;
					globalFactory.displayAlert(errorMsg, 'danger');
				}
			}

		};

		return repoFactory;

	}]);

	//githubRepoViewer controller definition
	app.controller('githubRepoViewerController', ['$scope', '$routeParams', 'repoFactory', '$location', function($scope, $routeParams, repoFactory, $location){

		$scope.repoFactory = repoFactory;

		//Fetching url params
		var owner = $routeParams.owner;
		var repo = $routeParams.repo;

		//If we don't already have fetched all the data for this repo
		if( !(repoFactory.repo && repoFactory.repo.full_name === owner + '/' + repo) ){
			//We launch the repo computing process with url params
			repoFactory.openRepo(owner, repo);
		}		

		//Setting data view 
		if($routeParams.view && ($routeParams.view === 'committers' || $routeParams.view === 'ranking' || $routeParams.view === 'lastcommits') ){
			$scope.displayMode = $routeParams.view;
		}else{
			//Default view
			$scope.displayMode = 'committers';
			$location.url( $location.url() + '/committers' );
		}

	}]);

})();