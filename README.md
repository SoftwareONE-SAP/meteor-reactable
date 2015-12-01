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
      key: 'forename',
      label: 'First Name',
    },
    {
      key: 'surname',
      label: 'Last Name',
    },
    {
      key: 'rating',
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

### config.source

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

### config.fields [Array]

This item is an array of objects, where each object defines the contents of a table column. The order of the field definitions matches the order of the columns in the table. Each object can contain the following:

#### 1. label

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

#### 2. key

This is an optional string that contains the name of a key in the MongoDB from which we want to retrieve the value to display in the table body. If "label" isn't supplied, then the table column header is derived from this value instead, replacing underscores with spaces and capitalizing the first letter of each word. So the following definition would create the exact same table as above:

```javascript
var config = {
  fields: [
    { key: "first_name" },
    { key: "last_name"  }
  ]
}
```

But would actually populate the table with data too.

#### 3. transform

This is an optional function which will transform a value before putting it into the table. For example, if you wanted to display everyones first name in capital letters:

```javascript
var config = {
  fields: [
    {
      key: "first_name",
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
