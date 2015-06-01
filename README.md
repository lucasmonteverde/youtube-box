# [Youtube Box](http://youtube-box.herokuapp.com)
### A Youtube Subscriptions Box

A new way to visualize your Subscriptions

#Why?

Youtube has disabled V2 API and with this the "New Subscription Videos Feed" has stopped work

Now, There is no way to keep update with your subscriptions outside Youtube, like a  RSS Feed 

So, I created this project, It's an update from Youtube subscription center, with some features:

 - It generates again a feed that you can plug to your favorite rss reader>
 - You can see older videos from your subscribed channels ( youtube just keeps them for 2 week )
 - Search, filter, sort your videos list
 - It is open source!
 - and many more when it's developed...

## Pre-Requesites
 - MongoDB
 - Redis
 - Youtube Data API


Environment Variables `.env`

```sh
MONGODB
REDIS_URL
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
YOUTUBE_API_KEY
```

# TODO
- notification of new videos
- ignore list based on filters ( and mark as watch too )


## LICENSE

[The MIT License (MIT)](https://github.com/lucasmonteverde/youtube-box/blob/master/LICENSE)