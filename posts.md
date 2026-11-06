---
layout: default
title: Posts
---

<section class="hero">
    <h1>Posts</h1>
    <p class="hero__lede">
        Everything published so far, newest first.
    </p>
</section>

<ul class="post-list">
    {% for post in site.posts %}
        {% include post-card.html post=post %}
    {% endfor %}
</ul>
