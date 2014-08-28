geofield
========

The Geofield module for DrupalGap.

Cordova Plugin
==============

You must install this plugin with Cordova:

  cordova-plugin-geolocation.git

Geofield Map
============

DrupalGap supports the Geofield Map format on your field's display settings. To
work properly, make sure you:

1. included the Google Maps API V3 snippet in the `head` of your index.html file:

```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js"></script>
```

2. Then visit the `Manage Display` page for your content type, and change your Geofield's `Format` to `Geofield Map`, for example:

```
admin/structure/types/manage/article/display/drupalgap
```
