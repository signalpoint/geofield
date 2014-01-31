/**
 * Implements hook_field_formatter_view().
 */
function geofield_field_formatter_view(entity_type, entity, field, instance, langcode, items, display) {
  try {
    var element = {};
    $.each(items, function(delta, item){
        element[delta] = 'blah blah';
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
    
    // For a latitude/longitude widget, we create two text fields and a button
    // to get the current position and fill in the two text fields.
    if (instance.widget.type == 'geofield_latlon') {
      var lat = {
        id: items[delta].id + '-lat',
        title: 'Latitude',
        type: 'textfield'
      };
      var lng = {
        id: items[delta].id + '-lng',
        title: 'Longitude',
        type: 'textfield'
      };
      var options = {
        lat: lat.id,
        lng: lng.id
      };
      var btn = {
        id: items[delta].id + '-btn',
        text: 'Get current position',
        type: 'button',
        options: {
          attributes: {
            onclick: '_geofield_field_widget_form_click(\'' + lat.id + '\', \'' + lng.id + '\')'
          }
        }
      };
      items[delta].children.push(lat);
      items[delta].children.push(lng);
      items[delta].children.push(btn);
    }
    else {
      console.log('WARNING: geofield_field_widget_form() - widget type not supported! (' + instance.widget.type + ')');
    }
  }
  catch (error) { console.log('geofield_field_widget_form - ' + error); }
}

/**
 *
 */
function _geofield_field_widget_form_click(lat_id, lng_id) {
  try {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        $('#' + lat_id).val(position.coords.latitude);
        $('#' + lng_id).val(position.coords.longitude);
      },
      function(error) {
        console.log('_geofield_field_widget_form_click - getCurrentPosition - ' + error);
      },
      {
        enableHighAccuracy: true
      }
    );
  }
  catch (error) { console.log('_geofield_field_widget_form_click - ' + error); }
}

