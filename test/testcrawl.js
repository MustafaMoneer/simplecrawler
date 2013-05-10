// Runs a very simple crawl on an HTTP server
// This is more of an integration test than a unit test.

var chai = require("chai");
    chai.should();

var testserver = require("./lib/testserver.js");

describe("Test Crawl",function() {

	var Crawler	= require("../");

	// Create a new crawler to crawl this server
	var localCrawler = new Crawler("127.0.0.1","/",3000),
		asyncCrawler = new Crawler("127.0.0.1","/",3000);
	var linksDiscovered = 0;

	it("should be able to be started",function(done) {

		localCrawler.on("crawlstart",function() { done() });

		localCrawler.start();
		localCrawler.running.should.be.truthy;
	});

	it("should have a queue with at least the initial crawl path",function() {

		localCrawler.queue.length.should.be.greaterThan(0);
	});

	it("should discover all linked resources in the queue",function(done) {
		
		localCrawler.on("fetchcomplete",function() {
			linksDiscovered ++;
		});

		localCrawler.on("complete",function() {
			linksDiscovered.should.equal(6);
			done();
		});
	});
	
	it("should support async event listeners for manual discovery",function(done) {
		
		// Use a different crawler this time
		asyncCrawler.discoverResources = false;
		asyncCrawler.queueURL("http://127.0.0.1:3000/async-stage1");
		asyncCrawler.start();
		
		asyncCrawler.on("fetchcomplete",function(queueItem,data,res,evtDone) {
			console.log("fetch complete");
			setTimeout(function(){
				linksDiscovered ++;
				console.log("timeout function loaded");
				if (String(data).match(/complete/i))
					return evtDone();
					
				// Taking advantage of the fact that for these, the sum total
				// of the body data is a URL.
				asyncCrawler.queueURL(String(data));
				
				// evtDone();
				
			},250);
		});
	
		asyncCrawler.on("complete",function() {
			linksDiscovered.should.equal(9);
			done();
		});
	});

	// TODO

	// Test how simple error conditions, content types, and responses are handled.

	// Test encodings.

	// Test URL detection

	// Test handling binary data

	// Test bad content length

});
