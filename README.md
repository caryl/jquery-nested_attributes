# jQuery plugin for Rails Nested Attributes

jQuery plugin that makes it easy to dynamically add and remove records when using ActiveRecord's nested attributes.

## Installation

This will one day be a gem so it's nice and simple to install and manage updates for. Until that day, this is how you install:

### Rails 3.1+ asset pipeline

1. Download your flavor of jquery.nested_attributes (JS or Coffee)
2. Add it to vendor/assets/javascripts
3. Include it in your app's JS manifest

## Usage

### Markup

```html
<div id="container">
  <%= form.fields_for :collection do |collection_fields| %>
    <div>
      <%= collection_fields.label :field_name %>
      <%= collection_fields.text_field :field_name %>
      <a href="#" class="destroy">×</a>
    </div>
  <% end %>
</div>
<a href="#" id="add_another">+ add another</a>
```

All immediate descendants of #container (children) will be considered sets of
nested attributes. Don't add anything else as immediate descendents.

### JavaScript (in its simplest form)

```javascript
$("#container").nestedAttributes({
  bindAddTo: $("#add_another")
});
```

## Options (defaults shown)

```javascript
{
  collectionName: false,         // If not provided, we will attempt to autodetect. Provide this for complex collection names
  bindAddTo: false,              // Required. The single DOM element that when clicked will add another set of fields
  removeOnLoadIf: false,         // Function. It will be called for each existing item, return true to remove that item
  collectIdAttributes: true,     // Attempt to collect Rail's ID attributes
  beforeAdd: false,              // Function. Callback before adding an item
  afterAdd: false,               // Function. Callback after adding an item
  beforeMove: false,             // Function. Callback before updating indexes on an item
  afterMove: false,              // Function. Callback after updating indexes on an item
  beforeDestroy: false,          // Function. Callback before destroying an item
  afterDestroy: false,           // Function. Callback after destroying an item
  destroySelector: '.destroy',   // Pass in a custom selector of an element in each item that will destroy that item when clicked
  deepClone: true                // Do you want jQuery to deep clone the element? Deep clones preserve events. Undesirable when using BackBone views for each element.
}
```

## API

### Adding an item

Should you need to add an item programatically (rather than when the user clicks
the bindAddTo element), jquery.nestedAttributes exposes an add method for this.

```javascript
$('#container').nestedAttributes("add");
```