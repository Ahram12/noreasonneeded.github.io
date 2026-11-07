# Local preview environment for the blog.
#
# Pinned to the same Ruby as .ruby-version, which is also what GitHub
# Actions uses. Keeping all three in step is what stops "works locally,
# fails in CI" — the exact problem that broke the first deploy.
FROM ruby:3.4.1-slim

# build-essential: most gems here ship prebuilt binaries, but a few C
# extensions (bigdecimal, via activesupport) still compile from source.
# git: Jekyll shells out to it to read repository metadata.
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential git \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/jekyll

# Not load-bearing: the base image already sets GEM_HOME to this same
# directory, so gems land here either way. Stated explicitly because
# docker-compose.yml mounts a named volume over this exact path, and a
# silent change to it upstream would break that mount.
ENV BUNDLE_PATH=/usr/local/bundle

# Copied separately from the rest of the site: this layer is only
# rebuilt when the dependencies actually change, not on every edit.
COPY Gemfile Gemfile.lock ./
RUN bundle install

# 4000 serves the site, 35729 is the LiveReload channel.
EXPOSE 4000 35729

CMD ["bundle", "exec", "jekyll", "serve", \
     "--host", "0.0.0.0", \
     "--livereload", \
     "--force_polling"]
