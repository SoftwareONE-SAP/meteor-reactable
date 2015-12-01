# Reactable

A [Meteor](https://meteor.com) library for displaying reactive data in a HTML table. This library uses [React](https://facebook.github.io/react/) internally and exports a React component named **Reactable**. For projects which use Blaze templates, a helper template is also exported named **Reactable** so that you don't have to explicitly use React in your own project.

## Usage

###### React/JSX

```javascript
React.render(<Reactable {...config}/>, domLocation);
```

###### Blaze/Spacebars:

```
{{> Reactable config}}
```

As you might have guessed, all the magic happens in the "config" object.

## Minimal Example

Given a collection declared as follows:

```javascript
var people = new Mongo.Collection('people');

people.insert({
  forename: 'Mike',
  surname:  'Cardwell',
  rating:   10
});

people.insert({
  forename: 'Jean-Luc',
  surname:  'Picard',
  rating:   9
});
```

And a minimal Reactable configuration like this:

```javascript
var config = {
  source: {
    collection: people,
  },
  fields: [
    {
      name: 'forename',
      label: 'First Name',
    },
    {
      name: 'surname',
      label: 'Last Name',
    },
    {
      name: 'rating',
    }
  ],
};
```

Assuming a suitable subscription was in place to populate the "people" collection, the following reactive table would be produced:

First Name | Last Name | Rating
-----------|-----------|-------
Mike       | Cardwell  | 10
Jean-Luc   | Picard    | 9

## Configuration

The rest of this document explains all of the other configuration values which are available to make your reactive tables much more interesting/powerful.

### config.tableClasses [String | Array | Function]

This item provides the list of classes to add to the `<table/>` tag. If it is a string it is added as is. If it is an array of strings, they are joined with spaces before being added. If it is a function, it must return a string or array of strings to be used. When it is a function, it is called within the context of the ReactableTable render method so has access to the field definitions and row data. Example:

```javascript
var config = {
  tableClasses: "blue strong", // or:
  tableClasses: ["blue strong"], // or:
  tableClasses: function () {
    var classes = ["blue", "strong"];
    if (this.props.fields.length > 1) classes.push('multi-column');
    if (this.props.rows.length   > 1) classes.push('multi-rows');  
    return classes; // or classes.join(' ')
  }
}
```

### config.source [Object]

This object describes the source of the data for the table and is required

### config.source.collection [Object | Array]

This item is required. It can either be an instance of Mongo.Collection (as per the minimal example), or it can be a raw array containing javascript objects, e.g:

```javascript
var config = {
  source: {
    collection: [
      {
        forename: 'Mike',
        surname:  'Cardwell',
        rating:   10,
      }
    ]
  }
};
```

### config.source.subscribe [String | Function | Object]

Reactable can handle your data subscriptions, and it's usually a good idea to let it do so. In the simplest case you just provide it with the name of a publication:

```javascript
var config = {
  source: {
    subscribe: 'smart_people',
  }
};
```

Reactable will handle subscribing to and unsubscribing from the subscription named "smart_people" when the React component is mounted/unmounted. When Reactable has a handle to the subscription it can also make decisions based on whether or not the subscription is ready. For example, it can avoid re-rendering the component repeatedly as lots of data is transferred down the wire (if you choose so), or it can display a "Loading" graphic.

Rather than passing a string, you can just pass a subscription object directly:

```javascript
var config = {
  source: {
    subscribe: Meteor.subscribe('smart_people'),
  }
};
```

Because Reactable didn't create this subscription (it was created externally and passed through), the Reactable component is unable to unsubscribe when it is unmounted. Maybe this is exactly what you want? Just one to be aware of.

Perhaps you want Reactable to manage the subscription, but you want to pass additional arguments, or use a different DDP connection?

```javascript
var connection = DDP.connect('https://example.com/');
var config = {
  source: {
    subscribe: {
      name: 'smart_people',
      args: ['Hello', 'World'],
      context: connection,
    }
  }
};
```

Behind the scenes, this would do a `connection.subscribe('smart_people', 'Hello', 'World')`. You can set context to "Meteor" or leave it out altogether for a normal "Meteor.subscribe". "args" is also optional. If args is a function, it will be called and the return value used.

If source.subscribe is a function, it is called and the return value is used for any of the above cases. E.g:

```javascript
var config = {
  source: {
    subscribe: function () {
      // Any of these 3 are fine:
      return Meteor.subscribe('smart_people');
      return 'smart_people';
      return {
        name: 'smart_people',
        args: ['Hello', 'World'],
      };
    }
  }
}
```

### config.source.fields [Array]

This optional array contains a list of document keys which we wish to have access to. As with MongoDB you also get the _id. If the collection is an array rather than a Mongo collection and an _id doesn't exist, a fake one is added. Any key which has an entry in `config.fields` (discussed next) will automatically be in this list, so usually you don't need to specify it. One example of when you might need this functionality:

```javascript
var config = {
  source: {
    fields: ['sex'],
  },
  fields: [
    {
      name: 'name',
      classes: function (name, rowData) {
        return rowData.sex === 'male' ? 'blue' : 'pink';
      }
    },
  ]
}
```

In this example, there is no "sex" field, but we still need access to the content of the "sex" field in order to specify what class to use on the name field. Without `source.fields` we wouldn't have access to that data.

### config.fields [Array]

This item is an array of objects, where each object defines the contents of a table column. The order of the field definitions matches the order of the columns in the table. Each object can contain the following:

#### 1. label [String]

This is an optional string which contains the contents of the column header. So the following definition:

```javascript
var config = {
  fields: [
    { label: "First Name" },
    { label: "Last Name"  }
  ]
}
```

Would create the following table:

```html
<table>
  <thead>
    <tr>
      <th>First Name</th>
      <th>Last name</th>
    </tr>
  </thead>
</table>
```

#### 2. name [String]

This is an optional string that contains the name of a key in the MongoDB from which we want to retrieve the value to display in the table body. If "label" isn't supplied, then the table column header is derived from this value instead, replacing underscores with spaces and capitalizing the first letter of each word. So the following definition would create the exact same table as above:

```javascript
var config = {
  fields: [
    { name: "first_name" },
    { name: "last_name"  }
  ]
}
```

But would actually populate the table with data too.

#### 3. transform [Function]

This is an optional function which will transform a value before putting it into the table. For example, if you wanted to display everyones first name in capital letters:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      transform: function (fname, data) {
        return fname.toUpperCase();
      },
    }
  ]
}
```

The second argument "data" is an object containing all of the data for this row in case your transform relies on information from one of the other fields. For example, when determinining the value to go in the "first_name" column for a particular row, it might be called as follows:

```javascript
rowData = {
  first_name: 'Mike',
  last_name:  'Cardwell',
  rating:     10
};

