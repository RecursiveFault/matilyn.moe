---
layout: layouts/base.njk
title: About
permalink: /about/
---
{% from "macros/box.njk" import box %}
{% call box("■ About") %}

This is a Markdown page. Write normally here and it'll pick up the box styling.

- Box titles use ■ / ▶ markers
- Keep paragraphs short and dense
- ※ Notes like this are very on-theme

{% endcall %}
