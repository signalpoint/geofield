geofield
========

The Geofield module for DrupalGap.

# Cordova Plugin

When using this feature on an actual mobile device, you must install this plugin with Cordova:

```
cordova-plugin-geolocation.git
```

# Geofield Map Support

*Step 1*

Include the Google Maps API V3 snippet in the `head` of your index.html file:

```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js"></script>
```

*Step 2*

Visit the `Manage Display` page for your content type, and switch to the `DrupalGap` tab.

Then change your Geofield's `Format` option to `Geofield Map`, for example:

```
Structure -> Content types -> Articles -> Manage display -> DrupalGap
admin/structure/types/manage/article/display/drupalgap
```