var value = transform(rowData.first_name, rowData);
```

#### 4. tdClasses [String | Array | Function]

Optionally specify a list of classes to be added to the table body <td/> for this cell. If supplied an Array then it is joined with spaces. If supplied a Function, then that function is called with the cell value as the first argument and rest of the row data as the second argument. It must return either a String or an Array of Strings. For example:

```javascript
var config = {
  fields: [
    {
      name:    "first_name",
      classes: "blue strong", // or:
      classes: ["blue", "strong"], // or:
      classes: function (fname, rowData) {
          var classes = ["blue", "strong"];
          if (fname === 'Mike') classes.push('nice');
          if (rowData.last_name === 'Cardwell') classes.push('superb');
          return classes; // or classes.join(' ');
      }
    }
  ]
};
```

#### 5. thClasses [String | Array | Function]

Works the same as tdClasses, except for the table head <th/>. First argument for the function is the `field.name`, and second argument is the `field.label`

#### 6. td [React class]

If you want to override what is used for a particular fields table cell, you can create a React class and pass it through. Below is an example (using JSX) where we simply wrap the value that would have been placed in the cell with a `<strong/>` tag:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      td: React.createClass({
        render: function () {
          return (
            <td className={ this.props.classes }>
              <strong>{ this.props.value }</strong>
            </td>
          );
        }
      })
    }
  ]
}
```

`this.props.value` contains the value after it has been transformed. To get the original value or any of the other row data, you can access it from the object `this.props.row`. `this.props.classes` will only be populated if you have set something for `classes` in the field definition. Note, the root DOM element that you return from this React class **must** be a `<td/>`

#### 7. thInner [React class]

This works the same as `field.td` with a few differences. Firstly it applies to the column header <th/>. Secondly, it applies to contents **inside** the <th/>. So you should render a span or something else which is valid inside a <th/> rather than rendering a <th/> it's self. Props passed to the class include "name", "label" and also "title" which is calculated from the label if supplied and name if not. Here is an example where the column title is wrapped inside an anchor tag:

```javascript
var config = {
  fields: [
    {
      name: "first_name",
      thInner: React.createClass({
        render: function () {
          return (
            <a href={ '/wibble?name=' + this.props.name }>
              { this.props.title }
            </a>
          );
        }
      })
    }
  ]
}
```

## Global Configuration

#### Reactable.setFieldDefaults [Function]

This feature is useful when you find yourself writing a lot of boiler plate code in your field definitions to set custom templates or classes. Given the following example:

```javascript
var config = {
  fields: [
    {
      name: 'first_name',
      sortable: 1,
      classes: 'sortable',
      thInner: SortableHeader,
    },
    {
      name: 'last_name',
      sortable: 1,
      classes: 'sortable',
      thInner: SortableHeader,
    },
  ]
}
```

Wouldn't it be nice if you could just say that any field with a 'sortable' key automatically gets the 'sortable' class and uses the SortableHeader component for thInner? You can use setFieldDefaults to do this. It takes a callback function which takes a field as input and returns the replacement field. For example:

```javascript
Reactable.setFieldDefaults(function(field){

  if (field.sortable) {
    field.classes = 'sortable';
    field.thInner = SortableHeader;
  }

  return field;
});
```

**Be careful** when overwriting things like field.classes and field.thInner. Remember that they can potentially already be set and they could potentially contain different types.

setFieldDefaults can be called multiple times with multiple callbacks. They are each run in turn.
