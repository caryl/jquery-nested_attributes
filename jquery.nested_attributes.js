// Generated by CoffeeScript 1.4.0
(function() {
  var $, NestedAttributes, methods,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = jQuery;

  methods = {
    init: function(options) {
      var $el, instance;
      $el = $(this);
      if ($el.length > 1) {
        throw "Can't initialize more than one item at a time";
      }
      if ($el.data("nestedAttributes")) {
        throw "Can't initialize on this element more than once";
      }
      instance = new NestedAttributes($el, options);
      $el.data("nestedAttributes", instance);
      return $el;
    },
    add: function(callback) {
      var $el;
      if (callback == null) {
        callback = null;
      }
      $el = $(this);
      if ($el.data("nestedAttributes") == null) {
        throw "You are trying to call instance methods without initializing first";
      }
      $el.data("nestedAttributes").addItem(callback);
      return $el;
    }
  };

  $.fn.nestedAttributes = function(method) {
    if (methods[method] != null) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error("Method " + method + " does not exist on jQuery.nestedAttributes");
    }
  };

  NestedAttributes = (function() {

    NestedAttributes.prototype.settings = {
      collectionName: false,
      bindAddTo: false,
      removeOnLoadIf: false,
      collectIdAttributes: true,
      beforeAdd: false,
      afterAdd: false,
      beforeMove: false,
      afterMove: false,
      beforeDestroy: false,
      afterDestroy: false,
      destroySelector: '.destroy',
      deepClone: true
    };

    function NestedAttributes($el, options) {
      this.destroyClick = __bind(this.destroyClick, this);

      this.addClick = __bind(this.addClick, this);

      var _this = this;
      this.$container = $el;
      this.options = $.extend({}, this.settings, options);
      if (this.options.bindAddTo) {
        this.options.bindAddTo.click(this.addClick);
      }
      this.$items = this.$container.children();
      if (!this.options.collectionName) {
        this.autodetectCollectionName();
      }
      this.$items.each(function(i, el) {
        var $item;
        $item = $(el);
        if (_this.options.collectIdAttributes && $item.is('input')) {
          $item.appendTo($item.prev());
          _this.$items = _this.$items.not($item);
        }
        return _this.bindDestroy($item);
      });
      if (this.options.removeOnLoadIf) {
        this.$items.each(function(i, el) {
          $el = $(el);
          if ($el.call(true, _this.options.removeOnLoadIf, i)) {
            return $el.remove();
          }
        });
      }
    }

    NestedAttributes.prototype.autodetectCollectionName = function() {
      var match, pattern;
      pattern = /\[(.[^\]]*)_attributes\]/;
      try {
        match = pattern.exec(this.$items.first().find(':input[name]:first').attr('name'))[1];
        if (match !== null) {
          return this.options.collectionName = match;
        } else {
          throw "Regex error";
        }
      } catch (error) {
        return console.log("Error detecting collection name", error);
      }
    };

    NestedAttributes.prototype.addClick = function(event) {
      this.addItem();
      return event.preventDefault();
    };

    NestedAttributes.prototype.addItem = function(callback) {
      var $newClone, newIndex;
      if (callback == null) {
        callback = null;
      }
      newIndex = this.$items.length;
      $newClone = this.applyIndexToItem(this.extractClone(), newIndex);
      if (this.options.beforeAdd) {
        this.options.beforeAdd.call(void 0, $newClone, newIndex);
      }
      this.$container.append($newClone);
      if (this.options.afterAdd) {
        this.options.afterAdd.call(void 0, $newClone, newIndex);
      }
      this.refreshItems();
      if (callback) {
        return callback($newClone);
      }
    };

    NestedAttributes.prototype.extractClone = function() {
      var $record;
      if (this.$restorableClone) {
        $record = this.$restorableClone;
        this.$restorableClone = null;
      } else {
        $record = this.$items.first().clone(this.options.deepClone);
        if (!this.options.deepClone) {
          this.bindDestroy($record);
        }
        $record.find(':text, select').val('');
        $record.find(':checkbox, :radio').attr("checked", false);
        $record.find('input[name$="\\[id\\]"]').remove();
        $record.find('input[name$="\\[_destroy\\]"]').remove();
      }
      return $record.show();
    };

    NestedAttributes.prototype.applyIndexToItem = function($item, index) {
      var collectionName,
        _this = this;
      collectionName = this.options.collectionName;
      $item.find(':input[name]').each(function(i, el) {
        var $el, idRegExp, idReplacement, nameRegExp, nameReplacement, newID, newName;
        $el = $(el);
        idRegExp = new RegExp("_" + collectionName + "_attributes_\\d+_");
        idReplacement = "_" + collectionName + "_attributes_" + index + "_";
        nameRegExp = new RegExp("\\[" + collectionName + "_attributes\\]\\[\\d+\\]");
        nameReplacement = "[" + collectionName + "_attributes][" + index + "]";
        if ($el.attr('id')) {
          newID = $el.attr('id').replace(idRegExp, idReplacement);
        }
        newName = $el.attr('name').replace(nameRegExp, nameReplacement);
        return $el.attr({
          id: newID,
          name: newName
        });
      });
      $item.find('label[for]').each(function(i, el) {
        var $el, forRegExp, forReplacement, newFor;
        $el = $(el);
        try {
          forRegExp = new RegExp("_" + collectionName + "_attributes_\\d+_");
          forReplacement = "_" + collectionName + "_attributes_" + index + "_";
          newFor = $el.attr('for').replace(forRegExp, forReplacement);
          return $el.attr('for', newFor);
        } catch (error) {
          return console.log("Error updating label", error);
        }
      });
      return $item;
    };

    NestedAttributes.prototype.destroyClick = function(event) {
      var $destroyField, $el, $item, attributePosition, destroyFieldName, index, itemIsNew, otherFieldName;
      if (!(this.$items.length - 1)) {
        this.$restorableClone = this.extractClone();
      }
      if (!(this.$items.filter(':visible').length - 1)) {
        this.addItem();
      }
      $el = $(event.target);
      $item = $el.parentsUntil(this.$container.selector).last();
      index = this.indexForItem($item);
      itemIsNew = $item.find('input[name$="\\[id\\]"]').length === 0;
      if (this.options.beforeDestroy) {
        this.options.beforeDestroy.call(void 0, $item, index, itemIsNew);
      }
      if (itemIsNew) {
        $item.remove();
      } else {
        $item.hide();
        otherFieldName = $item.find(':input[name]:first').attr('name');
        attributePosition = otherFieldName.lastIndexOf('[');
        destroyFieldName = "" + (otherFieldName.substring(0, attributePosition)) + "[_destroy]";
        $destroyField = $("<input type=\"hidden\" name=\"" + destroyFieldName + "\" />");
        $item.append($destroyField);
        $destroyField.val(true).change();
      }
      if (this.options.afterDestroy) {
        this.options.afterDestroy.call($item, index, itemIsNew);
      }
      this.refreshItems();
      this.resetIndexes();
      return event.preventDefault();
    };

    NestedAttributes.prototype.indexForItem = function($item) {
      var name, regExp;
      regExp = new RegExp("\\[" + this.options.collectionName + "_attributes\\]\\[\\d+\\]");
      name = $item.find(':input[name]:first').attr('name');
      return parseInt(name.match(regExp)[0].split('][')[1].slice(0, -1), 10);
    };

    NestedAttributes.prototype.refreshItems = function() {
      return this.$items = this.$container.children();
    };

    NestedAttributes.prototype.resetIndexes = function() {
      var _this = this;
      return this.$items.each(function(i, el) {
        var $el, oldIndex;
        $el = $(el);
        oldIndex = _this.indexForItem($el);
        if (i === oldIndex) {
          return true;
        }
        if (_this.options.beforeMove) {
          _this.options.beforeMove.call($el, i, oldIndex);
        }
        _this.applyIndexToItem($el, i);
        if (_this.options.afterMove) {
          return _this.options.afterMove.call($el, i, oldIndex);
        }
      });
    };

    NestedAttributes.prototype.bindDestroy = function($item) {
      if (this.options.destroySelector) {
        return $item.find(this.options.destroySelector).click(this.destroyClick);
      }
    };

    return NestedAttributes;

  })();

}).call(this);
