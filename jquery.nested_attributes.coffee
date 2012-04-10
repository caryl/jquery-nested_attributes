$ = jQuery

$.fn.extend
  nestedAttributes: (options) ->
    throw "Can't initialize more than one item at a time" if $(@).length > 1
    return new NestedAttributes($(@), options)

class NestedAttributes

  settings:
    removeEmptyOnLoad: false
    collectionName: false
    bindAddTo: false
    removeOnLoadIf: false
    collectIdAttributes: true
    detectCollectionName: true
    beforeAdd: false
    afterAdd: false
    beforeMove: false
    afterMove: false
    beforeDestroy: false
    afterDestroy: false
    autoAdd: false
    destroySelector: '.destroy'

  ######################
  ##                  ##
  ##  Initialization  ##
  ##                  ##
  ######################

  constructor: ($el, options) ->

    # This plugin gets called on the container
    @$container = $el

    # Merge default options
    @options = $.extend({}, @settings, options)

    # If the user provided a jQuery object to bind the "Add"
    # bind it now or forever hold your peace.
    @options.bindAddTo.click(@addClick) if @options.bindAddTo

    # Cache all the items
    @$items = @$container.children()

    # Initialize existing items
    @$items.each (i, el) =>
      $item = $(el)

      # If the user wants us to attempt to collect Rail's ID attributes, do it now
      # Using the default rails helpers, ID attributes will wind up right after their
      # propper containers in the form.
      if @options.collectIdAttributes and $item.is('input')
        # Move the _id field into its proper container
        $item.appendTo($item.prev())
        # Remove it from the $items collection
        @$items = @$items.not($item)

      # Try to find and bind the destroy link if the user wanted one
      @bindDestroy($item)

    # Cache a clone
    @$clone = @extractClone()

    # Remove any items on load if the client implements a check and the check passes
    if @options.removeOnLoadIf
      @$items.each (i, el) =>
        $el = $(el)
        if $el.call(true, @options.removeOnLoadIf, i)
          $el.remove()


  ########################
  ##                    ##
  ##  Instance Methods  ##
  ##                    ##
  ########################

  addClick: (event) =>
    $el = $(event.target)

    # Piece together an item
    $newClone = @$clone.clone(true)
    newIndex = @$container.children().length
    @$clone = applyIndexToItem($newClone, newIndex)

    # Give the user a chance to make their own changes before we insert
    $newClone.call(@options.beforeAdd, newIndex) if (@options.beforeAdd)

    # Insert the new item
    @$container.append($newClone)

    # Give the user a chance to make their own chances after insertion
    $newClone.call(@options.afterAdd, newIndex) if (@options.afterAdd)

    # Remove this item from the items list
    @refreshItems()

    # Don't let the link do anything
    event.preventDefault()

  extractClone: ->
    # Make a deep clone (bound events and data)
    $record = @$items.first().clone(true)

    # Empty out the values
    $record.find(':input').val('')

    return $record

  applyIndexToItem: ($item, index) ->
    collectionName = @options.collectionName

    $item.find(':input').each (i, el) =>
      $el = $(el)

      idRegExp = new RegExp("_#{collectionName}_attributes_\\d+_")
      idReplacement = "_#{collectionName}_attributes_#{index}_"
      nameRegExp = new RegExp("\\[#{collectionName}_attributes\\]\\[\\d+\\]")
      nameReplacement = "[#{collectionName}_attributes][#{index}]"

      newID = $el.attr('id').replace(idRegExp, idReplacement)
      newName = $el.attr('name').replace(nameRegExp, nameReplacement)

      $el.attr
        id: newID
        name: newName

    $item.find('label').each (i, el) =>
      $el = $(el)

      forRegExp = new RegExp("_#{collectionName}_attributes_\\d+_")
      forReplacement = "_#{collectionName}_attributes_#{index}_"
      newFor = $el.attr('for').replace(forRegExp, forReplacement)
      $el.attr('for', newFor)

    return $item

  # Hides a item from the user and marks it for deletion in the
  # DOM by setting _destroy to true if the record already exists. If it
  # is a new escalation, we simple delete the item
  destroyClick: (event) =>
    $el = $(event.target)

    $item = $el.parentsUntil(@$container.selector).last();
    index = indexForItem($item);
    itemIsNew = $item.find('input[name$="\\[id\\]"]').length == 0

    $item.call(@options.beforeDestroy, index, itemIsNew) if (@options.beforeDestroy)

    if (itemIsNew)

      $item.remove()

    else

      # Hide the item
      $item.hide()

      # Add the _destroy field
      otherFieldName = $item.find(':input:first').attr('name');
      attributePosition = otherFieldName.lastIndexOf('[');
      destroyFieldName = "#{otherFieldName.substring(0, attributePosition)}[_destroy]"
      $destroyField = $("<input type=\"hidden\" name=\"#{destroyFieldName}\" />")
      $item.append($destroyField)
      $destroyField.val(true).change()

    $item.call(@options.afterDestroy, index, itemIsNew) if (@options.afterDestroy)

    # Remove this item from the items list
    @refreshItems()

    # Rename the remaining items
    @resetIndexes()

    event.preventDefault()

  indexForItem: ($item) ->
    regExp = new RegExp("\\[#{@options.collectionName}_attributes\\]\\[\\d+\\]")
    name = $item.find(':input:first').attr('name')
    return parseInt(name.match(regExp)[0].split('][')[1].slice(0, -1), 10)

  refreshItems: ->
    @$items = @$container.children()

  # Sets the proper association indices and labels to all items
  # Used when removing items
  resetIndexes: ->
    $items.each (i, el) =>
      $el = $(el)

      # Make sure this is actually a new position
      oldIndex = indexForItem($el)
      return true if (i == oldIndex)

      $el.call(@options.beforeMove, index, oldIndex) if (@options.beforeMove)

      # Change the number to the new index
      @applyIndexToItem($el, index)

      $el.call(@options.afterMove, index, oldIndex) if (@options.afterMove)

  bindDestroy: ($item) ->
    $item.find(@options.destroySelector).click(@destroyClick) if (@options.destroySelector)