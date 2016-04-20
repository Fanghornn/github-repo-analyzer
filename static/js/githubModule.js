(function(){

	var app = angular.module('githubModule', ['ngResource']);

	/**
	 * [githubResources The service that will provide an angular resource for any type of data we need
	 * 					from github]
	 * 					
	 * @param  {[object]} 	$resource     [angular-resource]
	 * @return {[object]}                 [the github resources]
	 */
	app.service('githubResources', ['$resource', function($resource){

		this.rootUrl = 'https://api.github.com/';

		//the github repositories resource
		this.repositories = $resource(this.rootUrl + 'search/repositories');

		//the repository contributors resource 
		this.repoContributors = $resource(this.rootUrl + 'repos/:owner/:repo/contributors', {
			owner : '@owner',
			repo : '@repo'
		}, {
			get : { method:'GET',isArray: true}
		});

		//the 100 last commits resource
		this.lastCommits = $resource(this.rootUrl + 'repos/:owner/:repo/commits', {
			owner : '@owner',
			repo : '@repo',
			per_page : '100'
		}, {
			get : { method:'GET', isArray:true}
		});

	}]);

	/**
	 * [githubAPI factory]
	 * A global factory to request the githubAPI at any time in the workFlow
	 */
	app.service('githubAPI', ['githubResources', function(githubResources){

		var self = this;

		/**
		 * [getRepositories return a promise which will fetch repositories from github API with given search pattern]
		 * 
		 * @param  {[string]} 	searchPattern 	[the search pattern that repositories should match]
		 * @param  {[type]} 	Page Number 	[The page number of result]
		 * 
		 * @return {[object]}    	          	[Promise of the results]
		 */
		this.getRepositories = function(searchPattern, page){

			return githubResources.repositories.get({
				q : searchPattern,
				page : page
			}).$promise;

		};

		/**
		 * [getRepoContributors return a promise which will fetch contributors of given owner & repo from github API]
		 * 
		 * @param  {[object]}	 repo 		[repo informations]
		 * 
		 * @return {[promise]}       		[A promise of the results]
		 */
		this.getRepoContributors = function(repo){

			return githubResources.repoContributors.get({
				owner:repo.owner.login,
				repo:repo.name
			}).$promise;

		};

		/**
		 * [getLastCommits return a promise which will fetch the 100 last commits of a given repo from the github API]
		 * 
		 * @param  {[object]}	 repo 		[repo informations]
		 * 
		 * @return {[promise]}       		[A promise of the result]
		 */
		this.getLastCommits = function(repo){

			return githubResources.lastCommits.get({
				owner:repo.owner.login,
				repo:repo.name
			}).$promise;

		};

	}]);

})();