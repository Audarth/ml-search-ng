/* global describe, beforeEach, module, it, expect, inject, jasmine */

describe('ml-results', function () {
  'use strict';

  var elem, $scope, $compile, $rootScope, $templateCache;

  var results = [
    { uri: '/docs/doc1.xml' },
    { uri: '/docs/doc2.xml' },
    { uri: '/docs/doc3.xml' }
  ];

  beforeEach(module('ml.search'));
  beforeEach(module('ml.search.tpls'));

  beforeEach(inject(function ($injector) {
    $rootScope = $injector.get('$rootScope');
    $compile = $injector.get('$compile');

    $scope = $rootScope.$new();
    $scope.results = results;

    elem = angular.element('<ml-results results="results"></ml-results>');

    $compile(elem)($scope);
    $scope.$digest();
  }));

  describe('#defaults', function () {

    beforeEach(function() {
      elem = angular.element('<ml-results results="results"></ml-results>');
      $compile(elem)($scope);
      $scope.$digest();
    });

    it('should repeat for each result', function() {
      expect( elem.find('> div').length ).toEqual( results.length );
    });

    it('should create a default link property', function() {
      _.each(results, function(result) {
        expect( result.link ).toBeDefined();
        expect( result.link ).toEqual( '/detail?uri=' + encodeURIComponent( result.uri ) );
      });
    });

    it('should create a default label property', function() {
      _.each(results, function(result) {
        expect( result.label ).toBeDefined();
        expect( result.label ).toEqual( result.uri.split('/')[2] );
      });
    });

    it('should use label as title', function() {
      expect(elem.find('h4 a')[0].innerHTML).toEqual('doc1.xml');
    });

    it('should handle falsy matches', function() {
      results.push({
        uri: "/docs/doc4.xml",
        matches: [{
          path: 'fn:doc("/docs/doc4.xml")/elem',
          'match-text': [{ highlight: 0 }]
        }]
      });

      $scope.$digest();

      expect(
        angular.element(
          angular.element(
            elem.find('> div').get(3)
          ).find('.matches em span')[0]
        ).text()
      ).toMatch(/^\s*0\s*$/)
    });
  });

  describe('#link-function', function () {

    beforeEach(function() {
      $scope.linkTarget = jasmine.createSpy('linkTarget');

      elem = angular.element('<ml-results results="results" link="linkTarget(result)"></ml-results>');
      $compile(elem)($scope);
      $scope.$digest();
    });

    it('should call custom link function', function() {
      expect( $scope.linkTarget ).toHaveBeenCalled();
      expect( $scope.linkTarget.calls.count() ).toEqual( results.length );
    });
  });

  describe('#click-function', function () {

    beforeEach(function() {
      $scope.clickTarget = jasmine.createSpy('clickTarget');

      elem = angular.element('<ml-results results="results" click="clickTarget(result)"></ml-results>');
      $compile(elem)($scope);
      $scope.$digest();
    });

    it('should not call custom click function', function() {
      expect( $scope.clickTarget ).not.toHaveBeenCalled();
    });

    it('should handle clicks', function() {
      angular.element(elem.find('a')[0]).click();

      expect( $scope.clickTarget ).toHaveBeenCalled();
      expect( $scope.clickTarget.calls.count() ).toEqual(1);
      expect( $scope.clickTarget.calls.mostRecent().args[0] ).toEqual( results[0] );
    });
  });

  describe('#label-function', function () {

    beforeEach(function() {
      $scope.label = jasmine.createSpy('label');

      elem = angular.element('<ml-results results="results" label="label(result)"></ml-results>');
      $compile(elem)($scope);
      $scope.$digest();
    });

    it('should call custom label function', function() {
      expect( $scope.label ).toHaveBeenCalled();
      expect( $scope.label.calls.count() ).toEqual( results.length );
    });

    it('should use URI as title if label is falsy', function() {
      expect(elem.find('h4 a')[0].innerHTML).toEqual('/docs/doc1.xml');
    });
  });

  describe('#custom-template', function () {

    beforeEach(inject(function($injector) {
      $templateCache = $injector.get('$templateCache');
      $templateCache.put( '/my-template.html', '<div class="custom-results"></div>' );

      elem = angular.element( '<ml-results results="results" template="/my-template.html"></ml-results>' );
      $compile(elem)($scope);
      $scope.$digest();
    }));

    it('should contain template', function() {
      expect(elem.find('.custom-results').length).toEqual(1);
    });

  });

});
