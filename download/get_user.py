import scrapy

user_posts = 'https://www.reddit.com/user/{username}/subitted'
user_comments = 'https://www.reddit.com/user/{username}/comments'

class RedditUserPostSpider(scrapy.Spider):
    name = 'reddituserpost'

    def start_request(self):
        url = user_posts.format(username=self.username)
        yield scrapy.Request(url, self.parse)

    def parse(self, response):
        for post in response.xpath('//p[@class="title"]'):
            yield {
                'title': post.extract(),
            }
