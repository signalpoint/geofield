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
      var onchange = '_geofield_field_widget_form_change(this, \'' + items[delta].id + '\')';
      var lat_id = items[delta].id + '-lat';
      var lat = {
        id: lat_id,
        title: 'Latitude',
        type: 'textfield',
        options: {
          attributes: {
            id: lat_id,
            onchange: onchange
          }
        }
      };
      var lon_id = items[delta].id + '-lon';
      var lon = {
        id: lon_id,
        title: 'Longitude',
        type: 'textfield',
        options: {
          attributes: {
            id: lon_id,
            onchange: onchange
          }
        }
      };
      var options = {
        lat: lat.id,
        lon: lon.id
      };
      var btn = {
        id: items[delta].id + '-btn',
        text: 'Get current position',
        type: 'button',
        options: {
          attributes: {
            onclick: '_geofield_field_widget_form_click(\'' + lat.id + '\', \'' + lon.id + '\')'
          }
        }
      };
      items[delta].children.push(lat);
      items[delta].children.push(lon);
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
        $('#' + lat_id).val(position.coords.latitude);
        $('#' + lon_id).val(position.coords.longitude);
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
    field_key.use_key = false;
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

