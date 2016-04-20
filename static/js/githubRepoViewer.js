(function(){

	"use strict";

	var app = angular.module('githubRepoViewer', []);


	//The factory which will handle single repos details viewing 
	app.factory('repoFactory', ['githubAPI', 'searchFactory', function(githubAPI, searchFactory){

		var repoFactory = {

			//Will store repo object fetched from github
			repo : null,

			//Will store repoContributors fetched from gtihub
			repoContributors : null,

			//Will store 100 last commits
			lastCommits : null,

			//Will store the ranking per each users
			commitsRanking : null,

			//trigerred when a result is clicked
			openRepo : function(repo){

				this.repo = repo;

				console.log('repo:');
				console.log(repo);
				
				//Hiding results of search to get a proper view
				searchFactory.setHidden(true);

				//We fetch the contributors of the repo
				githubAPI.getRepoContributors(this.repo).then(function(result){
					//And save them in the factory
					this.repoContributors = result;
				}.bind(this));

				//And then fetch the last 100 commits of the repo
				githubAPI.getLastCommits(this.repo).then(function(result){
					
					//And save them in the factory
					this.lastCommits = result;

					//We now compute ranking of committers
					this.buildCommittersRanking();

				}.bind(this));

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
								name : this.lastCommits[i].committer.login
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

			}

		};

		return repoFactory;

	}]);

	//githubRepoViewer controller definition
	app.controller('githubRepoViewerController', ['$scope', 'repoFactory', function($scope, repoFactory){
		$scope.repoFactory = repoFactory;
	}]);

	//Main view which'll list repo search result and display the single repo stat view
	app.directive('githubRepoViewer', function(){
		return{
			restrict : 'E',
			templateUrl : 'github-repo-viewer.html',
			controller : 'githubRepoViewerController'
		};
	});

})();