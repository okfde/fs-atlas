# -*- coding: utf-8 -*-
import scrapy


class ReddituserSpider(scrapy.Spider):
    name = 'reddituser'
    allowed_domains = ['reddit']
    start_urls = ['http://reddit/']

    def parse(self, response):
        pass
