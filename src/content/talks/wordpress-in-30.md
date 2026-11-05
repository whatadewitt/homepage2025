---
title: "WordPress in 30 Minutes"
event: "REDspace Tech Share"
date: 2023-11-22
summary: "…or your pizza is free. WordPress from a developer's point of view: the five building blocks (hooks, posts, taxonomies, meta and the REST API) and which plugins are worth it."
---

<!-- Draft from the slides. Swap in your own notes. The deck's REDspace
     confidentiality footer and its last two slides were removed for the site. -->

You are going to know WordPress.\* *(\*More than you know about it now… from a
development perspective… not a legally binding statement.)*

**What is WordPress?**

Humble beginnings to internet powerhouse. An open source CMS released in 2003
as a blogging platform, with pages in 2005 and custom post types in 2009. It's
built on PHP and MySQL, backed by Automattic, and powers over a third of the
sites on the internet (a lot of them dead or unmaintained, obviously).

Why use it, not necessarily in this order: user management, open source,
secure, easy for users, excellent documentation, a huge plugin and theme
ecosystem, and it's extensible.

**The five building blocks of WordPress development**

**1. The hook system.** Hooks drive everything; all the code runs off them.
There are two kinds:

- **Actions** run code at a particular point in WordPress's execution.
- **Filters** modify content before it moves on down the pipeline.

Filters return data; actions don't.

```php
function red_do_init_action_hook_code() {
  // custom code goes here
}
add_action( 'init', 'red_do_init_action_hook_code' );

function red_add_quotes_to_content( $c ) {
  return "\"{$c}\"";
}
add_filter( 'the_content', 'red_add_quotes_to_content' );
```

**2. Posts.** Everything is a post. *Everything is a post.* A blog post is a
post, a page is a post (a hierarchical one, with parents and children), and
your content is going to be a post. `post_type` defines what kind, and you can
add your own with `register_post_type` or a plugin (be careful with plugins).
Understand that all your content is a post at some level, and you've learned
something very important about how WordPress works under the hood.

**3. Taxonomies.** A fancy word for categories. They classify posts. Categories
(hierarchical) and tags (not) ship with WordPress, you can create your own, and
you can query posts by them directly.

**4. Meta.** This is where a lot of the developer power is: custom key/value
data stored with a post, and with taxonomies and users too.

```php
add_post_meta( $post_id, 'key', $value );
update_post_meta( $post_id, 'key', $value );
delete_post_meta( $post_id, 'key' );
get_post_meta( $post_id, 'key' );
```

Quick note: `get_post_meta` returns an array by default. If a key only ever
holds one value, pass `true` to get the value itself:
`get_post_meta( $post_id, 'key', true )`.

Sitewide meta are called **options**, and options with an expiration are
**transients**. Same key/value idea, without the array behaviour.

**5. The REST API.** WordPress as JSON. It lets applications read and write
your content, so you can keep WordPress's friendly admin UI as a headless CMS
behind a front end that isn't PHP. It's also cleaner than `wp_ajax` for pulling
content, and it's built on hooks too.

**Plugins: work smarter, not harder**

Some plugins make your life easier. Others say they will and then slow down
your site, fight with your custom hooks and hurt the user experience. Plenty of
the popular ones are worth their weight in gold; plenty are pure rubbish, and
you're better off writing a simple hook.

Luke's list of approved plugins (if they cause an issue, tell them someone else
told you to install them):

- **Advanced Custom Fields Pro.** What can't it do? It now covers custom post
  types too.
- **WP Offload S3.** Pushes file uploads to S3 automatically.
- **Custom Post Type UI.**
- **WPGraphQL.** Exposes your content through a GraphQL endpoint.

WordPress is easy. Tell 'em, Wash.
