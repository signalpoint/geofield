/**
 * Implements hook_field_formatter_view().
 */
function geofield_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var element = {};
    // Determine the format.
    var format = display.settings.format;
    if (format != 'decimal_degrees') {
      console.log('geofield_field_formatter_view - Format not supported! (' + format + ')');
      return element;
    }
    // Iterate over each item and assemble the element.
    $.each(items, function(delta, item) {
        var markup =
        '<p>' + t('Latitude') + ': ' + entity[field.field_name][langcode][delta].lat + '<br />' +
        t('Longitude') + ': ' + entity[field.field_name][langcode][delta].lon + '</p>';
        element[delta] = {
          markup: markup
        };
    });
    return element;
  }
  catch (error) { console.log('geofield_field_formatter_view - ' + error); }
}

/**
 * Implements hook_field_widget_form().
 */
function geofield_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
  try {

    // Convert the form element to a hidden field since we'll populate it with
    // values dynamically later on.
    items[delta].type = 'hidden';

    // Make sure the widget is supported.
    var supported_widgets = [
      'geofield_latlon',
      'geofield_openlayers',
      'geofield_gmap',
      'leaflet_widget_widget',
      'geolocation_googlemap'
    ];
    if (!in_array(instance.widget.type, supported_widgets)) {
      console.log('WARNING: geofield_field_widget_form() - widget type not supported! (' + instance.widget.type + ')');
      return;
    }

    // If we have an existing value, add it to the element.
    if (items[delta].item) {
      items[delta].value = items[delta].item.lat + ',' + items[delta].item.lon;
    }

    // For a latitude/longitude widget, we create two text fields and a button
    // to get the current position and fill in the two text fields.
    var onchange = '_geofield_field_widget_form_change(this, \'' + items[delta].id + '\')';
    var lat_id = items[delta].id + '-lat';
    var lat = {
      id: lat_id,
      title: t('Latitude'),
      type: 'textfield',
      options: {
        attributes: {
          id: lat_id,
          onchange: onchange,
          value: items[delta].item ? parseFloat(items[delta].item.lat).toFixed(7) : ''
        }
      }
    };
    var lon_id = items[delta].id + '-lon';
    var lon = {
      id: lon_id,
      title: t('Longitude'),
      type: 'textfield',
      options: {
        attributes: {
          id: lon_id,
          onchange: onchange,
          value: items[delta].item ? parseFloat(items[delta].item.lon).toFixed(7) : ''
        }
      }
    };
    var options = {
      lat: lat.id,
      lon: lon.id
    };
    var btn = {
      id: items[delta].id + '-btn',
      text: t('Get current position'),
      type: 'button',
      options: {
        attributes: {
          onclick: '_geofield_field_widget_form_click(\'' + lat.id + '\', \'' + lon.id + '\')'
        }
      }
    };
    items[delta].children.push(btn);
    items[delta].children.push(lat);
    items[delta].children.push(lon);

  }
  catch (error) { console.log('geofield_field_widget_form - ' + error); }
}

/**
 *
 */
function _geofield_field_widget_form_change(textfield, input) {
  try {
    // Depending on which textfield just changed values, grab the other one as
    // well, then build the lat,lon value for the hidden input.
    var which = $(textfield).attr('id');
    var other = which;
    if (which.indexOf('-lat') != -1) { other = which.replace('-lat', '-lon'); }
    else {
      other = which.replace('-lon', '-lat');
      var swap = other;
      other = which;
      which = swap;
    }
    var value = $('#' + which).val() + ',' + $('#' + other).val();
    $('#' + input).val(value);
  }
  catch (error) { console.log('_geofield_field_widget_form_change - ' + error); }
}

/**
 *
 */
