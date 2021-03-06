// TODO: THIS FILE IF TEMPORARILY OVERRIDING THE MODEL. KILL IT WITH FIRE ONCE EMBER MAPBOX COMPOSER IS UPDATED

import Model from 'ember-data/model';
import { attr, hasMany } from '@ember-decorators/data';
import { mapBy } from '@ember-decorators/object/computed';
import { computed } from '@ember-decorators/object';

/**
  Model for layer groups.
  Describes a collection of layers which are references here as a has-many relationship.
  Delegates state of certain properties, like visiblity, to child layers.
  Includes other helpful metadata.
  @public
  @class LayerModel
*/
export default class LayerGroupModel extends Model.extend({}) {
  @hasMany('layer', { async: false }) layers

  /**
    Abstraction for the visibility state of related layers. Mutations will fire updates to child layers.
    Simple modifies a property of the MapboxGL `layout` style property. Does not add or remove layers.
    @property visible
    @type Boolean
  */
  @attr('boolean', { defaultValue: true }) visible

  /**
    This property describes the visibility state
    of the associated layers. Layer groups can have:
      - singleton layers (only one or none layers are visible)
        the top-most layer is on by default
      - multi (many may be visible or none)
      - binary (all are visible or none are visible)
    @property layerVisibilityType
    @type String('singleton', 'multi', 'binary')
  */
  @attr('string', { defaultValue: 'binary' }) layerVisibilityType
  @attr() legend
  @attr('string') meta

  /**
    Convenience property for a list of internal MapboxGL layer IDs.
    @property layerIds
    @type Array
  */
  @mapBy('layers', 'id') layerIds;

  // singleton only
  @computed('layers.@each.visibility')
  get selected() {
    return this.get('layers').findBy('visibility', true);
  }
  set selected(id) {
    this.get('layers').setEach('visibility', false);
    this.get('layers').findBy('id', id).set('visibility', true);
  }

  /**
    This method finds a related layer and overwrites its paint object
    @method setPaintForLayer
    @param {String|Number} id ID of the layer-group's layer
    @param {Object} paint MapboxGL Style [paint](https://www.mapbox.com/mapbox-gl-js/style-spec/#layer-paint) object to override
  */
  setPaintForLayer(...args) {
    this._mutateLayerProperty('paint', ...args);
  }

  /**
    This method finds a related layer and overwrites its filter array
    @method setFilterForLayer
    @param {String|Number} id ID of the layer-group's layer
    @param {Object} filter MapboxGL Style [expressions array](https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions) to override
  */
  setFilterForLayer(...args) {
    this._mutateLayerProperty('filter', ...args);
  }

  /**
    This method finds a related layer and overwrites its layout object
    @method setLayoutForLayer
    @param {String|Number} id ID of the layer-group's layer
    @param {Object} layout MapboxGL Style [layout](https://www.mapbox.com/mapbox-gl-js/style-spec/#layout-property) object to override
  */
  setLayoutForLayer(...args) {
    this._mutateLayerProperty('layout', ...args);
  }

  /**
    This method hides all layers and shows only one
    @method showOneLayer
    @param {String|Number} id ID of the layer-group's layer
  */
  showOneLayer(id) {
    this.get('layers').forEach((layer) => {
      if (layer.get('id') === id) {
        layer.set('layout', {}/* visible */);
      }

      layer.set('layout', {}/* not visible */);
    });
  }

  /**
    This method generically mutates a property on a related layer
    @method _mutateLayerProperty
    @private
    @param {String|Number} property of the layer-group's layer
    @param {String|Number} layerID ID of the layer-group's layer
    @param {Object} value Value of Layer to override
  */
  _mutateLayerProperty(property, layerID, value) {
    const foundLayer = this.get('layers').findBy('id', layerID);
    if (!foundLayer) throw Error('No related layer with this ID.');

    foundLayer.set(property, value);
  }
}
