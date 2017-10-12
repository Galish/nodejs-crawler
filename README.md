NodeJS-crawler
===================

### Task

Implement a system consisting of 3 micro services:
- One service crawls web pages (http://x7bwsmcore5fmx56.onion/) on the dark web (via a tor connection) and submits the results on a message bus (RabbitMQ)
- The second service stores the pages in a Redis database and queries + matches documents based on an internal query language (see below)
- Matched documents are streamed (pushed) to the 3rd service: the frontend service
- The frontend service offers a Websocket channel to deliver the messages to a simple html page.


### How to run the app

```
npm i

#run amqp, redis, tor, polipo
npm run environment

#run client app
npm run client

#run indexer micro service
npm run indexer

#run crawler micro service
npm run crawler
```