function _geofield_field_widget_form_click(lat_id, lon_id) {
  try {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        // Place the coordinate values into the text fields, then force a change
        // event to fire.
        $('#' + lat_id).val(position.coords.latitude);
        $('#' + lon_id).val(position.coords.longitude).change();
      },
      function(error) {
        console.log('_geofield_field_widget_form_click - getCurrentPosition', error);

        // Process error code.
        switch (error.code) {

           // PERMISSION_DENIED
          case 1:
            break;

          // POSITION_UNAVAILABLE
          case 2:
            break;

          // TIMEOUT
          case 3:
            break;

        }
      },
      {
        enableHighAccuracy: true
      }
    );
  }
  catch (error) { console.log('_geofield_field_widget_form_click - ' + error); }
}

/**
 * Implements hook_assemble_form_state_into_field().
 */
function geofield_assemble_form_state_into_field(entity_type, bundle,
  form_state_value, field, instance, langcode, delta, field_key) {
  try {
    if (empty(form_state_value)) { return null; }
    var coordinates = form_state_value.split(',');
    if (coordinates.length != 2) { return null; }
    // We don't want to use a key for this item's value.
    field_key.value = 'geom';
    // Return the assembled value.
    return {
      lat: coordinates[0],
      lon: coordinates[1]
    };
  }
  catch (error) {
    console.log('geofield_assemble_form_state_into_field - ' + error);
  }
}

/**
 * Implements hook_field_formatter_view().
 */
function geofield_map_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    /*dpm(field);
    dpm(instance);
    dpm(items);
    dpm(langcode);
    dpm(display);*/
    var page_id = drupalgap_get_page_id();
    // Determine the format.
    var element = {};
    var type = display.type;
    if (type != 'geofield_map_map') {
      console.log('geofield_map_field_formatter_view - unsupported type! (' + type + ')');
      return element;
    }
    $.each(items, function(delta, item) {
        var container_id = geofield_map_container_id(
          entity_type,
          entity[entity_primary_key(entity_type)],
          field.field_name,
          delta
        );
        var map_attributes = {
          id: container_id,
          style:
            'width: ' + display.settings.geofield_map_width + '; ' +
            'height: ' + display.settings.geofield_map_height
        };
        element[delta] = {
          markup: '<div ' + drupalgap_attributes(map_attributes) + '></div>' +
            drupalgap_jqm_page_event_script_code({
                page_id: page_id,
                jqm_page_event: 'pageshow',
                jqm_page_event_callback: 'geofield_map_field_formatter_view_pageshow',
                jqm_page_event_args: JSON.stringify({
                    container_id: container_id,
                    settings: display.settings,
                    lat: item.lat,
                    lon: item.lon
                })
            }, '' + delta)
        };
    });
    return element;
  }
  catch (error) { console.log('geofield_map_field_formatter_view - ' + error); }
}

/**
 *
 */
function geofield_map_field_formatter_view_pageshow(options) {
  try {
    //dpm(options);
    
    var myLatlng = new google.maps.LatLng(options.lat, options.lon);
    
    // Set the map's options.
    var mapOptions = {
      center: myLatlng,
      zoom: 12,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      },
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    };
    
    // Initialize the map.
    var geofield_map = new google.maps.Map(
      document.getElementById(options.container_id),
      mapOptions
    );
    setTimeout(function() {
        google.maps.event.trigger(geofield_map, 'resize');
        geofield_map.setCenter(myLatlng);
    }, 500);
    
    // Add a marker for the user's current position.
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: geofield_map,
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
  }
  catch (error) { console.log('geofield_map_field_formatter_view_pageshow - ' + error); }
}

/**
 *
 */
function geofield_map_container_id(entity_type, entity_id, field_name, delta) {
  try {
    return 'geofield_map_container_' + entity_type + '_' + entity_id + '_' + field_name + '_' + delta;
  }
  catch (error) { console.log('geofield_map_container_id - ' + error); }
}

/**
 * Implements hook_locale().
 */
function geofield_locale() {
  // Tell DrupalGap we have custom Spanish and Italian translations to load.
  return ['it', 'zh_hant', 'zh_hans', 'de'];
}
